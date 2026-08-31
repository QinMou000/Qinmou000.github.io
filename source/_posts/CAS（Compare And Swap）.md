---
title: CAS（Compare And Swap）
date: 2026-08-23
categories:
  - C++
---

# CAS（Compare And Swap）

**比较并交换（Compare And Swap）**：只有当内存里的值还是我预期的那个值时，才把它改成新值。

CAS 是 Compare And Swap，核心是比较内存当前值和期望值，如果相等就更新为新值，否则更新失败。比较和交换整个过程由 CPU 保证原子性，所以可以在不加互斥锁的情况下实现线程安全的并发修改。CAS 常见的问题有 ABA 问题，以及高竞争情况下反复自旋导致 CPU 开销较大。

## atomic

```C++
template <class T> struct atomic;
```

load和store可以原⼦的读取和修改atomic封装存储的T对象

atomic的原理主要是硬件层面的⽀持，现代处理器提供了原子指令来支原⼦操作。例如，在 x86架构中有CMPXCHG（比较并交换）指令。这些原⼦指令能够在一个不可分割的操作中完成对内存的读取、比较和写入操作，简称CAS，Compare And Set，或是 Compare And Swap。另外为了处理多个处理器缓存之间的数据⼀致性问题，硬件采用了缓存一致性协议，当一个atomic操作修改了一个变量的值，缓存一致性协议会确保其他处理器缓存中的相同变量副本被正确地更新或标记为无效。

```C++
// C++11 支持的CAS接口
template <class T>
    bool atomic_compare_exchange_weak (atomic<T>* obj, T* expected, T val) noexcept;

template <class T>
    bool atomic_compare_exchange_strong (atomic<T>* obj, T* expected, T val) noexcept;

// C++11中atomic类的成员函数
bool compare_exchange_weak (T& expected, T val, memory_order sync = memory_order_seq_cst) noexcept;
bool compare_exchange_strong (T& expected, T val, memory_order sync = memory_order_seq_cst) noexcept;

// gcc⽀持的CAS接⼝
bool __sync_bool_compare_and_swap (type *ptr, type oldval type newval);
type __sync_val_compare_and_swap (type *ptr, type oldval type newval);

// Windows⽀持的CAS接⼝
InterlockedCompareExchange ( __inout LONG volatile *Target,__in LONG Exchange,__in LONG Comperand);
```

C++11的CAS操作支持，atomic对象跟expected按位比较相等，则用val更新atomic对象并返回值true；若atomic对象跟expected按位比较不相等，则更新expected为当前的atomic对象并返回值false，例如atomic的operator++操作就类似于：

```C++
void operator++(std::atomic<int> cnt){
    int oldval = cnt.load();
	// 如果cnt与old相等，把cnt赋值为old + 1，返回true
	// 线程可能会在 load 与 compare_exchange_weak 之间被切走，返回false
    // 如果cnt与old不相等，说明其他线程修改过cnt，把修改过的cnt赋值给old
    // 整个compare_exchange_weak指令一定是原子的，这由底层协议支持
    while(!compare_exchange_weak(&cnt,&oldval,oldval + 1));
    // while(!cnt.compare_exchange_weak(oldval,oldval + 1));
}
```

## compare_exchange_weak&&compare_exchange_strong

compare_exchange_weak在某些平台上，即使原子变量的值等于 expected，也可能“虚假地”失败（即返回 false）。这种失败是由于底层硬件或编译器优化导致的，但不会改变原子变量的。compare_exchange_strong保证在原子变量的值等于 expected 时不会虚假地失败。只要原子变量的值等于 expected，操作就会成功。compare_exchange_weak在某些平台上可能比compare_exchange_strong 更快。compare_exchange_weak可能会虚假的失败主要是由于硬件层间的缓存一致性和编译器优化等等，compare_exchange_strong 要避免这些原因就要付出一定的代价，比如要使用硬件的缓存一致性协议（如 MESI 协议）。

## ABA问题

### 场景 1：无锁链表（最经典，工业真实 BUG）

无锁队列，用 CAS 做节点入队出队。

1. 线程 A 准备删除节点 N，读取 N->next = nullptr
2. 时间片切给线程 B：把节点 N 从链表摘除，**free 回收，又新建一个节点恰好复用到同一块内存地址**（对象复用！），再插回链表。
3. 线程 A 恢复执行 CAS：对比指针地址，地址还是 N，CAS 判定成功，执行修改。

