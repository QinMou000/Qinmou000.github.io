---
title: C++初阶：list
date: 2024-08-08
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/a1e2fd8531ae4fbab004f1ecd1a2c8b1.jpeg)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

**学习STL要多看文档**[list - C++ Reference (cplusplus.com)](https://legacy.cplusplus.com/reference/list/list/?kw=list)

## list的介绍

list的 底层结构和我们之前学的双向带头循环链表的结构是差不多的，封装一个节点包含数据和前后节点的指针。迭代器就是指向这个节点的指针，只不过由于原生指针不支持随机访问，所以对这个指针进行了封装。

## list的使用

### constructor

| 构造函数(constructor) | 接口说明 |
| --- | --- |
| list() | 默认构造 |
| list(size_type n,const value_type& val = value_type()) | 构造的list中包含n个值为val的与元素 |
| list(const list& x) | 拷贝构造 |
| list(InputIterator first , InputItertor last) | 用迭代器[first , last)区间中的元素构造list |

### list iterator

> **（1）这里的list迭代器的实现不再是简单的原生指针，而是对原生指针进行了一层封装，使它更符合迭代器的行为**
>
> **（2）这里多加两个模板参数，主要是 * -> 两个操作符重载访问Node里面的内容。如果调的是const_iterator，那么返回的就是const指针（const修饰指针指向的内容不可修改）或引用如果调用普通的iterator，返回普通指针或引用。**
>
> **（3）这样通过模板编译器其实还是会生成两个类，减少了重复的代码**
>
> **（4）list的迭代器不是随机迭代器，而是双向迭代器。**

> 输入迭代器（Input Iterators）：允许读取和遍历容器中的元素，只能单向移动，每个元素只能被访问一次。
>  输出迭代器（Output Iterators）：允许向容器中写入元素，只能单向移动，每个位置只能被写入一次。
>  前向迭代器（Forward Iterators）：允许读写容器中的元素，可以多次读写同一个元素，只能单向移动。
>  双向迭代器（Bidirectional Iterators）：具有前向迭代器的所有功能，同时允许在容器中双向移动。
>  随机访问迭代器（Random Access Iterators）：具有双向迭代器的所有功能，同时提供了快速随机访问容器中任意元素的能力，如指针算术运算。

```cpp
template<class T,class Ref,class Ptr>
struct list_iterator
{
	typedef list_iterator<T, Ref, Ptr> self;
	typedef list_iterator<T, T&, T*> iterator;
	typedef list_iterator<T, const T&, const T*> const_iterator;

	typedef struct Node<T> Node;

	list_iterator(Node* node = nullptr)
		:_node(node)
	{}
	list_iterator(const self& lf)
	{
		_node = lf._node;
	}
	Ref operator*()
	{
		return _node->data;
	}
	Ptr operator->()
	{
		return &_node->data;
	}
	self& operator++()
	{
		_node = _node->next;
		return *this;
	}
	self operator++(int)
	{
		self tmp(_node);
		//Node* tmp = new Node(_node->data);//自己想出来的写法哟~but有点复杂了
		_node = _node->next;
		return tmp;
	}
	self& operator--()
	{
		_node = _node->prev;
		return *this;
	}
	self operator--(int)
	{
		self tmp(_node);
		//Node* tmp = new Node(_node->data);//自己想出来的写法哟~but有点复杂了
		_node = _node->prev;
		return tmp;
	}
	bool operator==(const self& it)
	{
		return _node == it._node;
	}
	bool operator!=(const self& it)
	{
		return _node != it._node;
	}
	Node* _node;
};
```

| [begin()](https://legacy.cplusplus.com/reference/list/list/begin/) | 返回第一个元素的迭代器 |
| --- | --- |
| [end()](https://legacy.cplusplus.com/reference/list/list/end/) | 返回最后一个元素的下一个位置的迭代器 |
| [rbegin()](https://legacy.cplusplus.com/reference/list/list/rbegin/) | 返回第一个元素的reverse_iterator,即end位置 |
| [rend()](https://legacy.cplusplus.com/reference/list/list/rend/) | 返回最后一个元素下一个位 置的reverse_iterator,即begin位置 |

> **【注意】**
>
> **（1）begin与end为正向迭代器，对迭代器执行++操作，迭代器向后移动**
>
> **（2）rbegin(end)与rend(begin)为反向迭代器，对迭代器执行++操作，迭代器向前移动**

![图片](https://i-blog.csdnimg.cn/direct/6ef01c57dc134474a3a084b6e44e8c56.png)

### list capacity

| 函数声明 | 接口说明 |
| --- | --- |
| [empty()](https://legacy.cplusplus.com/reference/list/list/empty/) | 检测list是否为空，是返回true，否则返回false |
| [size()](https://legacy.cplusplus.com/reference/list/list/size/) | 返回list中有效节点的个数 |

### list element access

| 函数声明 | 接口说明 |
| --- | --- |
| [front()](https://legacy.cplusplus.com/reference/list/list/front/) | 返回list的第一个节点中值的引用 |
| [back()](https://legacy.cplusplus.com/reference/list/list/back/) | 返回list的最后一个节点中值的引用 |

### list modifiers

| 函数声明 | 接口说明 |
| --- | --- |
| [push_front()](https://legacy.cplusplus.com/reference/list/list/push_front/) | 在list首元素前插入值为val的元素 |
| [pop_front()](https://legacy.cplusplus.com/reference/list/list/pop_front/) | 删除list中第一个元素 |
| [push_back()](https://legacy.cplusplus.com/reference/list/list/push_back/) | 在list尾部插入值为val的元素 |
| [pop_back()](https://legacy.cplusplus.com/reference/list/list/pop_back/) | 删除list中最后一个元素 |
| [insert()](https://legacy.cplusplus.com/reference/list/list/insert/) | 在list position 位置中插入值为val的元素 |
| [erase()](https://legacy.cplusplus.com/reference/list/list/erase/) | 删除list position位置的元素 |
| [swap()](https://legacy.cplusplus.com/reference/list/list/swap/) | 交换两个list中的元素 |
| [clear()](https://legacy.cplusplus.com/reference/list/list/clear/) | 清空list中的有效元素 |

## list的迭代器失效

此处大家可将迭代器*暂时*理解成类似于指针，迭代器失效即迭代器所指向的节点的无效，即该节点被删除了。因为list的底层结构为带头结点的双向循环链表，因此**在list中进行插入时是不会导致list的迭代器失效的，只有在删除时才会失效，并且失效的只是指向被删除节点的迭代器，其他迭代器不会受到影响。**

![图片](https://i-blog.csdnimg.cn/direct/82e962e5ae7a4d4095f14bf5af42b00e.png)

> **随机插入完成后会返回新插入节点的迭代器，随机删除完成后会返回删除节点的下一个节点的迭代器，若删除了最后一个元素，则返回头节点的迭代器。**

```cpp
iterator insert(iterator pos,const T& val)
{
	Node* cur = pos._node;
	Node* prev = cur->prev;
	Node* newnode = new Node(val);

	prev->next = newnode;
	newnode->prev = prev;
	cur->prev = newnode;
	newnode->next = cur;

	++_size;

	return newnode;
}
iterator erase(iterator pos)
{
	assert(pos != end());
	Node* next = pos._node->next;
	Node* prev = next->prev;

	delete pos._node;

	prev->next = next;
	next->prev = prev;
	--_size;
	return next;
}
```

## 模拟实现list

[function/list类/list.h · 钦某/C++learning - 码云 - 开源中国 (gitee.com)](https://gitee.com/wang-qin928/c-learning/blob/master/function/list%E7%B1%BB/list.h)

## 对比list和vector

|  | vector | list |
| --- | --- | --- |
| 底 层 结 构 | 动态顺序表，一段连续空间 | 带头结点的双向循环链表 |
| 随 机 访 问 | 支持随机访问，访问某个元素效率O(1) | 不支持随机访问，访问某个元素效率O(N) |
| 插 入 和 删 除 | 任意位置插入和删除效率低，需要搬移元素，时间 复杂度为O(N)，插入时有可能需要增容，增容： 开辟新空间，拷贝元素，释放旧空间，导致效率更低 | 任意位置插入和删除效率高， 不需要搬移元素，时间复杂度 为O(1) |
| 空 间 利 用 率 | 底层为连续空间，不容易造成内存碎片，空间利用 率高，缓存利用率高 | 底层节点动态开辟，小节点容 易造成内存碎片，空间利用率 低，缓存利用率低 |
| 迭 代 器 | 原生态指针 | 对原生态指针(节点指针)进行封装 |
| 迭 代 器 失 效 | 在插入元素时，要给所有的迭代器重新赋值，因为 插入元素有可能会导致重新扩容，致使原来迭代器 失效，删除时，当前迭代器需要重新赋值否则会失 效 | 插入元素不会导致迭代器失 效，删除元素时，只会导致当 前迭代器失效，其他迭代器不 受影响 |
| 使 用 场 景 | 需要高效存储，支持随机访问，不关心插入删除效 率 | 大量插入和删除操作，不关心 随机访问 |

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
