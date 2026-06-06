---
title: C++初阶：stack&queue&deque
date: 2024-09-03
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/a1e2fd8531ae4fbab004f1ecd1a2c8b1.jpeg)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## priorty_queue的介绍

[priority_queue - C++ Reference (cplusplus.com)](https://legacy.cplusplus.com/reference/queue/priority_queue/?kw=priority_queue)

**1. 优先队列是一种容器适配器，根据严格的弱排序标准，它的第一个元素默认总是它所包含的元素中最大的。**

**2. 此上下文类似于堆，在堆中可以随时插入元素，并且只能检索最大堆元素(优先队列中位于顶部的元素)。**

**3. 优先队列被实现为容器适配器，容器适配器即将特定容器类封装作为其底层容器类，queue 提供一组特定的成员函数来访问其元素。元素从特定容器的“尾部”弹出，其称为优先队列的顶部。**

**4. 底层容器可以是任何标准容器类模板，也可以是其他特定设计的容器类。容器应该可以通过随机迭代器访问，并支持以下操作：**

> **empty()：检测容器是否为空**
>
> **size()：返回容器中有效元素个数**
>
> **front()：返回容器中第一个元素的引用**
>
> **push_back()：在容器尾部插入元素**
>
> **pop_back()：删除容器尾部元素**

**5. 标准容器类vector和deque满足这些需求。默认情况下，如果没有为特定的priority_queue 类实例化指定容器类，则使用vector。**

**6. 需要支持随机访问迭代器，以便始终在内部保持堆结构。容器适配器通过在需要时自动调用算法函数make_heap、push_heap和pop_heap来自动完成此操作。**

## priorty_queue的使用

优先级队列默认使用vector作为其底层存储数据的容器，在vector上又使用了堆算法将vector中元素构造成堆的结构，因此priority_queue本质上就是堆，所有需要用到堆的位置，都可以考虑使用 priority_queue。注意：默认情况下priority_queue是大堆。

| 函数声明 | 接口说明 |
| --- | --- |
| [priority_queue](https://legacy.cplusplus.com/reference/queue/priority_queue/?kw=priority_queue) | 构造一个空的优先级队列 |
| [empty()](https://legacy.cplusplus.com/reference/queue/priority_queue/empty/) | 检测优先级队列是否为空，是则返回true，否则返回false |
| [top()](https://legacy.cplusplus.com/reference/queue/priority_queue/top/) | 返回优先级队列中最大(最小元素)，即堆顶元 素 |
| [push(x)](https://legacy.cplusplus.com/reference/queue/priority_queue/push/) | 在优先级队列中插入元素x |
| [pop()](https://legacy.cplusplus.com/reference/queue/priority_queue/pop/) | 删除优先级队列中最大(最小)元素，即堆顶元素 |

## 注意事项

1. 默认情况下，priority_queue是大堆。

```cpp
#include <vector>
#include <queue>
#include <functional> // greater算法的头文件
void TestPriorityQueue()
{
	// 默认情况下，创建的是大堆，其底层按照小于号比较
	vector<int> v{ 3,2,7,6,0,4,1,9,8,5 };
	priority_queue<int> q1;
	for (auto& e : v)
		q1.push(e);
	cout << q1.top() << endl;
	// 如果要创建小堆，将第三个模板参数换成greater比较方式
	priority_queue<int, vector<int>, greater<int>> q2(v.begin(), v.end());
	cout << q2.top() << endl;
}
```

2. 如果在priority_queue中放自定义类型的数据，**用户需要在自定义类型中提供>或者<的重载。**

```cpp
class Date
{
public:
	Date(int year = 1900, int month = 1, int day = 1)
	: _year(year)
	, _month(month)
	, _day(day)
	{}
	bool operator<(const Date& d)const
	{
		return (_year < d._year) ||
			(_year == d._year && _month < d._month) ||
			(_year == d._year && _month == d._month && _day < d._day);
	}
	bool operator>(const Date& d)const
	{
		return (_year > d._year) ||
			(_year == d._year && _month > d._month) ||
			(_year == d._year && _month == d._month && _day > d._day);
	}
	friend ostream& operator<<(ostream& _cout, const Date& d)
	{
		_cout << d._year << "-" << d._month << "-" << d._day;
		return _cout;
	}
private:
	int _year;
	int _month;
	int _day;
};

void testpriorityqueue()
{
	// 大堆，需要用户在自定义类型中提供<的重载
	priority_queue<Date> q1;
	q1.push(Date(2018, 10, 29));
	q1.push(Date(2018, 10, 28));
	q1.push(Date(2018, 10, 30));
	cout << q1.top() << endl;
	// 如果要创建小堆，需要用户提供>的重载
	priority_queue<Date, vector<Date>, greater<Date>> q2;
	q2.push(Date(2018, 10, 29));
	q2.push(Date(2018, 10, 28));
	q2.push(Date(2018, 10, 30));
	cout << q2.top() << endl;
}
```

## 容器适配器

### 概念

适配器是一种设计模式(设计模式是一套被反复使用的、多数人知晓的、经过分类编目的、代码设 计经验的总结)，该种模式是将一个类的接口转换成客户希望的另外一个接口。

![图片](https://i-blog.csdnimg.cn/direct/61207563b6264771828752ddf949059b.png)

### STL中的stack和queue的底层结构

虽然stack和queue中也可以存放元素，但在STL中并没有将其划分在容器的行列，而是将其称为 容器适配器，这是因为stack和队列只是对其他容器的接口进行了包装，STL中stack和queue默认 使用deque，比如：

![图片](https://i-blog.csdnimg.cn/direct/c21c528f49264b8cb7dda049815d62d3.png)![图片](https://i-blog.csdnimg.cn/direct/0c0fdc6e1efb4549845ab4121a7dfd53.png)

![图片](https://i-blog.csdnimg.cn/direct/df29a28f9cb54e47aba324a5a958e31b.png)

## deque

### deque的介绍

deque(双端队列)：是一种双开口的"连续"空间的数据结构，双开口的含义是：可以在头尾两端进行插入和删除操作，且时间复杂度为O(1)，与vector比较，头插效率高，不需要搬移元素；与 list比较，空间利用率比较高。算是 vector和list的结合体。

deque并不是真正连续的空间，而是由一段段连续的小空间拼接而成的，实际deque类似于一个动态的二维数组，其底层结构如下图所示：

![图片](https://i-blog.csdnimg.cn/direct/f41adb50d47949d7b31821591f44e0ce.png) 双端队列底层是一段假象的连续空间，实际是分段连续的，为了维护其“整体连续”以及随机访问 的假象，落在了deque的迭代器身上，因此deque的迭代器设计就比较复杂，如下图所示：

![图片](https://i-blog.csdnimg.cn/direct/35efe8d7794c4b2384328f5bb5180616.png) 那deque是如何借助其迭代器维护其假想连续的结构呢？

![图片](https://i-blog.csdnimg.cn/direct/8fdc0d9bd0274502932ea09684e35e6b.png)

### deque的缺陷

与vector比较，deque的优势是：头部插入和删除时，不需要搬移元素，效率特别高，而且在扩 容时，也不需要搬移大量的元素，因此其效率是比vector高的。

与list比较，其底层是连续空间，空间利用率比较高，不需要存储额外字段（指针）。

但是，deque有一个**致命缺陷：不适合遍历**，因为在遍历时，deque的迭代器要频繁的去检测其是否移动到某段小空间（缓冲区）的边界，导致效率低下，而序列式场景中，可能需要经常遍历，因此在实际中，需要线性结构时，大多数情况下优先考虑vector和list，deque的应用并不多，而目前能看到的一个应用就是，STL用其作为stack和queue的底层数据结构。

### 为什么STL选择deque作为stack和queue的底层默认容器

stack是一种后进先出的特殊线性数据结构，因此只要具有push_back()和pop_back()操作的线性结构，都可以作为stack的底层容器，比如vector和list都可以；queue是先进先出的特殊线性数据结构，只要具有push_back和pop_front操作的线性结构，都可以作为queue的底层容器，比如 list。但是STL中对stack和queue默认选择deque作为其底层容器，主要是因为：

1. stack和queue不需要遍历**(因此stack和queue没有迭代器)**，只需要在固定的一端或者两端进行操作。

2. 在stack中元素增长时，deque比vector的效率高**(扩容时不需要搬移大量数据)**；queue中的元素增长时，deque不仅效率高，而且内存使用率高。

结合了deque的优点，而完美的避开了其缺陷。

## STL标准库中对于stack和queue的模拟实现

### stack的模拟实现

```cpp
#include<deque>
namespace Qin
{
	template<class T, class Con = deque<T>>
	//template<class T, class Con = vector<T>>
	//template<class T, class Con = list<T>>
	class stack
	{
	public:
		stack() {}
		void push(const T& x) { _c.push_back(x); }
		void pop() { _c.pop_back(); }
		T& top() { return _c.back(); }
		const T& top()const { return _c.back(); }
		size_t size()const { return _c.size(); }
		bool empty()const { return _c.empty(); }
	private:
		Con _c;
	};
}
```

### queue的模拟实现

```cpp
#include<deque>
#include <list>
namespace bite
{
	template<class T, class Con = deque<T>>
	//template<class T, class Con = list<T>>
	class queue
	{
	public:
		queue() {}
		void push(const T& x) { _c.push_back(x); }
		void pop() { _c.pop_front(); }
		T& back() { return _c.back(); }
		const T& back()const { return _c.back(); }
		T& front() { return _c.front(); }
		const T& front()const { return _c.front(); }
		size_t size()const { return _c.size(); }
		bool empty()const { return _c.empty; }
	private:
		Con _con;
	};
}
```

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
