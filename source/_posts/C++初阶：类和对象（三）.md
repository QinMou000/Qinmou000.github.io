---
title: C++初阶：类和对象（三）
date: 2024-07-17
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/a1e2fd8531ae4fbab004f1ecd1a2c8b1.jpeg)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨

## 构造函数中的初始化列表

• 之前实现构造函数时，初始化成员变量主要使⽤函数体内赋值，构造函数初始化还有⼀种⽅式，就是**初始化列表**，初始化列表的使⽤⽅式是以⼀个冒号开始，接着是⼀个以逗号分隔的数据成 员列表，每个"成员变量"后⾯跟⼀个放在括号中的初始值或表达式。

```cpp
class A
{
public:
	A()
		:_a(1)//初值
		,_b(1+1)//表达式
	{}
private:
	int _a;
	int _b;
};
```

• **每个成员变量在初始化列表中只能出现⼀次**，语法理解上初始化列表可以认为是每个成员变量定义初始化的地⽅。

**• 引⽤成员变量（在定义的时候初始化，不能重新赋值），const成员变量（只能初始化，不能赋值），没有默认构造的类类型变量，必须放在初始化列表位置进⾏初始化，否则会编译报错。**

```cpp
class MyClass {
public:
    // 常量成员
    // error C2512: “Time”: 没有合适的默认构造函数可⽤
    const int constVar;

    // 引用成员
    // error C2530 : “Date::_ref” : 必须初始化引⽤
    int& refVar;

    // 没有默认构造函数的类类型成员
    // error C2789 : “Date::_n” : 必须初始化常量限定类型的对象
    AnotherClass obj;

    MyClass(int value, int& ref, AnotherClass objParam)
        : constVar(value), refVar(ref), obj(objParam) {}
};
```

• C++11⽀持在成员变量**声明的位置给缺省值**，这个缺省值主要是**给没有显示在初始化列表初始化的成员使⽤的。**

• 尽量使⽤初始化列表初始化，因为那些你不在初始化列表初始化的成员也会⾛初始化列表，如果这个**成员在声明位置给了缺省值，初始化列表会⽤这个缺省值初始化**。如果你**没有给缺省值**，对于**没有显示在初始化列表初始化的内置类型成员**是否初始化**取决于编译器**，C++并没有规定。对于**没有显⽰在初始化列表初始化**的**⾃定义类型成员**会调⽤这个成员类型的**默认构造函数**，如果没有默认构造会编译错误。

• **初始化列表中按照成员变量在类中声明顺序进⾏初始化**，跟成员在初始化列表出现的的先后顺序⽆关。建议声明顺序和初始化列表顺序保持⼀致。

```cpp
#include<iostream>
using namespace std;
class A
{
public:
	A(int a)
		:_a1(a)
		, _a2(_a1)
	{}
	void Print() {
		cout << _a1 << " " << _a2 << endl;
	}
private:
	int _a2 = 2;
	int _a1 = 2;
};
int main()
{
	A aa(1);
	aa.Print();//输出: 1 随机值
}
```

## 类型转换

• C++⽀持内置类型隐式类型转换为类类型对象，需要有相关内置类型为参数的构造函数。

• 构造函数前⾯加explicit就不再⽀持隐式类型转换

```cpp
#include<iostream>
using namespace std;
class A
{
public:
	//构造函数explicit就不再⽀持隐式类型转换
	 //explicit A(int a1)
		A(int a1)
		:_a1(a1)
	{}
	//explicit A(int a1, int a2)
	A(int a1, int a2)
		:_a1(a1)
		, _a2(a2)
	{}
	void Print() const
	{
		cout << _a1 << " " << _a2 << endl;
	}
private:
	int _a1 = 1;
	int _a2 = 2;
};
int main()
{
	// 1构造⼀个A的临时对象，再⽤这个临时对象拷⻉构造aa3
	// 编译器遇到连续构造+拷⻉构造->优化为直接构造
	A aa1 = 1;
	aa1.Print();
	const A& aa2 = 1;
	aa2.Print();
	// C++11之后才⽀持多参数转化
	A aa3 = { 2,2 };
	aa3.Print();
	return 0;
}
```

## static成员

• ⽤static修饰的成员变量，称之为静态成员变量，**静态成员变量⼀定要在类外进⾏初始化**。

• 静态成员变量为**所有类对象所共享**，不属于某个具体的对象，不存在对象中，存放在**静态区**。

• ⽤static修饰的成员函数，称之为静态成员函数，**静态成员函数没有this指针。**

• 静态成员函数中**可以访问其他的静态成员**，但是**不能访问⾮静态的，因为没有this指针。**

• **⾮静态的成员函数，可以访问任意的静态成员变量和静态成员函数。**

