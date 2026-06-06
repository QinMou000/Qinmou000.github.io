---
title: C++初阶：动态内存管理
date: 2024-07-21
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/a1e2fd8531ae4fbab004f1ecd1a2c8b1.jpeg)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## 内存区域

> 1. 栈（stack）又叫堆栈--非静态局部变量/函数参数/返回值（数据，地址）等等，栈是向下增长的。
>
> 2. 内存映射段是高效的I/O映射方式，用于装载一个共享的动态内存库。用户可使用系统接口 创建共享共享内存，做进程间通信。
>
> 3. 堆（heap）用于程序运行时动态内存分配，堆是可以上增长的。
>
> 4. 数据段（静态区）--存储全局数据和静态数据，程序结束后由系统释放。
>
> 5. 代码段--可执行的函数（类成员函数和全局函数）二进制代码/只读常量。

C语言内存管理方式在C++里可以继续使用，但是相较于C语言，在C++里面我们管理内存一般不会用malloc和free等函数，而是使用更高效的方便的new和delete操作符进行动态内存管理。

[C语言中动态内存相关的4个函数free、malloc、calloc、realloc](https://blog.csdn.net/2301_80194476/article/details/136954482?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522172156933416800225526329%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=172156933416800225526329&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-1-136954482-null-null.nonecase&utm_term=malloc&spm=1018.2226.3001.4450)

### new/delete操作内置类型

这里只需记住用法和注意事项，暂时不用管底层实现。

```cpp
	int* ptr1 = new int;//动态申请一个int类型的空间
	int* ptr2 = new int(2);//动态申请一个int类型的空间， 并初始化为2
	int* ptr3 = new int[10];//动态申请10个int类型的空间
	int* ptr4 = new int[5] {1, 2, 3, 4, 5};//动态申请5个int类型的空间并初始化

	delete ptr1;
	delete ptr2;
	delete[] ptr3;
	delete[] ptr4;//注意要匹配方括号
```

注意：申请和释放单个元素的空间，使用new和delete操作符，申请和释放连续的空间，使用 new[]和delete[]，注意：匹配起来使用。

### new/delete操作自定义类型

```cpp
class A
{
public:
	A(int a = 0)
		:_a(a)
	{
		cout << "A(int a = 0)" << endl;
	}
	~A()
	{
		cout << "~A()" << endl;
	}
private:
	int _a;
};
int main()
{
	// new/delete 和 malloc/free最大区别是 new/delete对于【自定义类型】除了开空间
	//还会调用构造函数和析构函数
	A* p1 = (A*)malloc(sizeof(A));
	A* p2 = new A(1);
	free(p1);
	delete p2;

	// 内置类型是几乎是一样的
	int* p3 = (int*)malloc(sizeof(int)); // C
	int* p4 = new int;
	free(p3);
	delete p4;

	A* p5 = (A*)malloc(sizeof(A) * 10);
	A* p6 = new A[10];
	free(p5);
	delete[] p6;

	return 0;
}
```

运行结果：

![图片](https://i-blog.csdnimg.cn/direct/1d944e221f0b4ba6aaa7c49c2cfc246e.png)

注意：在申请自定义类型的空间时，new会调用构造函数，delete会调用析构函数，而malloc与 free不会。

## new和delete的底层实现

new与delete在底层会调用operator new与operator delete函数

new和delete是用户进行动态内存申请和释放的操作符，operator new 和operator delete是 系统提供的全局函数，new在底层调用operator new全局函数来**申请空间**，delete在底层通过 operator delete全局函数来**释放空间**。

```cpp
/*
operator new：该函数实际通过malloc来申请空间，当malloc申请空间成功时直接返回；申请空间
失败，尝试执行空 间不足应对措施，如果改应对措施用户设置了，则继续申请，否
则抛异常。
*/
void* __CRTDECL operator new(size_t size) _THROW1(_STD bad_alloc)
{
	// try to allocate size bytes
	void* p;
	while ((p = malloc(size)) == 0)
		if (_callnewh(size) == 0)
		{
			// report no memory
			// 如果申请内存失败了，这里会抛出bad_alloc 类型异常
			static const std::bad_alloc nomem;
			_RAISE(nomem);
		}
	return (p);
}
/*
operator delete: 该函数最终是通过free来释放空间的
*/
void operator delete(void* pUserData)
{
	_CrtMemBlockHeader* pHead;
	RTCCALLBACK(_RTC_Free_hook, (pUserData, 0));
	if (pUserData == NULL)
		return;
	_mlock(_HEAP_LOCK); /* block other threads */
	__TRY
		/* get a pointer to memory block header */
		pHead = pHdr(pUserData);
	/* verify block type */
	_ASSERTE(_BLOCK_TYPE_IS_VALID(pHead->nBlockUse));

	_free_dbg(pUserData, pHead->nBlockUse);

	__FINALLY
		_munlock(_HEAP_LOCK); /* release other threads */
	__END_TRY_FINALLY
	return;
}
/*
free的实现
*/
#define free(p) _free_dbg(p, _NORMAL_BLOCK)
```

通过上述两个全局函数的实现知道，**operator new 实际也是通过malloc来申请空间**，如果 malloc申请空间成功就直接返回，否则执行用户提供的空间不足应对措施，如果用户提供该措施 就继续申请，否则就抛异常。**operator delete 最终是通过free来释放空间的。**

总结以下：

### 内置类型

如果申请的是内置类型的空间，new和malloc，delete和free基本类似，不同的地方是： new/delete申请和释放的是单个元素的空间，**new[]和delete[]申请的是连续空间**，**而且new在申请空间失败时会抛异常，malloc会返回NULL。**

### 自定义类型

> new的原理
>
> 1. 调用operator new函数申请空间
>
> 2. 在申请的空间上执行构造函数

> delete的原理
>
> 1. 在空间上执行析构函数，完成对象中资源的清理工作
>
> 2. 调用operator delete函数释放对象的空间

> new T[N]的原理
>
> 1. 调用operator new[]函数，在operator new[]中实际调用operator new函数完成N个对象空间的申请**（先申请后构造）**
>
> 2. 在申请的空间上执行N次构造函数

> delete[]的原理
>
> 1. 在释放的对象空间上执行N次析构函数，完成N个对象中资源的清理**（先析构后释放）**
>
> 2. 调用operator delete[]释放空间，实际在operator delete[]中调用operator delete来释放空间

## 定位new表达式(placement-new)

定位new表达式是在已分配的原始内存空间中调用构造函数初始化一个对象。

> 使用格式：
>
> new (place_address) type或者new (place_address) type(initializer-list)
>
> **place_address必须是一个指针**，**initializer-list是类型的初始化列表**ps：有参数就需传参

> 使用场景：
>
> 定位new表达式在实际中一般是配合内存池使用。因为**内存池分配出的内存没有初始化**，所以如果是自定义类型的对象，需要使用new的定义表达式进行**显示调构造函数进行初始化。**

```cpp
class A
{
public:
	A(int a = 0)
		: _a(a)
	{
		cout << "A():" << this << endl;
	}
	~A()
	{
		cout << "~A():" << this << endl;
	}
private:
	int _a;
};
// 定位new/replacement new
int main()
{
	// p1现在指向的只不过是与A对象相同大小的一段空间，还不能算是一个对象，因为构造函数没有执行
	A* p1 = (A*)malloc(sizeof(A));
	new(p1)A; // 注意：如果A类的构造函数有参数时，此处需要传参
	p1->~A();
	free(p1);

	A* p2 = (A*)operator new(sizeof(A));
	new(p2)A(10);
	p2->~A();
	operator delete(p2);

	return 0;
}
```

## malloc/free和new/delete的区别

malloc/free和new/delete的共同点是：都是从堆上申请空间，并且需要用户手动释放。

不同的地方是：

> 1. malloc和free是**函数**，new和delete是**操作符**
>
> 2. malloc申请的空间不会初始化，**new可以初始化**
>
> 3. malloc申请空间时，需要**手动计算空间大小并传递**，new只需在其后**跟上空间的类型即可， 如果是多个对象，[]中指定对象个数即可**
>
> 4. malloc的返回值为void*, 在使用时**必须强转**，new不需要，因为**new后跟的是空间的类型**
>
> 5. malloc申请空间失败时，返回的是**NULL**，因此使用时**必须判空**，new不需要，但是new需 要**捕获异常**
>
> 6. 申请自定义类型对象时，malloc/free**只会开辟空间，不会调用构造函数与析构函数**，而new 在申请空间后会调用构造函数**完成对象的初始化**，delete在释放空间前会调用析构函数**完成空间中资源的清理释放**

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
