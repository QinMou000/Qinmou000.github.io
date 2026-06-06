---
title: C++初阶：string
date: 2024-07-26
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/a1e2fd8531ae4fbab004f1ecd1a2c8b1.jpeg)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## 为什么要学习string类

> C语言中，字符串是以'\0'结尾的一些字符的集合，为了操作方便，C标准库中提供了一些str系列 的库函数，但是这些库函数与字符串是分离开的，不太符合OOP：面向对象编程（Object-Oriented Programming，简称OOP）的思想，而且底层空间需要用户自己管理，稍不留神可能还会越界访问。
>
> 在OJ中，有关字符串的题目基本以string类的形式出现，而且在常规工作中，为了简单、方便、 快捷，基本都使用string类，很少有人去使用C库中的字符串操作函数。

## auto关键字

> （1）在早期C/C++中auto的含义是：使用auto修饰的变量，是具有自动存储器的局部变量，后来这个不重要了。C++11中，标准委员会变废为宝赋予了auto全新的含义即：auto不再是一个存储类型 指示符，而是作为一个新的类型指示符来指示编译器，auto声明的变量必须由编译器在编译时期***推导而得***。
>
> （2）***用auto声明指针类型时，用auto和auto*没有任何区别，但用auto声明引用类型时则必须加&***
>
> （3）***当在同一行声明多个变量时，这些变量必须是相同的类型，否则编译器将会报错，***因为编译器实际 只对第一个类型进行推导，然后用推导出来的类型定义其他变量。
>
> （4）***auto不能作为函数的参数，可以做返回值，但是建议谨慎使用***
>
> （5）***auto不能直接用来声明数组***

```cpp
int main()
{
	int x = 10;
	auto y = &x;
	auto* z = &x;
	auto& m = x;

	cout << typeid(x).name() << endl;//输出：int
	cout << typeid(y).name() << endl;//输出：int * __ptr64
	cout << typeid(z).name() << endl;//输出：int * __ptr64

	return 0;
}
```

## 范围for

> （1）对于一个有范围的集合而言，由程序员来说明循环的范围是多余的，有时候还会容易犯错误。因此 C++11中引入了基于范围的for循环。***for循环后的括号由冒号“ ：”分为两部分：第一部分是范围内用于迭代的变量，第二部分则表示被迭代的范围，自动迭代，自动取数据，自动判断结束。***
>
> （2）范围for可以作用到数组和容器对象上进行遍历
>
> （3）范围for的底层很简单，容器遍历实际就是***替换为迭代器***，这个从汇编层也可以看到。

```cpp
int main()
{
	int arr[] = { 1,2,3,4,5 };
	for (auto& a : arr)
		cout << a << " ";
	cout << endl;

	string str("hello world");
	for (auto& ch : str)
		cout << ch;
	cout << endl;
	return 0;
}
```

## string常用接口

### 常见构造

