---
title: C++进阶：异常
date: 2024-11-02
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨

## 异常的概念及使⽤

### 异常的概念

- 异常处理机制允许程序中独⽴开发的部分**能够在运⾏时就出现的问题进⾏通信并做出相应的处理， 异常使得我们能够将问题的检测与解决问题的过程分开，****程序的⼀部分负责检测问题的出现，然后解决问题的任务传递给程序的另⼀部分，检测环节⽆须知道问题的处理模块的所有细节。**
- C语⾔主要通过错误码的形式处理错误，错误码本质就是对错误信息进⾏分类编号，拿到错误码以后还要去查询错误信息，⽐较⿇烦。**异常时抛出⼀个对象，这个对象可以涵盖更全⾯的各种信息。**

### 异常的抛出和捕获

- 程序出现问题时，我们通过抛出(throw)⼀个对象来引发⼀个异常，该对象的类型以及当前的调⽤链决定了应该由哪个catch的处理代码来处理该异常。
- **被选中的处理代码是调⽤链中与该对象类型匹配且离抛出异常位置最近的那⼀个。**根据抛出对象的类型和内容，程序的抛出异常部分告知异常处理部分到底发⽣了什么错误。
- **当throw执⾏时，throw后⾯的语句将不再被执⾏。**程序的执⾏从throw位置跳到与之匹配的catch 模块，catch可能是同⼀函数中的⼀个局部的catch，也可能是调⽤链中另⼀个函数中的catch，控制权从throw位置转移到了catch位置。这⾥还有两个重要的含义：

> 1. 沿着调⽤链的函数可能提早退出。
> 2. ⼀旦程序开始执⾏异常处理程序，沿着调⽤链创建的对象都将销毁。
> 3. 这里设计到一些智能指针，我们下篇再细讲。

- 抛出异常对象后，会⽣成⼀个异常对象的**拷⻉**，因为抛出的异常对象可能是⼀个局部对象，所以会⽣成⼀个拷⻉对象，这个拷⻉的对象会在catch⼦句后销毁。（这⾥的处理**类似于函数的传值返回**）

### 栈展开

- **抛出异常后，程序暂停当前函数的执⾏，开始寻找与之匹配的catch⼦句，⾸先检查throw本⾝是否在try块内部，如果在则查找匹配的catch语句，如果有匹配的，则跳到catch的地⽅进⾏处理。**
- **如果当前函数中没有try/catch⼦句，或者有try/catch⼦句但是类型不匹配，则退出当前函数，继续在外层调⽤函数链中查找，上述查找的catch过程被称为栈展开。**
- **如果到达main函数，依旧没有找到匹配的catch⼦句，程序会调⽤标准库的 terminate 函数终⽌程序。**
- **如果找到匹配的catch⼦句处理后，catch⼦句代码会继续执⾏。**

```cpp
double Divide(int a, int b)
{
	try
	{
		// 当b == 0时抛出异常
		if (b == 0)
		{
			string s("Divide by zero condition!");
			throw s;
		}
		else
		{
			return ((double)a / (double)b);
		}
	}
	catch (int errid) // 类型不匹配
	{
		cout << errid << endl;
	}
	return 0;
}
void Func()
{
	int len, time;
	cin >> len >> time;
	try
	{
		cout << Divide(len, time) << endl;
	}
	catch (const char* errmsg)// 类型不匹配，也没有接收到
	{
		cout << errmsg << endl;
	}
	cout << __FUNCTION__ << ":" << __LINE__ << "行执行" << endl;
}
int main()
{
	while (1)
	{
		try
		{
			Func();
		}
		catch (const string& errmsg)// 类型匹配执行catch子语句
		{
			cout << errmsg << endl;
		}
	}
	return 0;
}
```

### 查找匹配的处理代码

- ⼀般情况下抛出对象和catch是类型完全匹配的，如果有多个类型匹配的，就**选择离它位置更近的那个。**
- 但是也有⼀些例外，允许从⾮常量向常量的类型转换，也就是权限缩⼩；允许数组转换成指向数组元素类型的指针，函数被转换成指向函数的指针；**允许从派⽣类向基类类型的转换，这个点⾮常实⽤，实际中继承体系基本都是⽤这个⽅式设计的。**
- 如果到main函数，异常仍旧没有被匹配就会终⽌程序，不是发⽣严重错误的情况下，我们是不期望程序终⽌的，所以**⼀般main函数中最后都会使⽤catch(...)，它可以捕获任意类型的异常，但是是不知道异常错误是什么。**

