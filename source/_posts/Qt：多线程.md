---
title: Qt：多线程
date: 2026-10-04
categories:
  - Qt
---

# Qt：多线程

> **Qt 客户端里的多线程，最核心的目的通常不是“提高吞吐量”，而是“不要把 UI 线程卡死”。**

### Qt 里为什么需要多线程？

Qt GUI 程序本质上有一个非常重要的线程：**主线程 / GUI 线程**。

像这些东西一般都跑在主线程：

- `QApplication::exec()` 事件循环
- 鼠标、键盘事件
- 窗口刷新
- 按钮点击
- `paintEvent`
- 大部分 QWidget 操作

如果你在按钮槽函数里直接做一个耗时任务：

```C++
void MainWindow::on_btn_clicked()
{
    doHeavyWork();   // 执行 10 秒
}
```

这 10 秒期间，主线程一直被 `doHeavyWork()` 占着，Qt 的事件循环没法继续处理消息。

结果就是：

```
点击按钮
   ↓
进入槽函数
   ↓
耗时任务执行 10 秒
   ↓
UI 事件循环无法运行
   ↓
窗口无法刷新
按钮无法点击
窗口拖不动
系统显示“未响应”
```

所以客户端多线程最典型的结构是：

```
GUI 主线程
│
├─ 处理 UI
├─ 响应用户操作
├─ 更新界面
│
└──── 发任务 ────> 工作线程
                    │
                    ├─ 文件处理
                    ├─ 算法计算
                    ├─ 模型推理
                    ├─ 数据加载
                    └─ 耗时业务逻辑
                         │
                         └── signal ──> GUI线程更新界面
```

------

## Qt 中常见的两种多线程方式

Qt 最核心的是 `QThread`。

但这里有个面试里很容易被问到的问题：

> **QThread 对象本身不等于“工作对象运行在这个线程”。**

常见有两种写法。

### 第一种：继承 `QThread`

```C++
class WorkerThread : public QThread
{
protected:
    void run() override
    {
        // 耗时任务
        doSomething();
    }
};
```

使用：

```c++
auto thread = new WorkerThread(this);
thread->start();
```

`start()` 之后，Qt 创建新的线程，然后执行：

```c++
WorkerThread::run()
```

这种方式比较直观，适合：

- 一次性任务
- 简单后台计算
- 对事件循环没什么需求的线程

但是在实际 Qt 项目里，更推荐第二种。

------

## 推荐方式：`QObject + moveToThread`

定义 Worker：

```C++
class Worker : public QObject
{
    Q_OBJECT

public slots:
    void doWork()
    {
        // 耗时操作
        for (int i = 0; i < 100; ++i) {
            QThread::msleep(50);
            emit progress(i);
        }

        emit finished();
    }

signals:
    void progress(int value);
    void finished();
};
```

然后：

```C++
QThread* thread = new QThread;
Worker* worker = new Worker;

worker->moveToThread(thread);

connect(thread, &QThread::started,
        worker, &Worker::doWork);

connect(worker, &Worker::progress,
        this, &MainWindow::updateProgress);

connect(worker, &Worker::finished,
        thread, &QThread::quit);

connect(worker, &Worker::finished,
        worker, &QObject::deleteLater);

connect(thread, &QThread::finished,
        thread, &QObject::deleteLater);

thread->start();
```

这里实际结构是：

```
MainWindow                    Worker
GUI线程                       工作线程
   │                            │
   │ signal                     │
   ├───────────────────────────>│
   │                            │ doWork()
   │                            │
   │         progress signal    │
   │<───────────────────────────┤
   │                            │
updateProgress()
```

这也是 Qt 非常经典的：**信号槽 + 工作线程**模式。

### 原理：QObject 的线程归属

每个`QObject`内部记录了一个`thread`指针，代表**这个对象依附于哪个线程的事件循环**。

- 当信号槽使用 **Qt::QueuedConnection（跨线程默认）**：信号不会直接调用槽函数，而是包装成`QEvent`，丢到**接收者对象所属线程**的事件队列里，等该线程事件循环去执行。
- `moveToThread(obj, thread)` 修改的就是 obj 内部这个`thread`指针。

 **不是对象跑到另一个线程的栈 / 堆；对象内存地址不变。 而是：事件、队列槽函数，交给目标线程的 exec () 去调度。**

