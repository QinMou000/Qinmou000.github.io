# Qt：锁和条件变量

> **Qt 的锁和条件变量，和 C++ 标准库本质上解决的是同一类线程同步问题；区别主要在 API 风格、和 Qt 事件机制/对象体系的融合程度，以及可移植性和使用习惯上。**

可以直接把它们一一对应起来：

| Qt                | C++ 标准库                           |
| ----------------- | ------------------------------------ |
| `QMutex`          | `std::mutex`                         |
| `QRecursiveMutex` | `std::recursive_mutex`               |
| `QReadWriteLock`  | `std::shared_mutex`                  |
| `QMutexLocker`    | `std::lock_guard / std::unique_lock` |
| `QWaitCondition`  | `std::condition_variable`            |
| `QSemaphore`      | `std::counting_semaphore`（C++20）   |

------

## 1. `QMutex` 和 `std::mutex`

基本用法几乎一样。

Qt：

```
QMutex mutex;

mutex.lock();
// 临界区
mutex.unlock();
```

C++：

```
std::mutex mutex;

mutex.lock();
// 临界区
mutex.unlock();
```

都不推荐手动 `lock/unlock`，因为中途异常或 `return` 容易忘记解锁。

Qt 一般配：

```
QMutex mutex;

void func()
{
    QMutexLocker locker(&mutex);

    // 临界区
}
```

作用域结束自动解锁。
对应 C++：

```
std::mutex mutex;

void func()
{
    std::lock_guard<std::mutex> locker(mutex);

    // 临界区
}
```

所以：

```
QMutexLocker
≈
std::lock_guard
```

不过 `QMutexLocker` 还支持主动：

```
locker.unlock();
locker.relock();
```

所以它功能上也有点像：

```
std::unique_lock
```

------

# 2. `QWaitCondition` 和 `std::condition_variable`

这两个概念几乎完全一样。

典型场景：

> 消费者线程发现队列为空，不要 while 死循环，而是睡眠等待；生产者放入数据后唤醒消费者。

Qt：

```
QMutex mutex;
QWaitCondition condition;
QQueue<int> queue;
```

消费者：

```
void consume()
{
    mutex.lock();

    while (queue.isEmpty()) {
        condition.wait(&mutex);
    }

    int data = queue.dequeue();

    mutex.unlock();
}
```

生产者：

```
void produce(int data)
{
    mutex.lock();

    queue.enqueue(data);

    mutex.unlock();

    condition.wakeOne();
}
```

对应 C++：

```
std::mutex mutex;
std::condition_variable cv;
std::queue<int> queue;
```

消费者：

```
void consume()
{
    std::unique_lock<std::mutex> lock(mutex);

    cv.wait(lock, [] {
        return !queue.empty();
    });

    int data = queue.front();
    queue.pop();
}
```

生产者：

```
void produce(int data)
{
    {
        std::lock_guard<std::mutex> lock(mutex);
        queue.push(data);
    }

    cv.notify_one();
}
```

两者机制完全一致：

```
线程拿到锁
   ↓
发现条件不满足
   ↓
wait()
   ↓
原子地：
释放锁 + 进入睡眠
   ↓
其他线程修改条件
   ↓
wakeOne / notify_one
   ↓
线程被唤醒
   ↓
重新抢锁
   ↓
再次检查条件
```

这里有个非常重要的面试点：

> **条件变量不是用来“保护数据”的，锁才是；条件变量只是负责让线程高效等待某个条件成立。**

------

# 3. Qt 条件变量一个明显区别：API 更 Qt 风格

`QWaitCondition`：

```
condition.wait(&mutex);
```

直接把 `QMutex*` 传进去。

而标准库：

```
std::unique_lock<std::mutex> lock(mutex);
cv.wait(lock);
```

为什么标准库一定要求 `unique_lock`？

因为 `condition_variable::wait()` 内部需要反复：

```
unlock mutex
↓
sleep
↓
wakeup
↓
lock mutex
```

因此它需要一个“可解锁又可重新加锁”的 lock 对象。

`std::lock_guard` 不行，因为：

```
std::lock_guard
```

只能构造时上锁、析构时解锁，不能主动 `unlock()`。

所以标准条件变量通常搭配：

```
std::unique_lock
```

Qt 把这一层包装掉了：

```
QWaitCondition::wait(QMutex*)
```

内部直接处理 mutex。

------

# 4. Qt 和 C++ 锁能不能混着用？

可以，但通常：

> **一个模块里尽量统一。**

比如纯业务库：

```
core/
algorithm/
network protocol/
SDK/
```

更推荐：

```
std::mutex
std::condition_variable
```

因为它们：

- 不依赖 Qt
- 标准 C++
- 更方便以后脱离 Qt
- 服务端和客户端代码都能复用

而 Qt 客户端强相关代码：

```
UI
QObject Worker
QThread
Qt 数据结构
```

用：

