---
title: C++进阶：继承
date: 2024-09-12
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## 继承的概念

继承(inheritance)机制是⾯向对象程序设计使代码可以复⽤的最重要的⼿段，它允许我们在保持原有类特性的基础上进⾏扩展，增加⽅法(成员函数)和属性(成员变量)，这样产⽣新的类，称派⽣类。继承呈现了⾯向对象程序设计的层次结构，体现了由简单到复杂的认知过程。以前我们接触的函数层次的复⽤，继承是类设计层次的复⽤。

没有继承之前我们设计了两个类**Student和Teacher**，Student和Teacher都有姓名/地址/ 电话/年龄等成员变量，都有identity⾝份认证的成员函数，**设计到两个类⾥⾯就是冗余的**。当然他们也有⼀些不同的成员变量和函数，⽐如⽼师独有成员变量是职称，学⽣的独有成员变量是学号；学⽣的独有成员函数是学习，⽼师的独有成员函数是授课。

下⾯我们公共的成员都放到Person类中，Student和teacher都继承Person，就可以复⽤这些成员，就 不需要重复定义了，省去了很多⿇烦

```cpp
class person
{
public:
	// 进⼊校园/图书馆/实验室刷⼆维码等⾝份认证
	void identity()
	{
		cout << "void identity()" << _name << endl;
	}
protected:
	string _name = "张三"; // 姓名
	int _age = 18; // 年龄
	string _address; // 地址
	string _tel; // 电话
};

class Student :public person
{
public:
	// 学习
	void study()
	{
		// ...
	}
protected:
	int _stuid; // 学号
};
class Teacher :public person
{
public:
	// 授课
	void teaching()
	{
		//...
	}
protected:
	string _title; // 职称
};
int main()
{
	Student s;
	Teacher t;
	s.identity();
	t.identity();

	return 0;
}
```

## 继承定义

### 定义格式

下⾯我们看到Person是基类，也称作⽗类。Student是派⽣类，也称作⼦类。(因为翻译的原因，所以 既叫基类/派⽣类，也叫⽗类/⼦类)

