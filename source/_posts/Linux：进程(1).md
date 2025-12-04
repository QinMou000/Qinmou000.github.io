---
title: Linux：进程(1)
date: 2024-11-22
categories:
  - Linux
  - 操作系统
---
>  ![博客封面](https://raw.githubusercontent.com/QinMou000/pic/main/a46182e6318c4593a5c674f2bf9439d4.jpeg)

# 冯诺依曼体系结构 

![img](https://raw.githubusercontent.com/QinMou000/pic/main/af470f5aa05f47eda8482f280888b6e9.png)
现代计算机发展所遵循的基本结构形式始终是冯·诺依曼结构。这种结构特点是“程序存储，共享数据，顺序执行”，需要CPU从存储器取出指令和数据进行相应的计算。

主要特点有：

- 单处理机结构，机器以运算器为中心；
- 采用程序存储思想；
- 指令和数据一样可以参与运算；
- 数据以二进制表示；
- 将软件和硬件完全分离；
- 指令由操作码和操作数组成；
- 指令顺序执行。

关于冯诺依曼，必须强调⼏点：

- 这⾥的存储器指的是内存
- 不考虑缓存情况，这⾥的CPU能且只能对内存进⾏读写，不能访问外设(输⼊或输出设备)
- 外设(输⼊或输出设备)要输⼊或者输出数据，也只能写⼊内存或者从内存中读取。
- ⼀句话，所有设备都只能直接和内存打交道。

我们在微信上给别人发消息时，消息由键盘（输入设备）输入加载到内存里，经过cpu处理，把相应的指令发送给网卡（输出设备），在另一台机器上，网卡（输入设备）接收到消息，把信息加载到内存里，cpu处理后，显示在屏幕上（输出设备）。 

#  初识操作系统

## 概念 

任何计算机系统都包含⼀个基本的程序集合，称为操作系统(OS)。笼统的理解，操作系统包括：

1. 内核（进程管理，内存管理，⽂件管理，驱动管理）
2. 其他程序（例如函数库，shell程序等等）

![img](https://raw.githubusercontent.com/QinMou000/pic/main/d3dc2ad689cd4bf98964ae442f35d3b4.png)

## 设计OS的⽬的 

- 对下，与硬件交互，管理所有的软硬件资源
- 对上，为⽤户程序（应⽤程序）提供⼀个良好的执⾏环境

![img](https://raw.githubusercontent.com/QinMou000/pic/main/e6785f7149954b3ca04b0679954b9b18.png)

 首先我们知道在计算机的底层存在各种硬件设备，这些硬件设备通过冯诺依曼体系结构联系在一起。

但是仅有这些硬件是不够的，还需要一个软件来对这些硬件进行系统化管理。例如：内存何时从输入设备读取数据？读取多少数据？内存何时刷新缓冲区到输出设备？是按行刷新还是全刷新？这个软件就是我们所谈论的操作系统。但是这就引发一个问题，如果操作系统是与底层硬件直接联系的话，那么一旦底层硬件发生一点改变，那么操作系统的源代码就需要重新编译。如果进行频繁的编译，就会大大拖慢计算机的效率。所以为了解决这个问题，在操作系统与底层硬件之间需要增加一层结构让操作系统与底层硬件之间实现**解耦**。这个增加的结构就是我们的驱动程序，其功能一般为访问某个硬件的读写，状态等。一般由我们的硬件厂商提供。

而一般而言，操作系统为了保护自己的内在结构，并不会将源码呈现给用户，而是而是封装出一些接口提供给用户。这些接口一般被称为系统调用接口，但是这些接口对于普通用户来说具有一定的使用成本，因为用户必须要先对操作系统有一定了解，为了方便用户，所以又对系统接口进行封装形成我们的用户操作接口，常见的用户接口有各种库如 libc 以及部分指令，我们一般在实际编写的过程中调用各种的函数 printf，scanf 就是来源于这些库。

而最上层还有一层用户层，一般是由我们用户通过指令或**图形化界面**进行各种操作。

![img](https://raw.githubusercontent.com/QinMou000/pic/main/0d7821f2b7ef43f8b7b4e1ea8d888d60.png)

Linux严格意义上说是一个操作系统，我们称之为“核心（kernel）”，但我们一般用户不能直接使用kernel，而是通过kernel的“外壳程序”，也就是所谓的Shell，来与kernel沟通。

Shell最基本的定义为“命令行解释器”，其主要功能包括以下两点：

1. 它能够将使用者输入的命令翻译为计算机核心（kernel）可以理解的语言，并传递给核心进行处理。
2. 同时，它也负责将核心的处理结果翻译为使用者能够理解的形式并呈现给使用者。

与Windows中的图形化界面（GUI）进行对比，我们在操作Windows时，并非直接与Windows内核进行交互，而是通过图形接口进行点击等操作来完成。同样地，Shell在Linux系统中起着类似的作用，它主要对用户的指令进行解析，将解析后的指令传递给Linux内核，然后将内核运行产生的结果反馈回来，并通过自身的解析呈现给用户。

Shell 的运行原理如下：

1. 它会创建子进程，由子进程来负责进行命令行的解释工作。
2. 重要的是，子进程出现的任何问题，都不会对父进程 Shell 产生影响。

以Windows为例，我们每运行一个程序，就相当于创建了一个子进程，比如打开浏览器、运行办公软件等。即便这些子进程中的某个出现问题，如浏览器卡死（程序异常）或被关闭（程序终止），也不会影响其他子程序的正常运行。同样地，在Linux中，Shell与子进程的关系也是如此，确保了系统的稳定性和可靠性。

shell：贝壳；外壳，是一个统一称呼，在ubuntu下外壳程序叫做 bash

# 进程

基本概念与基本操作

- 课本概念：程序的⼀个执⾏实例，正在执⾏的程序等
- 内核观点：担当分配系统资源（CPU时间，内存）的实体。

## 描述进程-PCB 基本概念

- 进程信息被放在⼀个叫做进程控制块的数据结构中，可以理解为进程属性的集合。
- 课本上称之为PCB（process control block），Linux操作系统下的PCB是: task_struct

```cpp
struct task_struct
{
    // ...
};
```

task_struct-PCB的⼀种 

- 在Linux中描述进程的结构体叫做task_struct。 
- task_struct是Linux内核的⼀种数据结构，它会被装载到RAM(内存)⾥并且包含着进程的信息。

task_ struct 内容分类

- 表示符: 描述本进程的唯⼀表示符，⽤来区别其他进程。
- 状态: 任务状态，退出代码，退出信号等。
- 优先级: 相对于其他进程的优先级。
- 程序计数器: 程序中即将被执⾏的下⼀条指令的地址。
- 内存指针: 包括程序代码和进程相关数据的指针，还有和其他进程共享的内存块的指针
- 上下⽂数据: 进程执⾏时处理器的寄存器中的数据[休学例⼦，要加图CPU，寄存器]。
- I/O状态信息: 包括显示的I/O请求,分配给进程的I/O设备和被进程使⽤的⽂件列表。
- 记账信息: 可能包括处理器时间总和，使⽤的时钟数总和，时间限制，记账号等。
- 其他信息

> linux 2.0.12 kernal 源码： 
>
> ```cpp
> struct task_struct {
> /* these are hardcoded - don't touch */
> 	volatile long state;	/* -1 unrunnable, 0 runnable, >0 stopped */
> 	long counter;
> 	long priority;
> 	unsigned long signal;
> 	unsigned long blocked;	/* bitmap of masked signals */
> 	unsigned long flags;	/* per process flags, defined below */
> 	int errno;
> 	long debugreg[8];  /* Hardware debugging registers */
> 	struct exec_domain *exec_domain;
> /* various fields */
> 	struct linux_binfmt *binfmt;
> 	struct task_struct *next_task, *prev_task;
> 	struct task_struct *next_run,  *prev_run;
> 	unsigned long saved_kernel_stack;
> 	unsigned long kernel_stack_page;
> 	int exit_code, exit_signal;
> 	/* ??? */
> 	unsigned long personality;
> 	int dumpable:1;
> 	int did_exec:1;
> 	/* shouldn't this be pid_t? */
> 	int pid;
> 	int pgrp;
> 	int tty_old_pgrp;
> 	int session;
> 	/* boolean value for session group leader */
> 	int leader;
> 	int	groups[NGROUPS];
> 	/* 
> 	 * pointers to (original) parent process, youngest child, younger sibling,
> 	 * older sibling, respectively.  (p->father can be replaced with 
> 	 * p->p_pptr->pid)
> 	 */
> 	struct task_struct *p_opptr, *p_pptr, *p_cptr, *p_ysptr, *p_osptr;
> 	struct wait_queue *wait_chldexit;	/* for wait4() */
> 	unsigned short uid,euid,suid,fsuid;
> 	unsigned short gid,egid,sgid,fsgid;
> 	unsigned long timeout, policy, rt_priority;
> 	unsigned long it_real_value, it_prof_value, it_virt_value;
> 	unsigned long it_real_incr, it_prof_incr, it_virt_incr;
> 	struct timer_list real_timer;
> 	long utime, stime, cutime, cstime, start_time;
> /* mm fault and swap info: this can arguably be seen as either mm-specific or thread-specific */
> 	unsigned long min_flt, maj_flt, nswap, cmin_flt, cmaj_flt, cnswap;
> 	int swappable:1;
> 	unsigned long swap_address;
> 	unsigned long old_maj_flt;	/* old value of maj_flt */
> 	unsigned long dec_flt;		/* page fault count of the last time */
> 	unsigned long swap_cnt;		/* number of pages to swap on next pass */
> /* limits */
> 	struct rlimit rlim[RLIM_NLIMITS];
> 	unsigned short used_math;
> 	char comm[16];
> /* file system info */
> 	int link_count;
> 	struct tty_struct *tty; /* NULL if no tty */
> /* ipc stuff */
> 	struct sem_undo *semundo;
> 	struct sem_queue *semsleeping;
> /* ldt for this task - used by Wine.  If NULL, default_ldt is used */
> 	struct desc_struct *ldt;
> /* tss for this task */
> 	struct thread_struct tss;
> /* filesystem information */
> 	struct fs_struct *fs;
> /* open file information */
> 	struct files_struct *files;
> /* memory management info */
> 	struct mm_struct *mm;
> /* signal handlers */
> 	struct signal_struct *sig;
> #ifdef __SMP__
> 	int processor;
> 	int last_processor;
> 	int lock_depth;		/* Lock depth. We can context switch in and out of holding a syscall kernel lock... */	
> #endif	
> };
> ```
>

## 组织进程

可以在内核源代码⾥找到它。所有运⾏在系统⾥的进程都以**task_struct链表**的形式存在内核⾥。

事实上在后续Linux版本中task_struct里面有很多的next_struct和prev_struct，一个进程会存在于多个链表、队列中，在linux内核中有一个巨大的复杂的进程网。

![img](https://raw.githubusercontent.com/QinMou000/pic/main/5462b3de48a1489f816ea15234e8c9a1.png)

##  查看进程

指令：top -[option]

`top` 命令会实时刷新显示系统的运行情况，包括 CPU 占用率、内存使用情况以及各个进程的运行情况。

常用的参数包括：

- `-d delay`：设置刷新间隔时间（秒）。
- `-u username`：只显示特定用户的进程。
- `-p pid`：只显示指定进程的信息。

![img](https://raw.githubusercontent.com/QinMou000/pic/main/273faae474ed4cb1b6fe845df9720799.png)

指令 ps -[option]

ps 表示“process status”，用于显示当前系统中的进程状态。

- `-e` 或 `-A`：显示所有进程。

- `-f`：显示完整格式的信息。

- `-u user`：显示特定用户的进程。

- `-aux/-ajx`：显示所有进程，包括系统守护进程，并显示详细信息，是常用的组合选项。

- a 表示显示所有用户的进程，而不仅仅是当前用户的进程。

  u 表示显示用户与进程相关的详细信息，比如进程的拥有者、CPU 占用、内存占用等。

  x 表示显示没有控制终端的进程，这样可以包括那些非终端的进程，比如守护进程。

- axj:是选项，含义如下：

  a 和 x 的作用与上述相同。

  j 表示以作业控制格式显示进程信息，包括作业控制信息和资源限制等。

![img](https://raw.githubusercontent.com/QinMou000/pic/main/e31aa6fe83284d63a01c6bc19eed20c4.png)

## 创建进程 

通过系统调用函数getpid()和getppid()可以分别获取进程的`pid`(进程ID)和`ppid`(父进程ID)。 

 ![img](https://raw.githubusercontent.com/QinMou000/pic/main/fa3287869f4d473c9dc0a4555dcb5c8f.png)

```cpp
#include<stdio.h>
#include<unistd.h>

int main()
{
    while(1)
    {
        printf("我是一个进程pid:%d,ppid:%d\n",getpid(),getppid());
        sleep(1);
    }
    return 0;
}
```


 ![img](https://raw.githubusercontent.com/QinMou000/pic/main/2f2308e0f62541e5946eee5696146cf3.png)

 kill -9 pid 或者ctrl+c可以杀死进程

### 初识fork函数

```cpp
#include<stdio.h>
#include<unistd.h>
#include<sys/types.h>
int main()
{
  fork
  while(1)
  {
     printf("proc PID :%d,parent PID:%d\n",getpid(),getppid());
     sleep(1); 
  }
  return 0;
}
```

 ![img](https://raw.githubusercontent.com/QinMou000/pic/main/75c670202e084e08a1ac326c592a70d8.png)

第一行数据是该进程的PID和PPID，第二行数据是代码中通过调用fork函数创建的子进程的PID和PPID。其中该进程的PID就是子进程的父进程PID，所以我们可以说这两个进程是父子关系。而该进程的父进程就是bash，一般而言，在命令行上运行的指令，父进程基本都是bash。

并且值得注意的是：在子进程被创建之前的代码被父进程执行，而子进程被创建之后的代码，则默认情况下父子进程都可以执行。父子进程虽然代码共享，但是父子进程的数据各自开辟空间（采用写时拷贝）。注意：使用fork函数创建子进程后就有了两个进程，这两个进程被操作系统调度的顺序是不确定的，这取决于操作系统调度算法的具体实现。

###  fork的返回值

因为父子进程代码共享，而且fork函数在执行return语句时已经创建好了子进程，所以return语句会被父子进程执行两次，所以fork函数肯定有两个返回值。

- 如果子进程创建成功，在父进程中返回子进程的PID，而在子进程中返回0。
- 如果子进程创建失败，则在父进程中返回 -1。

所以我们可以通过fork的返回值，让父子进程分别去执行不同的过程。代码示例如下:

```cpp
#include<stdio.h>
#include<unistd.h>
#include<sys/types.h>

int main()
{
    pid_t id = fork();
    if(id == 0)
    {
        // child
        while(1)
        {
            printf("我是子进程pid:%d, ppdi:%d\n",getpid(),getppid());
            sleep(1);
        }
    }
    else
    {
        // parent
        int cnt = 5;
        while(cnt--)
        {
            printf("我是父进程pid:%d, ppdi:%d\n",getpid(),getppid());
            sleep(1);
        }
    }
    return 0;
}
```

![img](https://raw.githubusercontent.com/QinMou000/pic/main/10750f3dfe0243adb3a704825a31ddc1.png)

## 进程状态 

 kernal源码：

```cpp
static const char *const task_state_array[] = {
	"R (running)", /*0 */
	"S (sleeping)", /*1 */
	"D (disk sleep)", /*2 */
	"T (stopped)", /*4 */
	"t (tracing stop)", /*8 */
	"X (dead)", /*16 */
	"Z (zombie)", /*32 */
};
```



### 运行状态-R

**R运行状态(running) : 运行状态不一定占用CPU，并不意味着进程一定在运行中，一个进程处于R状态，它只是表明进程**要么是在运行中要么在运行队列里**，随时可以被CPU调度 也就是说,可以同时存在多个处于R状态的进程。比如如下所有处于运行队列的进程都处于运行状态。

![img](https://raw.githubusercontent.com/QinMou000/pic/main/05b8d12ff85342a3b0e61a656c6c9091.png)

### 浅度睡眠状态-S

S浅睡眠状态(sleeping): 当需要完成某种任务，而条件不具备时，需要进程进行某种等待，此时的状态就是浅睡眠状态。

比如一下程序：

```cpp
#include<stdio.h>
#include<unistd.h>
int main()
{
  printf("I am running\n");
  sleep(100);
  return 0;
}
```


![img](https://raw.githubusercontent.com/QinMou000/pic/main/29da6f9b9f244deb9e89aabb2511d224.png)

浅度睡眠状态可以用`kill`指令杀死对应进程。 

### 深度睡眠状态-D

D深度休眠状态(Disk sleep)：有时候也叫不可中断睡眠(深度睡眠)状态，在这个状态的进程通常会等待IO的结束。

例如，某一进程要求对磁盘进行写入操作，那么在磁盘进行写入期间，该进程就处于深度睡眠状态，是不会被杀掉的，因为该进程需要等待磁盘的回复（是否写入成功）以做出相应的应答。

###  停止状态-T

T停止状态(stopped)：可以通过发送`SIGSTOP`信号来停止进程，这个被暂停的进程可以通过发送`SIGCONT` 信号让进程继续运行

![img](https://raw.githubusercontent.com/QinMou000/pic/main/8982e220c3e14aa19fee0cbce6d783a7.png)

### 僵尸状态-Z

Z僵尸状态(Zombies)：当一个进程退出时，该进程曾经申请的资源并不是立即被释放，而是要暂时存储一段时间，以供操作系统或是其父进程进行读取，如果退出信息一直未被读取，则相关数据是不会被释放掉的。一旦进程若是正在等待其退出信息被读取，那么我们称该进程处于僵尸状态。

### 死亡状态-X

X死亡状态(dead)：当一个进程的退出信息被读取后，该进程所申请的资源就会立即被释放，该进程也就不存在了。同样因为不存在了，我们也无法观察到死亡状态。

## 僵尸进程与孤儿进程

### 僵尸进程

处于僵尸状态的进程，我们就称之为僵尸进程。例如，以下这段代码，fork函数创建的子进程在打印3次信息后会退出，而父进程会一直打印信息。也就是说，**子进程退出了**，父进程还在运行，此时父进程没有读取子进程的退出信息，那么此时子进程就进入了僵尸状态。

```cpp
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
int main() {
    pid_t id = fork();
    if (id == 0) 
    {
        // child
        int count = 3;
        while (count > 0) 
        {
            printf("我是子进程 pid:%d,ppid: %d\n", getpid(), getppid());
            sleep(2);
            count--;
        }
        printf("I am child, I quit\n");
    }
    else
    {
        // parent
        while (1) {
            printf("我是父进程,pid:%d ppid:%d\n", getpid(), getppid());
            sleep(2);
        }
    }
    return 0;
}
```


![img](https://raw.githubusercontent.com/QinMou000/pic/main/a24ae1a3328a456ba26d2e3248f42570.png)

![img](https://raw.githubusercontent.com/QinMou000/pic/main/07c8048f51f74da4862bb6f944aa688d.png)

如果僵尸进程一直不回收，子进程就会一直处于僵尸状态，而维护子进程系统会创建对应PCB，进而造成系统资源的浪费。并且随着僵尸进程的增多，实际使用的资源就会越少，会造成严重的**内存泄漏问题**。 

### 孤儿进程

若子进程先退出而父进程没有对子进程的退出信息进行读取，那么我们称该进程为僵尸进程。但若是父进程先退出，那么此时子进程没有父进程对其进行处理，此时该子进程就称之为孤儿进程。若是一直不处理孤儿进程，那么孤儿进程就会一直占用资源，造成内存泄漏。因此，当出现孤儿进程的时候，孤儿进程一般会被1号init进程领养。

比如说下面这段代码，fork函数创建的子进程会一直打印信息，而父进程在打印5次信息后会退出，此时该子进程就变成了孤儿进程。

```cpp
#include<stdio.h>
#include<unistd.h>
#include<sys/types.h>

int main()
{
    pid_t id = fork();
    if(id == 0)
    {
        // child
        while(1)
        {
            printf("我是子进程pid:%d, ppdi:%d\n",getpid(),getppid());
            sleep(1);
        }
    }
    else
    {
        // parent
        int cnt = 5;
        while(cnt--)
        {
            printf("我是父进程pid:%d, ppdi:%d\n",getpid(),getppid());
            sleep(1);
        }
    }
    return 0;
}
```



![img](https://raw.githubusercontent.com/QinMou000/pic/main/5816513409554d3ca1bcfd1350245ef5.png)

## 进程优先级 

优先级实际上就是获取某种资源的先后顺序，而进程优先级实际上就是进程获取CPU资源分配的先后顺序，就是指进程的优先权（priority），优先权高的进程有优先执行的权力。

优先级存在的主要原因就是资源是有限的，一个CPU一次只能跑一个进程，而进程是可以有多个的，所以需要存在进程优先级，来确定进程获取CPU资源的先后顺序。

我们可以通过指令`ps -l`查看进程的优先级。 

![img](https://raw.githubusercontent.com/QinMou000/pic/main/fa3e9c7ec56c4a7fb80e1e0625a53a6c.png)

### 修改优先级

因为PRI = 80 + NI，所以我们只需要修改nice值就能达到修改优先级的目的。

修改NI值一共有两种方法：

第一种就是输入top指令，然后按下R键输入要修改进程的PID，最高输入要修改的NI值。

第二种就是使用`renice`指令，语法为`renice NI PID`。

其中无论哪种方法，如果想将`NI`值调为负值，也就是将进程的**优先级调高，都需要使用`sudo`提升权限。** 

### 进程调度队列 

我们以`Linux 2.6`版本为例，详细谈一谈进程调度队列。

 ![img](https://raw.githubusercontent.com/QinMou000/pic/main/5f2dbbf8753f4bc6bae0d055006147d7.png)

- active指针：永远指向活动队列。
- active指针：永远指向活动队列。
- expired指针：永远指向过期队列。
- nr_active：代表总共有多少个运行状态的进程。
- queue[140]：前面说到nice值的取值范围是-20~19，共40个级别，依次对应queue当中普通优先级的下标100~139，相同优先级的进程按照FIFO规则进行排队调度。而下标0~99对应的实时进程，实时进程是指先将一个进程执行完毕再执行下一个进程，现在基本不存在这种机器了，所以对于queue当中下标为0~99的元素我们不关心。
- bitmap[5]：这是一个位图，queue数组当中一共有140个元素，即140个优先级，一共140个进程队列，为了提高查找非空队列的效率，就可以用5 × 32个比特位表示每个队列是否为空。

所以调度过程如下：

1. 首先从0下标开始遍历活动队列queue[140]。
2. 选中队列的第一个非空进程即优先级最高的基础，开始运行，调度完成后放入过期队列。
3. 继续选中队列的第二个非空进程进行调度，直到所有活动队列都被调度，即bitmap[5]等于0。
4. 如果活动队列全部被调度完毕，**交换将active指针和expired指针的内容**，让过期队列变成活动队列，活动队列变成过期队列，这样就又有了一批新的活动进程，**如此循环**进行即可。 

### **时间片轮转策略**

在时间片轮转调度算法中，如果为每个进程分配一个固定的时间片来执行。当新进程创建时，它可能会被直接放入过期队列。例如，系统设定每个进程的时间片为 100 毫秒，新进程进入系统时，即使它准备就绪，也不会立即进入就绪队列获得 CPU 时间，而是先进入过期队列等待。

当就绪队列中的所有进程都用完了自己的时间片后，系统会将过期队列中的进程重新放入就绪队列，按照某种顺序（如先来先服务或优先级等）再次分配时间片执行，这样可以保证每个进程都能公平地获得 CPU 时间，避免某个进程长时间霸占 CPU。

在系统当中查找⼀个最合适调度的进程的时间复杂度是⼀个常数，不随着进程增多⽽导致时间成 本增加，我们称之为进程调度O(1)算法！ 

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！** 