👉 **后果**：操作已经被销毁、复用的旧节点，链表结构彻底错乱，内存踩坏，出现野指针、死循环、内存泄露，随机崩溃。

> 指针的 ABA：指针值（地址）回到原来的值，但节点已经不是原来那个节点。这是无锁数据结构最头疼的坑。

### 场景 2：账户余额，简单 CAS 转账（数值 ABA）

账户余额：100

1. 线程 1：准备 CAS 把 100 改成 0，读取`expect=100`，还没执行 CAS。
2. 线程 2：取走 100，余额变成 0；再存入 100，余额回到 100。
3. 线程 1 执行 CAS：当前等于 expect (100)，执行成功，余额置 0。

👉 **业务后果**：用户明明又存回 100，结果被错误清零，钱凭空消失。

> 现实数据库不会这么写，数据库会带版本号规避；裸写 CAS 原子变量才会踩。

### 场景 3：状态机，任务状态

任务状态：`READY(0)`

1. 线程 1 读到状态 = READY，准备 CAS 改成 RUNNING。
2. 线程 2：状态改成 PROCESSING (1)，处理完成又改回 READY (0)。
3. 线程 1CAS 成功，把状态置 RUNNING。

### 解决方案

1. **版本号（最常用）** 每次修改顺带递增版本号，CAS 同时比较【值 + 版本号】。 A (ver=1) → B (ver=2) → A (ver=3)，虽然数值一样，但版本不同，CAS 失败。

> C++ `std::atomic` 的 `compare_exchange` 本身只看值，需要自己维护版本。

1. **标记指针 Hazard Pointer（风险指针）** 无锁链表场景，标记节点是否被回收，防止节点复用导致 ABA。
2. **不复用对象**：对象用完直接销毁，不要回收重用。

## 内存序模型

在 C++11 标准库中， std::atomic 提供了多种内存顺序（ memory_order ）选项，⽤于控制原子操作的内存同步行为。这些内存顺序选项允许开发者在性能与正确性之间进行权衡，特别是在多线程编程中。以下是 std::atomic 支持的六种内存顺序选项：

![image-20260823171955777](https://raw.githubusercontent.com/QinMou000/pic/main/image-20260823171955777.png)

## 自旋锁

atomic_flag 是一种原子布尔类型。与所有 atomic 的特化不同，它保证是免锁的。与atomic<bool> 不同，atomic_flag 不提供加载或存储操作。主要提供test_and_set操作将flag原子的设置为true并返回之前的值，clear原子将flag设置为false。下面一个样例演示了用atomic_flag实现自旋锁

自旋锁：获取锁失败时**不陷入内核休眠，CPU 空循环忙等，适合锁持有时间极短的场景。**

> 对比 mutex：mutex 拿不到会线程休眠让出 CPU；自旋锁一直循环 CPU 自旋。

```C++
#include <atomic>

class SpinLock {
    private:
    std::atomic<bool> flag = false;
    public:
    // 加锁：自旋忙等，直到抢到锁
    void lock() {
        // exchange：设置新值并返回旧值；true代表已经被占用
        while (flag.exchange(true,std::memory_order_accquire)) {
            // 自旋等待
        }
    }

    // 解锁
    void unlock() {
        flag.store(false, std::memory_order_release);
    }
};


// 更经典的实现方式
class SpinLock {
    private:
    std::atomic_flag flag = ATOMIC_FLAG_INIT;
    public:
    // 加锁：自旋忙等，直到抢到锁
    void lock() {
        // test_and_set：返回旧值；true代表已经被占用
        while (flag.test_and_set(std::memory_order_acquire)) {
        }
    }

    // 解锁
    void unlock() {
        flag.clear(std::memory_order_release);
    }
};

```

### 自旋锁缺点

1. **锁持有时间不能长**。如果临界区执行很久，其他线程一直在空转，白白占满 CPU。
2. 容易优先级反转：高优先级线程拿不到锁，循环自旋。
3. 适合：临界区只有几行简单运算；**不适合里面做 IO、sleep**。
4. 多核心 CPU 效果好；单核 CPU 自旋锁性能极差，单核忙等不会让出时间片。

>  今天虹软科技的笔试第三题，有一个判断条件没看到，一直没C出来，考试结束前的5秒钟看到了，俺不得劲，明天放假一天~