![图片](https://i-blog.csdnimg.cn/direct/b3e49c7fc44a4fdd8bd5fd341a4fd7f8.png)

![图片](https://i-blog.csdnimg.cn/direct/bddf5b3a1f2b478cbbfcf6aaa6cdae31.png)

### 继承基类成员访问方式的变化

| 类成员/继承方式 | public继承 | protected继承 | private继承 |
| --- | --- | --- | --- |
| 基类的public成员 | 派生类的public成员 | 派生类的protected成员 | 派生类的private成员 |
| 基类的protected成员 | 派生类的protected成员 | 派生类的protected成员 | 派生类的private成员 |
| 基类的private成员 | 在派生类中不可见 | 在派生类中不可见 | 在派生类中不可见 |

> 1. 基类private成员在派⽣类中⽆论以什么⽅式继承都是不可⻅的。这⾥的不可⻅是指基类的私有成员还是被继承到了派⽣类对象中，但是语法上限制派⽣类对象不管在类⾥⾯还是类外⾯都不能去访问它。
>
> 2. 基类private成员在派⽣类中是不能被访问，如果基类成员不想在类外直接被访问，但需要在派⽣类中能访问，就定义为protected。可以看出**保护成员限定符是因继承才出现的。**
>
> 3. 实际上⾯的表格我们进⾏⼀下总结会发现，基类的私有成员在派⽣类都是不可⻅。基类的其他成员在派⽣类的访问⽅式 == Min(成员在基类的访问限定符，继承⽅式)，public > protected > private。
>
> 4. 使⽤关键字class时默认的继承⽅式是private，使⽤struct时默认的继承⽅式是public，不过最好显示的写出继承⽅式。
>
> 5. 在实际运⽤中⼀般使⽤都是public继承，⼏乎很少使⽤protetced/private继承，也不提倡使⽤ protetced/private继承，因为protetced/private继承下来的成员都只能在派⽣类的类⾥⾯使⽤，实际中扩展维护性不强。

### 继承类模板

```cpp
// stack和vector的关系，既符合is-a，也符合has-a
template<class T>
class stack : public std::vector<T>
{
public:
	void push(const T& x)
	{
		// 基类是类模板时，需要指定⼀下类域，
		// 否则编译报错:error C3861: “push_back”: 找不到标识符

		// 因为stack<int>实例化时，也实例化vector<int>了
		// 但是模版是按需实例化，push_back等成员函数未实例化，所以找不到
		vector<T>::push_back(x);
		//push_back(x);
	}
};
```

## 基类和派⽣类间的转换

• public继承的派⽣类对象**可以赋值给基类的指针 / 基类的引⽤**。这⾥有个形象的说法叫切⽚或者切割。寓意把派⽣类中基类那部分切出来，基类指针或引⽤指向的是派⽣类中切出来的基类那部分。

• 基类对象不能赋值给派⽣类对象。

• 基类的指针或者引⽤可以通过强制类型转换赋值给派⽣类的指针或者引⽤。但是必须是基类的指针是指向派⽣类对象时才是安全的。这⾥基类如果是多态类型，可以使⽤RTTI(Run-Time Type Information)的dynamic_cast 来进⾏识别后进⾏安全转换。（ps：这个我们后⾯类型转换章节再 单独专⻔讲解，这⾥先提⼀下）

![图片](https://i-blog.csdnimg.cn/direct/0524234e0f6743d28f4b4c6246c590d1.png)

```cpp
class Person
{
protected:
	string _name; // 姓名
	string _sex; // 性别
	int _age; // 年龄
};
class Student : public Person
{
public:
	int _No; // 学号
};
int main()
{
	Student sobj;
	// 1.派⽣类对象可以赋值给基类的指针/引⽤
	Person* pp = &sobj;
	Person& rp = sobj;
	// ⽣类对象可以赋值给基类的对象是通过调⽤后⾯会讲解的基类的拷⻉构造完成的
	Person pobj = sobj;
	//2.基类对象不能赋值给派⽣类对象，这⾥会编译报错
	sobj = pobj;
	return 0;
}
```

## 继承中的作用域

1. 在继承体系中基类和派⽣类都有独⽴的作⽤域。

2. 派⽣类和基类中有同名成员，派⽣类成员将**屏蔽基类对同名成员的直接访问**，这种情况叫**隐藏。** （在派⽣类成员函数中，可以使⽤基类::基类成员显示访问）

3. 需要注意的是如果是成员函数的隐藏，只需要**函数名相同就构成隐藏。**

4. 注意在实际中在继承体系⾥⾯最好不要定义同名的成员。

```cpp
// Student的_num和Person的_num构成隐藏关系，可以看出这样代码虽然能跑，但是⾮常容易混淆
class Person
{
protected:
	string _name = "⼩李⼦"; // 姓名
	int _num = 111; // ⾝份证号
};
class Student : public Person
{
public:
	void Print()
	{
		cout << " 姓名:" << _name << endl;
		cout << " ⾝份证号:" << Person::_num << endl;
		cout << " 学号:" << _num << endl;
	}
protected:
	int _num = 999; // 学号
};
int main()
{
	Student s1;
	s1.Print();
	return 0;
};
```

来做两道题：

（1）A和B类中的两个func构成什么关系（） A. 重载 B. 隐藏 C.没关系

（2）下⾯程序的编译运⾏结果是什么（） A. 编译报错 B. 运⾏报错 C. 正常运⾏

```cpp
class A
{
public:
	void fun()
	{
		cout << "func()" << endl;
	}
};
class B : public A
{
public:
	void fun(int i)
	{
		cout << "func(int i)" << i << endl;
	}
};
int main()
{
	B b;
	b.fun(10);
	b.fun();
	return 0;
};
```

解析：

（1）子类父类成员函数名相同构成隐藏。

（2）在不指定域的情况下A中的fun函数被隐藏是调不到A中的fun函数的所以fun（）缺少，参数编译报错。（error C2660: “B::fun”: 函数不接受 0 个参数）

## 派生类的四个常见的默认成员函数

6个默认成员函数[（C++初阶：类和对象（二）-CSDN博客）](https://blog.csdn.net/2301_80194476/article/details/140407660?spm=1001.2014.3001.5501)，默认的意思就是指我们不写，编译器会变我们⾃动⽣成⼀个，那么在派⽣类中，这⼏个成员函数是如何⽣成的呢？![图片](https://i-blog.csdnimg.cn/direct/c4bf321a58fd45b9aa372ecb00e9e732.png)

1. 派⽣类的构造函数**必须调⽤基类的构造函数**初始化基类的那⼀部分成员。如果基类没有默认的构造函数，则必须在派⽣类构造函数的**初始化列表阶段显⽰调⽤。**

2. 派⽣类的拷⻉构造函数**必须调⽤基类的拷⻉构造**完成基类的拷⻉初始化。

3. 派⽣类的operator=必须要调**⽤基类的operator=**完成基类的复制。需要注意的是派⽣类的 operator=**隐藏**了基类的operator=，所以显⽰调⽤基类的operator=，需要**指定基类作⽤域**

4. 派⽣类的析构函数会在被调⽤完成后**⾃动调⽤**基类的析构函数清理基类成员。因为这样才能保证派⽣类对象先清理派⽣类成员再清理基类成员的顺序。

5. 派⽣类对象初始化先调⽤基类构造再调派⽣类构造。

6. 派⽣类对象析构清理先调⽤派⽣类析构再调基类的析构。

7. 因为多态中⼀些场景析构函数需要构成重写，重写的条件之⼀是函数名相同(这个在后续的多态章节会详细说明)。那么编译器会对析构函数名进⾏特殊处理，处理成destructor()，所以基类析构函数不加virtual的情况下，派⽣类析构函数和基类析构函数构成隐藏关系。

![图片](https://i-blog.csdnimg.cn/direct/b1f06f58c0614ceba687c28012a99985.png)

```cpp
class Person
{
public:
	Person(const char* name = "peter")
		: _name(name)
	{
		cout << "Person()" << endl;
	}
	Person(const Person& p)
		: _name(p._name)
	{
		cout << "Person(const Person& p)" << endl;
	}
	Person& operator=(const Person& p)
	{
		cout << "Person operator=(const Person& p)" << endl;
		if (this != &p)
			_name = p._name;
		return *this;
	}
	~Person()
	{
		cout << "~Person()" << endl;
	}
protected:
	string _name; // 姓名
};
class Student : public Person
{
public:
	Student(const char* name, int num)
		: Person(name)
		, _num(num)
	{
		cout << "Student()" << endl;
	}
	Student(const Student& s)
		: Person(s)
		, _num(s._num)
	{
		cout << "Student(const Student& s)" << endl;
	}
	Student& operator = (const Student& s)
	{
		cout << "Student& operator= (const Student& s)" << endl;
		if (this != &s)
		{
			// 构成隐藏，所以需要显⽰调⽤
			Person::operator =(s);
			_num = s._num;
		}
		return *this;
	}
	~Student()
	{
		cout << "~Student()" << endl;
	}
protected:
	int _num; //学号
};
int main()
{
	Student s1("jack", 18);
	Student s2(s1);
	Student s3("rose", 17);
	s1 = s3;
	return 0;
}
```

## 实现一个不能被继承的类

⽅法1：**基类的构造函数私有**，派⽣类的构成必须调⽤基类的构造函数，但是基类的构成函数私有化以 后，派⽣类看不⻅就不能调⽤了，那么派⽣类就⽆法实例化出对象。

⽅法2：C++11新增了⼀个**final关键字**，final修改基类，派⽣类就不能继承了。

```cpp
// C++11的⽅法
class Base final
{
public:
	void func5() { cout << "Base::func5" << endl; }
protected:
	int a = 1;
private:
	// C++98的⽅法
	/*Base()
	{}*/
};

class Derive :public Base
{
	void func4() { cout << "Derive::func4" << endl; }
protected:
	int b = 2;
};
int main()
{
	Base b;
	Derive d;
	return 0;
}
```

## 继承与友元

友元关系不能继承，也就是说基类友元不能访问派⽣类私有和保护成员 。

```cpp
class Student;
class Person
{
public:
	friend void Display(const Person& p, const Student& s);
protected:
	string _name; // 姓名
};
class Student : public Person
{
protected:
	int _stuNum; // 学号
};
void Display(const Person& p, const Student& s)
{
	cout << p._name << endl;
	cout << s._stuNum << endl;
}
int main()
{
	Person p;
	Student s;
	// 编译报错：error C2248: “Student::_stuNum”: ⽆法访问 protected 成员
	// 解决⽅案：Display也变成Student 的友元即可
	Display(p, s);
	return 0;
}
```

## 继承与静态成员

> 基类定义了static静态成员，则整个继承体系⾥⾯只有⼀个这样的成员。⽆论派⽣出多少个派⽣类，都只有⼀个static成员实例。

```cpp
class Person
{
public:
	string _name;
	static int _count;
};
int Person::_count = 0;
class Student : public Person
{
protected:
	int _stuNum;
};
int main()
{
	Person p;
	Student s;
	// 这⾥的运⾏结果可以看到⾮静态成员_name的地址是不⼀样的
	// 说明派⽣类继承下来了，⽗派⽣类对象各有⼀份
	cout << &p._name << endl;
	cout << &s._name << endl;
	// 这⾥的运⾏结果可以看到静态成员_count的地址是⼀样的
	// 说明派⽣类和基类共⽤同⼀份静态成员
	cout << &p._count << endl;
	cout << &s._count << endl;
	// 公有的情况下，⽗派⽣类指定类域都可以访问静态成员
	cout << Person::_count << endl;
	cout << Student::_count << endl;
	return 0;
}
```

## 多继承及其菱形继承问题

### 继承模型

单继承：⼀个派⽣类只有⼀个直接基类时称这个继承关系为单继承

多继承：⼀个派⽣类有两个或以上直接基类时称这个继承关系为多继承，多继承对象在内存中的模型是，先继承的基类在前⾯，后⾯继承的基类在后⾯，派⽣类成员在放到最后⾯。

菱形继承：菱形继承是多继承的⼀种特殊情况。菱形继承的问题，从下⾯的对象成员模型构造，可以看出菱形继承有数据冗余和⼆义性的问题，在Assistant的对象中Person成员会有两份。⽀持多继承就 ⼀定会有菱形继承，像Java就直接不⽀持多继承，规避掉了这⾥的问题，所以实践中我们也是不建议设计出菱形继承这样的模型的。

![图片](https://i-blog.csdnimg.cn/direct/e8b8ffd8937b4815b12eef2830d92d42.png)

![图片](https://i-blog.csdnimg.cn/direct/d55b2e47a36f40f9a0770ad38cacf0b4.png)

```cpp
class Person
{
public:
	string _name; // 姓名
};
class Student : public Person
{
protected:
	int _num; //学号
};
class Teacher : public Person
{
protected:
	int _id; // 职⼯编号
};
class Assistant : public Student, public Teacher
{
protected:
	string _majorCourse; // 主修课程
};
int main()
{
	// 编译报错：error C2385: 对“_name”的访问不明确
	Assistant a;
	a._name = "peter";
	// 需要显⽰指定访问哪个基类的成员可以解决⼆义性问题，但是数据冗余问题⽆法解决
	a.Student::_name = "xxx";
	a.Teacher::_name = "yyy";
	return 0;
}
```

## 虚继承

有了多继承，就存在菱形继承，有了菱形继承就有菱形虚拟继承，**底层实现就很复杂**，性能也会有⼀些损失，所以最好不要设计出菱形继承。

```cpp
class Person
{
public:
	string _name; // 姓名
	/*int _tel;
	 int _age;
	string _gender;
	string _address;*/
	// ...
};
// 使⽤虚继承Person类
class Student : virtual public Person
{
protected:
	int _num; //学号
};
// 使⽤虚继承Person类
class Teacher : virtual public Person
{
protected:
	int _id; // 职⼯编号
};
// 教授助理
class Assistant : public Student, public Teacher
{
protected:
	string _majorCourse; // 主修课程
};
int main()
{
	// 使⽤虚继承，可以解决数据冗余和⼆义性
	Assistant a;
	a._name = "peter";
	return 0;
}
```

多继承中指针偏移问题？下⾯说法正确的是( )

A：p1 == p2 == p3 B：p1 < p2 < p3 C：p1 == p3 != p2 D：p1 != p2 != p3

```cpp
class Base1 { public: int _b1; };
class Base2 { public: int _b2; };
class Derive : public Base1, public Base2 { public: int _d; };
int main()
{
    Derive d;
    Base1* p1 = &d;
    Base2* p2 = &d;
    Derive* p3 = &d;
    return 0;
}
```

![图片](https://i-blog.csdnimg.cn/direct/1e38288b79ab47e1b3e706ee713c230d.png)

## 继承与组合

• public继承是⼀种is-a的关系。也就是说每个派⽣类对象都是⼀个基类对象。

• 组合是⼀种has-a的关系。假设B组合了A，每个B对象中都有⼀个A对象。

• 继承允许你根据基类的实现来定义派⽣类的实现。这种通过⽣成派⽣类的复⽤通常被称为⽩箱复⽤ (white-box reuse)。术语“⽩箱”是相对可视性⽽⾔：在继承⽅式中，基类的内部细节对派⽣类可 ⻅ 。继承⼀定程度破坏了基类的封装，基类的改变，对派⽣类有很⼤的影响。派⽣类和基类间的依赖关系很强，耦合度⾼。

• 对象组合是类继承之外的另⼀种复⽤选择。新的更复杂的功能可以通过组装或组合对象来获得。对象组合要求被组合的对象具有良好定义的接⼝。这种复⽤⻛格被称为⿊箱复⽤(black-box reuse)， 因为对象的内部细节是不可⻅的。对象只以“⿊箱”的形式出现。 组合类之间没有很强的依赖关系，耦合度低。优先使⽤对象组合有助于你保持每个类被封装。

• **优先使⽤组合，⽽不是继承。实际尽量多去⽤组合，组合的耦合度低，代码维护性好。**不过也不太那么绝对，类之间的关系就适合继承(is-a)那就⽤继承，另外要实现多态，也必须要继承。类之间的关系既适合⽤继承(is-a)也适合组合(has-a)，就⽤组合。

```cpp
class Tire {
protected:
	string _brand = "Michelin"; // 品牌
	size_t _size = 17; // 尺⼨
};
class Car {
protected:
	string _colour = "⽩⾊"; // 颜⾊
	string _num = "陕ABIT00"; // ⻋牌号
	Tire _t1; // 轮胎
	Tire _t2; // 轮胎
	Tire _t3; // 轮胎
	Tire _t4; // 轮胎
};
class BMW : public Car {
public:
	void Drive() { cout << "好开-操控" << endl; }
};
// Car和BMW/Benz更符合is-a的关系
class Benz : public Car {
public:
	void Drive() { cout << "好坐-舒适" << endl; }
};
template<class T>
class vector
{};
// stack和vector的关系，既符合is-a，也符合has-a
template<class T>
class stack : public vector<T>
{};
template<class T>
class stack
{
public:
	vector<T> _v;
};
int main()
{
	return 0;
}
```

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