| 函数名(constructor) | 功能说明 |
| --- | --- |
| [string](https://legacy.cplusplus.com/reference/string/string/string/)**()** | 构造空的string类对象，即空字符串 |
| **string(conshar* s)t c** | 用C-string来构造string类对象 |
| string(size_t n,char c) | string类对象中包含n个字符c |
| **string(const string& s)** | 拷贝构造函数 |

```cpp
void Teststring()
{
	string s1;				 // 构造空的string类对象s1
	string s2("hello bit");  // 用C格式字符串构造string类对象s2
	string s3(s2);			 // 拷贝构造s3
}
```

### string类对象的容量操作

| 函数名称 | 功能说明 |
| --- | --- |
| [size](https://legacy.cplusplus.com/reference/string/string/size/)（重点） | 返回字符串有效字符长度 |
| [length](https://legacy.cplusplus.com/reference/string/string/length/) | 返回字符串有效字符长度 |
| [capacity](https://legacy.cplusplus.com/reference/string/string/capacity/) | 返回空间总大小（不包含'\0'） |
| [empty](https://legacy.cplusplus.com/reference/string/string/empty/)（重点） | 检测字符串释放为空串，是返回true，否则返回false |
| [clear](https://legacy.cplusplus.com/reference/string/string/clear/)（重点） | 清空有效字符 |
| [reserve](https://legacy.cplusplus.com/reference/string/string/reserve/)（重点） | 为字符串预留空间 |
| [resize](https://legacy.cplusplus.com/reference/string/string/resize/)（重点） | 将有效字符的个数该成n个，多出的空间用字符c填充 |

> 注意：
>
> 1. ***size()与length()方法底层实现原理完全相同***，引入size()的原因是为了与其他容器的接 口保持一致，一般情况下基本都是用size()。
>
> 2. ***clear()只是将string中有效字符清空，不改变底层空间大小。***
>
> 3. resize(size_t n) 与 resize(size_t n, char c)都是将字符串中有效字符个数改变到n个，不同的是当字符个数增多时：resize(n)用0来填充多出的元素空间，resize(size_t n, char c)用字符c来填充多出的元素空间。**（ps：resize在改变元素个数时，如果是将元素个数增多，可能会改变底层容量的大小，如果是将元素个数减少，底层空间总大小不变。）**
>
> 4. reserve(size_t res_arg=0)：为string预留空间，***不改变有效元素个数，当reserve的参数小于string的底层空间总大小时，reserver不会改变容量大小。***

### string类对象的访问及遍历操作

| 函数名称 | 功能说明 |
| --- | --- |
| [operator[]](https://legacy.cplusplus.com/reference/string/string/operator%5B%5D/)（重点） | 返回pos位置的字符，const string类对象调用 |
| [begin](https://legacy.cplusplus.com/reference/string/string/begin/)**和**[end](https://legacy.cplusplus.com/reference/string/string/end/) | begin获取一个字符的迭代器 end获取最后一个字符下一个位置的迭代器 |
| [rbegin](https://legacy.cplusplus.com/reference/string/string/rbegin/)**和**[rend](https://legacy.cplusplus.com/reference/string/string/rend/) | rbegin获取最后一个字符的迭代器 rend获取第一个字符上一个位置的迭代器 |
| 范围for | C++11支持更简洁的范围for的新遍历方式 |

### string类对象的修改操作

| 函数名称 | 功能说明 |
| --- | --- |
| [push_back](https://legacy.cplusplus.com/reference/string/string/push_back/) | 在字符串后尾插字符c |
| [append](https://legacy.cplusplus.com/reference/string/string/append/) | 在字符串后追加一个字符串 |
| [operator+=](https://legacy.cplusplus.com/reference/string/string/operator+=/)（重点） | 在字符串后追加字符串str |
| [c_str](https://legacy.cplusplus.com/reference/string/string/c_str/)（重点） | 返回C格式字符串(返回字符串第一个字符的指针) |
| [find](https://legacy.cplusplus.com/reference/string/string/find/)（重点） | 从字符串pos位置开始往后找字符c，返回该字符在字符串中的位置 |
| [rfind](https://legacy.cplusplus.com/reference/string/string/rfind/) | 从字符串pos位置开始往前找字符c，返回该字符在字符串中的位置 |
| [substr](https://legacy.cplusplus.com/reference/string/string/substr/) | 在str中从pos位置开始，截取n个字符，然后将其返回 |
| [npos](https://legacy.cplusplus.com/reference/string/string/npos/)（重点） | 整型的最大值-1 |

> 注意：
>
> 1. 在string尾部追加字符时，s.push_back(c) / s.append(1, c) / s += 'c'三种的实现方式都差不多，一般情况下string类的+=操作用的比较多，+=操作不仅可以连接单个字符，还可以连接字符串。
>
> 2. 对string操作时，如果能够大概预估到放多少字符，可以先通过reserve把空间预留好，减少消耗。

### string类非成员函数

| 函数名称 | 功能说明 |
| --- | --- |
| [operator+](https://legacy.cplusplus.com/reference/string/string/operator+/) | 尽量少用，因为传值返回，导致深拷贝效率低 |
| [operator>>](https://legacy.cplusplus.com/reference/string/string/operator%3E%3E/)（重点） | 输入运算符重载 |
| [operator<<](https://legacy.cplusplus.com/reference/string/string/operator%3C%3C/)（重点） | 输出运算符重载 |
| [getline](https://legacy.cplusplus.com/reference/string/string/getline/)（重点） | 获取一行字符串(可以包含空格) |
| [relational operators](https://legacy.cplusplus.com/reference/string/string/operators/)（重点） | 大小比较 |

## 浅拷贝

***也称位拷贝，编译器只是将对象中的值拷贝过来。如果对象中管理资源，最后就会导致多个对象共享同一份资源，当一个对象销毁时就会将该资源释放掉，而此时另一些对象不知道该资源已经被释放，以为还有效，所以当继续对资源进项操作时，就会发生发生了访问违规。***

![图片](https://i-blog.csdnimg.cn/direct/fab8ac571555494b8ff99e159f4ecdad.png)

## 深拷贝

> ***每个string对象都要有空间来放字符串，而s2要用s1拷贝构造出来因此需要给s2分配一块独立的空间，保证多个对象之间不会因共享资源而造成多次释放造成的程序崩溃问题***
>
> 如果一个类中涉及到资源的管理，其拷贝构造函数、赋值运算符重载以及析构函数必须要显式给 出。一般情况都是按照深拷贝方式提供。

![图片](https://i-blog.csdnimg.cn/direct/863a7699b9554890bdfbecd7b8a3d024.png)

## 模拟实现string类

[function/string类 · 钦某/C++learning - 码云 - 开源中国 (gitee.com)](https://gitee.com/wang-qin928/c-learning/tree/master/function/string%E7%B1%BB)

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