------

# 为什么客户端特别适合这种模式？

因为客户端和服务器关注的点不一样。

可以这样对比：

|            | 客户端                                 | 服务器                      |
| ---------- | -------------------------------------- | --------------------------- |
| 最核心目标 | UI 流畅、及时响应                      | 吞吐量、并发量              |
| 主线程职责 | GUI 事件循环                           | accept / event loop / 调度  |
| 多线程原因 | 防止耗时任务阻塞 UI                    | 同时处理大量请求            |
| 常见任务   | 文件加载、算法、推理、数据库、设备通信 | 网络连接、业务请求、CPU任务 |
| 常见模型   | GUI线程 + Worker线程                   | 线程池 / Reactor / 协程     |

所以两边虽然都使用多线程，但是**出发点明显不同**。

------

# Qt 客户端最常见的多线程场景

假设做一个 C++/Qt 工业软件，会非常容易碰到下面这些。

### 1. 大文件加载

例如打开一个大型模型：

```
点击“打开工程”
       ↓
读取几百 MB 文件
       ↓
解析 Mesh
       ↓
构造 VTK 数据
       ↓
显示模型
```

错误做法：

```C++
void MainWindow::openProject()
{
    loadHugeFile();
    parseMesh();
}
```

如果这些全部在 GUI 线程：UI卡死 5秒

更合理的是：

```
GUI线程
   │
   ├─ 显示 Loading...
   │
   └─ 启动 Worker
          │
          ├─ loadFile()
          ├─ parse()
          └─ emit finished(data)
                    ↓
GUI线程更新模型
```

这在 Qt 工业客户端里非常常见。

------

### 2. 算法计算

例如：

```
有限元计算
图像处理
点云处理
路径规划
数据分析
```

假设：`result = calculateFEM(mesh);`需要 20 秒。如果放在主线程，客户端直接“假死”。

所以通常：

```
UI线程
   ↓
提交计算任务
   ↓
Worker Thread
   ↓
计算
   ↓
signal
   ↓
UI展示结果
```

------

### 3. AI / 模型推理

比如工业视觉程序：

```
相机取图
  ↓
预处理
  ↓
TensorRT / ONNX 推理
  ↓
后处理
  ↓
UI显示检测框
```

推理可能一次需要几十毫秒甚至几百毫秒。如果直接放 GUI 线程：每推理一次 UI 就卡几十~几百 ms

特别是连续检测：30 FPS Camera 不断推理 UI 很容易彻底卡掉。

因此典型结构：

```
GUI Thread

 Camera Thread
      ↓
Inference Thread
      ↓
Result
      ↓
GUI Thread
```

例如：

```
相机线程：负责采图

推理线程：负责 TensorRT

GUI线程：负责画框 / 显示图片
```

------

### 4. 设备通信

工业客户端尤其常见。

比如：

```
Qt 客户端
   ↓
PLC
相机
机械臂
串口设备
TCP设备
```

经常会有独立线程：

```
GUI线程
│
├── PLC通信线程
├── 相机线程
├── 推理线程
└── 数据处理线程
```

例如 PLC：

```C++
while (running) {
    readPLC();
    emit dataUpdated(data);
    QThread::msleep(100);
}
```

GUI 只负责：

```C++
void MainWindow::updatePLCData(Data data)
{
    ui->temperature->setText(...);
}
```

------

### 5. 数据库 / 磁盘 IO

例如用户点击：`打开历史数据`需要查十万条数据库记录。如果直接：`query.exec(...);` 然后处理大量结果，UI 可能卡住。

因此也经常：

```
GUI
 ↓
Database Worker
 ↓
查询
 ↓
signal
 ↓
GUI展示
```

不过 Qt 有一个很重要的注意点：

> **数据库连接通常不能随便跨线程使用。**

比如：`QSqlDatabase` 一般应该：哪个线程使用 → 哪个线程创建自己的连接；而不是主线程创建一个数据库连接，再扔给 Worker。