• **突破类域就可以访问静态成员**，可以通过**类名::静态成员** 或者 **对象.静态成员** 来访问静态成员变和静态成员函数。

• 静态成员也是类的成员，受public、protected、private 访问限定符的限制。

• 静态成员变量**不能在声明位置给缺省值初始化**，因为缺省值是个构造函数初始化列表的，**静态成员变量不属于某个对象，不⾛构造函数初始化列表。**

```cpp
// 实现⼀个类，计算程序中创建出了多少个类对象？
#include<iostream>
using namespace std;
class A
{
public:
	A()
	{
		++_scount;
	}
	A(const A& t)
	{
		++_scount;
	}
	~A()
	{
		--_scount;
	}
	static int GetACount()
	{
		return _scount;
	}
private:
	// 类⾥⾯声明
	static int _scount;
};
// 类外⾯初始化
int A::_scount = 0;
int main()
{
	cout << A::GetACount() << endl;
	A a1, a2;
	A a3(a1);
	cout << A::GetACount() << endl;
	cout << a1.GetACount() << endl;
	//编译报错：error C2248: “A::_scount”: ⽆法访问 private 成员(在“A”类中声明)
	//cout << A::_scount << endl;
	return 0;
}
```

有一道题：ABCD四个类，下面程序中它们的构造函数和析构函数的调用顺序分别是？

```cpp
C c;
int main()
{
	A a;
	B b;
	static D d;
	return;
}
```

> 分析:
>
> 1、类的析构函数调用一般按照构造函数调用的相反顺序进行调用，但是要注意static对象的存在， 因为**static改变了对象的生存作用域**，**需要等待程序结束时才会析构释放对象**
>
> 2、**全局对象先于局部对象进行构造**
>
> 3、**局部对象按照出现的顺序进行构造，无论是否为static**
>
> 4、所以构造的顺序为 C A B D
>
> 5、析构的顺序按照构造的**相反顺序析构**，只需注意static改变对象的生存作用域之后，会**放在局部对象之后进行析构**
>
> 6、因此析构顺序为B A D C

## 友元

• 友元提供了⼀种**突破类访问限定符封装**的⽅式，友元分为：**友元函数和友元类**，在函数声明或者类声明的前⾯加friend，并且把友元声明放到⼀个类的⾥⾯。

• 外部友元函数可访问类的私有和保护成员，友元函数**仅仅是⼀种声明**，他**不是类的成员函数**。

• **友元函数可以在类定义的任何地⽅声明，不受类访问限定符限制。**

• **⼀个函数可以是多个类的友元函数**。

• **友元类中的成员函数都可以是另⼀个类的友元函数**，都可以访问另⼀个类中的私有和保护成员。

• **友元类的关系是单向的，不具有交换性**，⽐如A类是B类的友元，但是B类不是A类的友元。

• 友元类关系**不能传递**，如果A是B的友元， B是C的友元，但是A不是B的友元。

• 有时提供了便利。但是友元会增加耦合度，破坏了封装**（我们需要高内聚低耦合）**，所以友元不宜多⽤。

```cpp
#include<iostream>
using namespace std;
// 前置声明，否则A的友元函数声明编译器不认识B，编译器都是从上到下识别的
class B;
class A
{
	// 外部函数友元声明
	friend void func(const A& aa, const B& bb);
private:
	int _a1 = 1;
	int _a2 = 2;
};
class B
{
	// 外部函数友元声明
	friend void func(const A& aa, const B& bb);
private:
	int _b1 = 3;
	int _b2 = 4;
};
void func(const A& aa, const B& bb)
{
	cout << aa._a1 << endl;// 访问类里面的私有成员变量
	cout << bb._b1 << endl;
}
int main()
{
	A aa;
	B bb;
	func(aa, bb);
	return 0;
}
```

```cpp
#include<iostream>
using namespace std;
class A
{
	// 类友元声明
	friend class B;
private:
	int _a1 = 1;
	int _a2 = 2;
};
class B
{
public:
	void func1(const A& aa)
	{
		cout << aa._a1 << endl;// 访问友元类的私有成员变量
		cout << _b1 << endl;
	}
	void func2(const A& aa)
	{
		cout << aa._a2 << endl;// 访问友元类的私有成员变量
		cout << _b2 << endl;
	}
private:
	int _b1 = 3;
	int _b2 = 4;
};
int main()
{
	A aa;
	B bb;
	bb.func1(aa);
	bb.func1(aa);
	return 0;
}
```

## 内部类

• **如果⼀个类定义在另⼀个类的内部**，这个类就叫做内部类。内部类是⼀个独⽴的类，跟定义在全局相⽐，他只是受外部类类域限制和访问限定符限制，所以外部类定义的对象中不包含内部类。

• **内部类默认是外部类的友元类。（内部类可以访问外部类的私有成员变量类，但外部不能突破内部类的访问限定符）**