```cpp
#include<thread>
// ⼀般大型项目程序才会使用异常，下面我们模拟设计⼀个服务的几个模块
// 每个模块的继承都是Exception的派生类，每个模块可以添加自己的数据
// 最后捕获时，我们捕获基类就可以
class Exception
{
public:
	Exception(const string& errmsg, int id)
		:_errmsg(errmsg)
		, _id(id)
	{}
	virtual string what() const
	{
		return _errmsg;
	}
	int getid() const
	{
		return _id;
	}
protected:
	string _errmsg;
	int _id;
};
class SqlException : public Exception
{
public:
	SqlException(const string& errmsg, int id, const string& sql)
		:Exception(errmsg, id)
		, _sql(sql)
	{}
	virtual string what() const
	{
		string str = "SqlException:";
		str += _errmsg;
		str += "->";
		str += _sql;
		return str;
	}
private:
	const string _sql;
};
class CacheException : public Exception
{
public:
	CacheException(const string& errmsg, int id)
		:Exception(errmsg, id)
	{}
	virtual string what() const
	{
		string str = "CacheException:";
		str += _errmsg;
		return str;
	}
};
class HttpException : public Exception
{
public:
	HttpException(const string& errmsg, int id, const string& type)
		:Exception(errmsg, id)
		, _type(type)
	{}
	virtual string what() const
	{
		string str = "HttpException:";
		str += _type;
		str += ":";
		str += _errmsg;
		return str;
	}
private:
	const string _type;
};
void SQLMgr()
{
	if (rand() % 7 == 0)
	{
		throw SqlException("权限不足", 100, "select * from name = '张三'");
	}
	else
	{
		cout << "SQLMgr 调用成功" << endl;
	}
}
void CacheMgr()
{
	if (rand() % 5 == 0)
	{
		throw CacheException("权限不足", 100);
	}
	else if (rand() % 6 == 0)
	{
		throw CacheException("数据不存在", 101);
	}
	else
	{
		cout << "CacheMgr 调用成功" << endl;
	}
	SQLMgr();
}
void HttpServer()
{
	if (rand() % 3 == 0)
	{
		throw HttpException("请求资源不存在", 100, "get");
	}
	else if (rand() % 4 == 0)
	{
		throw HttpException("权限不足", 101, "post");
	}
	else
	{
		cout << "HttpServer调用成功" << endl;
	}
	CacheMgr();
}
int main()
{
	srand(time(0));
	while (1)
	{
		//this_thread::sleep_for(chrono::seconds(1));
		try
		{
			HttpServer();
		}
		catch (const Exception& e) // 这⾥捕获基类，基类对象和派⽣类对象都可以被捕获
		{
			cout << e.what() << endl;
		}
		catch (...)
		{
			cout << "Unkown Exception" << endl;
		}
	}
	return 0;
}
```

### 异常重新抛出

有时catch到⼀个异常对象后，需要对错误进⾏分类，其中的某种异常错误需要进⾏**特殊的处理**，其他错误则重新抛出异常给外层调⽤链处理。捕获异常后需要重新抛出，**直接 throw; 就可以把捕获的对象直接抛出。**

```cpp
// 下面程序模拟展⽰了聊天时发送消息，发送失败补货异常，但是可能在
// 电梯地下室等场景⼿机信号不好，则需要多次尝试，如果多次尝试都发
// 送不出去，则就需要捕获异常再重新抛出，其次如果不是网络差导致的
// 错误，捕获后也要重新抛出。
void _SeedMsg(const string& s)
{
	if (rand() % 2 == 0)
	{
		throw HttpException("网络不稳定，发送失败", 102, "put");
	}
	else if (rand() % 7 == 0)
	{
		throw HttpException("你已经不是对象的好友，发送失败", 103, "put");
	}
	else
	{
		cout << "发送成功" << endl;
	}
}
void SendMsg(const string& s)
{
		// 发送消息失败，则再重试3次
		for (size_t i = 0; i < 4; i++)
		{
			try
			{
				_SeedMsg(s);
				break;
			}
			catch (const Exception& e)
			{
				// 捕获异常，if中是102号错误，网络不稳定，则重新发送
				// 捕获异常，else中不是102号错误，则将异常重新抛出
				if (e.getid() == 102)
				{
					// 重试三次以后否失败了，则说明网络太差了，重新抛出异常
					if (i == 3)
						throw;
					cout << "开始第" << i + 1 << "重试" << endl;
				}
				else
				{
					throw;
				}
			}
		}
}
int main()
{
	srand(time(0));
	string str;
	while (cin >> str)
	{
		try
		{
			SendMsg(str);
		}
		catch (const Exception& e)
		{
			cout << e.what() << endl << endl;
		}
		catch (...)
		{
			cout << "Unkown Exception" << endl;

		}
	}
	return 0;
}
```

### 异常安全问题