```
QMutex
QWaitCondition
```

也完全合理。

例如你写：

```
C++ Agent SDK
```

我肯定优先推荐：

```
std::mutex
std::condition_variable
```

而不是让 SDK 依赖 Qt。

如果是：

```
Qt 工业客户端
```

本来项目已经深度依赖 Qt，`QMutex` 没什么问题。

------

# 5. Qt 还有一个很常见的 `QReadWriteLock`

这个对应：

```
std::shared_mutex
```

适合：

> **读多写少**

例如某个全局配置：

```
QReadWriteLock lock;
QMap<QString, QVariant> config;
```

读：

```
lock.lockForRead();

auto value = config["ip"];

lock.unlock();
```

多个线程可以同时读：

```
Thread A ─┐
Thread B ─┼── 同时获得 read lock
Thread C ─┘
```

但是写的时候：

```
lock.lockForWrite();
```

必须独占：

```
Thread A 读  ─┐
Thread B 读  ─┤
              X
Thread C 写  等待
```

RAII 写法：

```
QReadLocker locker(&lock);
```

和：

```
QWriteLocker locker(&lock);
```

对应 C++：

```
std::shared_lock<std::shared_mutex>
```

和：

```
std::unique_lock<std::shared_mutex>
```

------

# 6. Qt 多线程其实经常“不需要锁”

这个反而是 Qt 和普通 C++ 多线程思维一个很重要的区别。

普通 C++ 可能写：

```
Thread A
Thread B
   ↓
共享同一块数据
   ↓
mutex
```

而 Qt 更推荐：

```
Thread A
   │
 signal(data)
   ↓
Thread B Event Queue
   ↓
slot(data)
```

也就是：

> **尽量通过消息传递数据，而不是让两个线程直接共享状态。**

比如 Worker 做完推理：

```
emit resultReady(result);
```

然后 UI：

```
connect(worker, &Worker::resultReady,
        this, &MainWindow::showResult);
```

此时如果 `result` 是值传递：

```
Worker Thread
      ↓
Qt Event Queue
      ↓
GUI Thread
```

很多情况下根本不需要 mutex。

这实际上是一种很好的并发设计思想：

```
共享内存 + mutex
```

转变为：

```
消息传递 + event queue
```

所以 Qt 项目里如果你看到到处都是 mutex

反而应该警惕：

> 是不是线程之间共享了太多可变状态？

------

# 7. 什么时候 Qt 里确实需要锁？

例如多个线程真的共享一个资源。

假设：

```
class ResultCache {
public:
    QMap<int, Result> cache;
    QMutex mutex;
};
```

Camera Thread：

```
写 cache
```

Inference Thread：

```
读 cache
```

Storage Thread：

```
读/删 cache
```

那就需要锁。

又比如 TensorRT。

假设你只有一个：

```
IExecutionContext* context;
```

多个工作线程：

```
Thread 1 ─┐
Thread 2 ─┼──> context->enqueueV3()
Thread 3 ─┘
```

而这个 context 不是线程安全的。

那就：

```
QMutex mutex;

void infer(...)
{
    QMutexLocker locker(&mutex);

    context->enqueueV3(...);
}
```

这里锁保护的是：

> **非线程安全共享资源。**

------

# 8. 条件变量最经典的实际用途

比如做相机 + 推理：

```
Camera Thread
      ↓
  Frame Queue
      ↓
Inference Thread
```

错误方案：

```
while (running) {
    if (!queue.empty()) {
        process(queue.front());
    }
}
```

这是：

> busy waiting，忙等。

没有图片的时候 CPU 也一直循环，可能直接吃掉一个 CPU 核。

正确方案：

```
Camera Thread
      │
      │ push frame
      ↓
Frame Queue
      │
      │ wakeOne()
      ↓
Inference Thread
```

没有帧：

```
Inference Thread
      ↓
wait()
      ↓
sleep
```

新帧来了：

```
Camera
 ↓
push
 ↓
wakeOne
 ↓
Inference Thread 被唤醒
```

这就是条件变量最典型的价值。

> **Qt 的 `QMutex`、`QWaitCondition` 和 C++ 标准库里的 `std::mutex`、`std::condition_variable` 本质上解决的是同样的同步问题，底层最终也会依赖操作系统提供的线程同步原语。主要区别是 API 和框架集成。比如 Qt 使用 `QMutexLocker` 做 RAII，`QWaitCondition::wait()` 可以直接接受 `QMutex`；标准库通常用 `std::unique_lock` 配合 `condition_variable`。**
>
> **在 Qt 客户端里，我一般不会一上来就使用锁。如果线程之间可以通过 signal-slot 和 queued connection 传递数据，我会优先使用消息传递，减少共享状态。只有多个线程确实需要访问共享资源，比如任务队列、缓存或者非线程安全的推理 context 时，才使用 mutex；如果还需要等待“队列非空”这类条件，则配合条件变量，避免 busy waiting。**