• 内部类本质也是⼀种封装，当A类跟B类紧密关联，A类实现出来主要就是给B类使⽤，那么可以考 虑把A类设计为B的内部类，如果放到private/protected位置，那么A类就是B类的专属内部类，其 他地⽅都⽤不了。

```cpp
#include<iostream>
using namespace std;
class A
{
private:
	static int _k;// 静态变量在类外初始化，不属于任何类，放在静态区
	int _h = 1;
public:
	class B // B默认就是A的友元
	{
	public:
		void foo(const A & a)
		{
			cout << _k << endl;
			cout << a._h << endl; // 内部类可以访问外部类的私有成员变量类，
			                      // 但外部不能突破内部类的访问限定符
		}
	};
};
int A::_k = 1;
int main()
{
	cout << sizeof(A) << endl;
	A::B b;// 注意对象定义方式
	A aa;
	b.foo(aa);
	return 0;
}
```

## 匿名对象

• ⽤类型 (实参) 定义出来的对象叫做**匿名对象**，相⽐之前我们定义的 类型 对象名(实参) 定义出来的 叫**有名对象**

• **匿名对象⽣命周期只在当前⼀⾏**，⼀般临时定义⼀个对象当前⽤⼀下即可，就可以定义匿名对象。

```cpp
#include<iostream>
using namespace std;
class A
{
public:
	A(int a = 0)
		:_a(a)
	{
		cout << "A(int a)" << endl;
	}
	~A()
	{
		cout << "~A()" << endl;
	}
private:
	int _a;
};
class Solution {
public:
	int Sum_Solution(int n) {
		//... 这个函数和类也没有直接关系
		return n;
	}
};
int main()
{
	A aa1;
	// 不能这么定义对象，因为编译器⽆法识别下⾯是⼀个函数声明，还是对象定义
	//A aa1();
	// 但是我们可以这么定义匿名对象，匿名对象的特点不⽤取名字，
	// 但是他的⽣命周期只有这⼀⾏，我们可以看到下⼀⾏他就会⾃动调⽤析构函数
	A();
	A(1);
	A aa2(2);
	// 匿名对象在这样场景下就很好⽤，当然还有⼀些其他使⽤场景，这个以后遇到了再说
	Solution().Sum_Solution(10);// 你只想调用以下这个类里面的某个函数
	return 0;
}
```

强大的编译器优化

• 现代编译器会为了尽可能提⾼程序的效率，在不影响正确性的情况下会尽可能减少⼀些传参和传参 过程中可以省略的拷⻉。

• 如何优化C++标准并没有严格规定，各个编译器会根据情况⾃⾏处理。当前主流的相对新⼀点的编 译器对于连续⼀个表达式步骤中的连续拷⻉会进⾏合并优化，有些更新更"激进"的编译还会进⾏跨⾏跨表达式的合并优化。

```cpp
#include<iostream>
using namespace std;
class A
{
public:
	A(int a = 0)
		:_a1(a)
	{
		cout << "A(int a)" << endl;
	}
	A(const A& aa)
		:_a1(aa._a1)
	{
		cout << "A(const A& aa)" << endl;
	}
	A& operator=(const A& aa)
	{
		cout << "A& operator=(const A& aa)" << endl;
		if (this != &aa)
		{
				_a1 = aa._a1;
		}
		return *this;
	}
	~A()
	{
		cout << "~A()" << endl;
	}
private:
	int _a1 = 1;
};
void f1(A aa)
{}
A f2()
{
	A aa;
	return aa;
}
int main()
{
	// 传值传参
	A aa1;
	f1(aa1);
	cout << endl;
	// 隐式类型，连续构造+拷⻉构造->优化为直接构造
	f1(1);
	// ⼀个表达式中，连续构造+拷⻉构造->优化为⼀个构造
	f1(A(2));
	cout << endl;
	cout << "***********************************************" << endl;
	// 传值返回
	// 返回时⼀个表达式中，连续拷⻉构造+拷⻉构造->优化⼀个拷⻉构造 （vs2019）
	// ⼀些编译器会优化得更厉害，进⾏跨⾏合并优化，直接变为构造。（vs2022）
	f2();
	cout << endl;
	// 返回时⼀个表达式中，连续拷⻉构造+拷⻉构造->优化⼀个拷⻉构造 （vs2019）
	// ⼀些编译器会优化得更厉害，进⾏跨⾏合并优化，直接变为构造。（vs2022）
	A aa2 = f2();
	cout << endl;
	// ⼀个表达式中，连续拷⻉构造+赋值重载->⽆法优化
	aa1 = f2();
	cout << endl;
	return 0;
}
```

代码输出结果： （VS2022）

![图片](https://i-blog.csdnimg.cn/direct/f5951462efd14c898f1c0a5339e8bb33.png)

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