- **异常抛出后，后⾯的代码就不再执⾏，前⾯申请了资源(内存、锁等)，后⾯进⾏释放，但是中间可能会抛异常就会导致资源没有释放，这⾥由于异常就引发了资源泄漏，产⽣安全性的问题。**中间我们需要捕获异常，释放资源后⾯再重新抛出，当然后⾯智能指针章节讲的RAII（**R**esource **A**cquisition **I**s **I**nitialization ）⽅式解决这种问题是更好的。
- 其次析构函数中，如果抛出异常也要谨慎处理，⽐如析构函数要释放10个资源，释放到第5个时抛出异常，则也需要捕获处理，否则后⾯的5个资源就没释放，也资源泄漏了。《Effctive C++》第8个条款也专⻔讲了这个问题，别让异常逃离析构函数。

```cpp
double Divide(int a, int b)
{
	// 当b == 0时抛出异常
	if (b == 0)
	{
		throw "Division by zero condition!";
	}
	return (double)a / (double)b;
}
void Func()
{
	// 这里可以看到如果发⽣除0错误抛出异常，另外下⾯的array没有得到释放。
	// 所以这里捕获异常后并不处理异常，异常还是交给外层处理，这里捕获了再
	// 重新抛出去。
	int* array = new int[10];
	try
	{
		int len, time;
		cin >> len >> time;
		cout << Divide(len, time) << endl;
	}
	catch (...)
	{
		// 捕获异常释放内存
		cout << "delete []" << array << endl;
		delete[] array;
		throw; // 异常重新抛出，捕获到什么抛出什么
	}
	cout << "delete []" << array << endl;
	delete[] array;
}
int main()
{
	try
	{
		Func();
	}
	catch (const char* errmsg)
	{
		cout << errmsg << endl;
	}
	catch (const exception& e)
	{
		cout << e.what() << endl;
	}
	catch (...)
	{
		cout << "Unkown Exception" << endl;
	}
	return 0;
}
```

我们会发现，上面这种代码写的很挫，有没有可能我们开辟的一些资源能在不需要它的时候自己自动析构呢？这里就涉及到了下一篇我们要讲的智能指针了。

### 异常规范

- 对于用户和编译器⽽⾔，预先知道某个程序会不会抛出异常⼤有裨益，知道某个函数是否会抛出异常有助于简化调⽤函数的代码。
- C++98中函数参数列表的后⾯接throw()，表⽰函数不抛异常，函数参数列表的后⾯接throw(类型1, 类型2...)表⽰可能会抛出多种类型的异常，可能会抛出的类型⽤逗号分割。
- C++98的⽅式这种⽅式过于复杂，实践中并不好⽤，**C++11中进⾏了简化，函数参数列表后⾯加noexcept（没有例外；否）表示不会抛出异常，啥都不加表示可能会抛出异常。** `// C++98 // 这里表示这个函数只会抛出bad_alloc的异常 void* operator new (std::size_t size) throw (std::bad_alloc); // 这里表示这个函数不会抛出异常 void* operator delete (std::size_t size, void* ptr) throw(); // C++11 size_type size() const noexcept; iterator begin() noexcept; const_iterator begin() const noexcept;`
- 编译器并不会在编译时检查noexcept，也就是说**如果⼀个函数⽤noexcept修饰了，但是同时⼜包含了throw语句或者调⽤的函数可能会抛出异常，编译器还是会顺利编译通过的**(有些编译器可能会报个警告)。**但是⼀个声明了noexcept的函数抛出了异常，程序会调⽤ terminate 终⽌程序。**
- noexcept(expression)还可以**作为⼀个运算符去检测⼀个表达式是否会抛出异常**，可能会则返回 false，不会就返回true。

```cpp
double Divide(int a, int b) // noexcept如果加上了这个修饰，
                            // 就会输出1，表示此函数不会抛异常
{
	// 当b == 0时抛出异常
	if (b == 0)
	{
		throw "Division by zero condition!";
	}
	return (double)a / (double)b;
}
int main()
{
	try
	{
		int len, time;
		cin >> len >> time;
		cout << Divide(len, time) << endl;
	}
	catch (const char* errmsg)
	{
		cout << errmsg << endl;
	}
	catch (...)
	{
		cout << "Unkown Exception" << endl;
	}
	int i = 0;
	cout << noexcept(Divide(1, 2)) << endl;
	cout << noexcept(Divide(1, 0)) << endl;
	cout << noexcept(++i) << endl; //检测表达式是否可能会抛异常
	return 0;
}
```

## 标准库的异常

[exception - C++ Reference (cplusplus.com)](https://legacy.cplusplus.com/reference/exception/exception/?kw=exception)

C++标准库也定义了⼀套⾃⼰的⼀套异常继承体系库，基类是exception，所以我们⽇常写程序，需要在主函数捕获exception即可，要获取异常信息，调⽤what函数，what是⼀个虚函数，派⽣类可以重写。

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