------

# 那网络 IO 一定要单独线程吗？

这里反而很值得注意。

**不一定。**

Qt 本身就是典型的事件驱动框架：

```C++
QTcpSocket
QNetworkAccessManager
QTimer
```

本身都是异步的。

例如：

```C++
QNetworkReply* reply = manager->get(request);

connect(reply, &QNetworkReply::finished,
        this, [] {
            ...
        });
```

此时你并没有阻塞：

```
GUI Thread
   │
发送 HTTP
   ↓
立即返回
   │
继续处理 UI
   │
网络完成
   ↓
Qt Event Loop
   ↓
finished signal
```

所以：

> **不要看到网络请求就机械地创建一个线程。**

这是 Qt 和很多传统同步服务器代码一个很大的区别。

------

# Qt 中还有一个非常重要的概念：线程亲和性

Qt 的 `QObject` 有：

> Thread Affinity

即一个 QObject 属于某个线程。

可以查看：

```
obj->thread();
```

移动线程：

```
worker->moveToThread(thread);
```

例如：

```
Worker
  │
  └── affinity → Thread B
```

那么它的槽函数通过 queued signal 被调用时：

```
Thread B Event Loop
        ↓
调用 Worker::doWork()
```

这就是为什么：

```
worker->moveToThread(thread);
```

这么重要。

------

# 跨线程 signal-slot 是怎么工作的？

Qt 多线程最好理解的一点就是：

```
Thread A                    Thread B

emit signal()
     │
     │
     ↓
Qt 把调用包装成 Event
     │
     └──────────────> Thread B Event Queue
                              │
                              ↓
                         Event Loop
                              │
                              ↓
                           slot()
```

也就是说跨线程时，通常不是：

```
signal -> 直接调用 slot
```

而是：

```
signal
 ↓
事件入队
 ↓
目标线程事件循环
 ↓
slot
```

这就是：

```
Qt::QueuedConnection
```

因此 Qt 很适合：

> **线程之间通过消息通信，而不是直接共享数据。**

------

# 为什么 QWidget 不能在工作线程里操作？

这是 Qt 面试里非常常见的问题。

例如下面通常是不允许的：

```
void Worker::doWork()
{
    ui->label->setText("hello"); // 错误
}
```

原因是 QWidget 不是线程安全的，GUI 对象必须在 GUI 线程操作。

正确方式：

```
emit progressChanged(50);
```

然后：

```
connect(worker, &Worker::progressChanged,
        this, [this](int value) {
            ui->progressBar->setValue(value);
        });
```

执行路径：

```
Worker Thread
     │
 emit signal
     ↓
GUI Event Queue
     ↓
GUI Thread
     ↓
setValue()
```

------

# 和服务器线程模型做一个最直观的比较

服务器可能是：

```
             Server
               │
            accept
               │
        ┌──────┼──────┐
        ↓      ↓      ↓
     Thread1 Thread2 Thread3
        ↓      ↓      ↓
     Client1 Client2 Client3
```

核心问题：

```
怎么同时服务 10万连接？
```

所以关心：

```
线程池
Reactor
epoll
协程
锁竞争
上下文切换
吞吐量
```

而 Qt 客户端更常见：

```
                   GUI Thread
                       │
          ┌────────────┼─────────────┐
          ↓            ↓             ↓
      Camera       Algorithm       PLC
      Thread        Thread        Thread
          │            │             │
          └────────────┼─────────────┘
                       ↓
                   signal-slot
                       ↓
                     GUI
```

核心问题变成：怎么保证 UI 始终流畅？

> **服务器端使用多线程，通常是为了提高并发处理能力和吞吐量；而 Qt 客户端使用多线程，最主要是把耗时操作从 GUI 主线程中剥离出去，避免阻塞事件循环。比如文件解析、算法计算、模型推理、相机采集、PLC 通信等工作通常放到工作线程，而 GUI 线程只负责界面响应和展示。线程之间尽量通过 Qt 的信号槽机制通信，避免工作线程直接操作 QWidget。**
