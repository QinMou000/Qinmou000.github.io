---
title: C++进阶：多态
date: 2024-09-13
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## 多态的概念

多态(polymorphism)的概念：通俗来说，就是多种形态。**多态分为编译时多态(静态多态)和运⾏时多态(动态多态)**，这⾥我们重点讲运⾏时多态。

编译时多态(静态多态)主要就是我们前⾯讲的函数重载和函数模板，他们传不同类型的参数就可以调⽤不同的函数，通过参数不同达到多种形态，之所以叫编译时多态，是**因为他们实参传给形参的参数匹配是在编译时完成的**，我们把编译时⼀般归为静态，运⾏时归为动态。

运⾏时多态，具体点就是去完成某个⾏为(函数)，可以**传不同的对象就会完成不同的⾏为**，就达到多种形态。⽐如买票这个⾏为，当普通⼈买票时，是全价买票；学⽣买票时，是优惠买票(5折或75折)；军⼈买票时是优先买票。再⽐如，同样是动物叫的⼀个⾏为(函数)，传猫对象过去，就是“(>^ω^<) 喵”，传狗对象过去，就是"汪汪"。

## 多态的定义和实现

多态是⼀个**继承关系**的下的类对象，去调⽤同⼀函数，产⽣了不同的⾏为。⽐如Student继承了 Person。Person对象买票全价，Student对象优惠买票。

要实现多态效果，第⼀必须是**基类的指针或引⽤（调用函数）**，因为只有基类的指针或引⽤才能既指向派⽣类对象；（被调⽤的函数必须是**虚函数**）

第⼆派⽣类必须对基类的虚函数**重写/覆盖**，重写或者覆盖了，派⽣类才能有不同的函数，多态的不同形态效果才能达到。

### 虚函数

类成员函数前⾯加virtual修饰，那么这个成员函数被称为虚函数。**注意⾮成员函数不能加virtual修 饰。**

```cpp
class Person
{
public: virtual void BuyTicket()
{
	cout << "买票-全价" << endl;
}
};
```

### 虚函数的重写/覆盖

虚函数的重写/覆盖：派⽣类中有⼀个跟基类完全相同的虚函数**(即派⽣类虚函数与基类虚函数的返回值 类型、函数名字、参数列表完全相同)**，称派⽣类的虚函数重写了基类的虚函数。

注意：在重写基类虚函数时，派⽣类的虚函数在不加virtual关键字时，虽然也可以构成重写(因为继承 后基类的虚函数被继承下来了在派⽣类依旧保持虚函数属性)，但是该种写法不是很规范，不建议这样使⽤，不过在许多选择题中，经常会故意买这个坑，让你判断是否构成多态。

```cpp
using namespace std;
class Person {
public:
	virtual void BuyTicket() { cout << "买票-全价" << endl; }
};
class Student : public Person {
public:
	virtual void BuyTicket() { cout << "买票-打折" << endl; }
};
void Func(Person* ptr)
{
	// 这⾥可以看到虽然都是Person指针Ptr在调⽤BuyTicket
	// 但是跟ptr没关系，⽽是由ptr指向的对象决定的。
	ptr->BuyTicket();
}
int main()
{
	Person ps;
	Student st;
	Func(&ps);
	Func(&st);
	return 0;
}
```

一个选择题：

以下程序输出结果是什么（）

A: A->0 B: B->1 C: A->1 D: B->0 E: 编译出错 F: 以上都不正确

```cpp
class A
{
public:
	virtual void func(int val = 1) { std::cout << "A->" << val << std::endl; }
	virtual void test() { func(); }
};
class B : public A
{
public:
	void func(int val = 0) { std::cout << "B->" << val << std::endl; }
};
int main(int argc, char* argv[])
{
	B* p = new B;
	p->test();
	return 0;
}
```

解析：

通过p调用test()，test()内部再调用func()，这里满足多态的条件，p指向的对象是B类型，所以调用B类型中重写的func()。但是这里有一个问题：缺省参数用谁的？**因为缺省参数的值在编译时根据函数的声明类型确定的，所以认为这里先初始化父类部分，缺省参数为1。**答案为B。

### 协变

派⽣类重写基类虚函数时，与基类虚函数返回值类型不同。**即基类虚函数返回基类对象的指针或者引⽤，派⽣类虚函数返回派⽣类对象的指针或者引⽤时，称为协变。**协变的实际意义并不⼤，所以我们 了解⼀下即可。

```cpp
class A {};
class B : public A {};
class Person {
public:
	virtual A* BuyTicket()
	{
		cout << "买票-全价" << endl;
		return nullptr;
	}
};
class Student : public Person {
public:
	virtual B* BuyTicket()
	{
		cout << "买票-打折" << endl;
		return nullptr;
	}
};
void Func(Person* ptr)
{
	ptr->BuyTicket();
}
int main()
{
	Person ps;
	Student st;
	Func(&ps);
	Func(&st);
	return 0;
}
```

### 析构函数的重写

基类的析构函数为虚函数，此时派⽣类析构函数只要定义，⽆论是否加virtual关键字，都与基类的析构函数构成重写，虽然基类与派⽣类析构函数名字不同看起来不符合重写的规则，**实际上编译器对析构函数的名称做了特殊处理，编译后析构函数的名称统⼀处理成destructor，所以基类的析构函数加了vialtual修饰，派⽣类的析构函数就构成重写。**

下⾯的代码我们可以看到，如果~A()，不加virtual，那么delete p2时只调⽤的A的析构函数，没有调⽤B的析构函数，就会导致内存泄漏问题，因为~B()中在释放资源。

**注意：这个问题⾯试中经常考察，⼤家⼀定要结合类似下⾯的样例才能讲清楚，为什么基类中的析构函数建议设计为虚函数。**

```cpp
class A
{
public:
	virtual ~A()
	{
		cout << "~A()" << endl;
	}
};
class B : public A {
public:
	~B()
	{
		cout << "~B()->delete:" << _p << endl;
		delete _p;
	}
protected:
	int* _p = new int[10];
};
// 只有派⽣类Student的析构函数重写了Person的析构函数，下⾯的delete对象调⽤析构函数，
// 才能构成多态，才能保证p1和p2指向的对象正确的调⽤析构函数。
int main()
{
	A* p1 = new A;
	A* p2 = new B;
	delete p1;
	delete p2;
	return 0;
}
```

### override 和 final关键字

从上⾯可以看出，C++对函数重写的要求⽐较严格，但是有些情况下由于疏忽，⽐如函数名写错参数写错等导致⽆法构成重写，⽽这种错误在编译期间是不会报出的，只有在程序运⾏时没有得到预期结果才来debug会得不偿失，**因此C++11提供了override，可以帮助⽤⼾检测是否重写。如果我们不想让派⽣类重写这个虚函数，那么可以⽤final去修饰。**

```cpp
// error C3668: “Benz::Drive”: 包含重写说明符“override”的⽅法没有重写任何基类⽅法
class Car {
public:
	virtual void Dirve()
	{}
};
class Benz :public Car {
public:
	virtual void Drive() override { cout << "Benz-舒适" << endl; }
};
int main()
{
	return 0;
}
```

**注意：Dirve和Drive**

```cpp
// error C3248: “Car::Drive”: 声明为“final”的函数⽆法被“Benz::Drive”重写
class Car
{
public:
	virtual void Drive() final {}
};
class Benz :public Car
{
public:
	virtual void Drive() { cout << "Benz-舒适" << endl; }
};
int main()
{
	return 0;
}
```

## 重载/重写/隐藏的对⽐

![图片](https://i-blog.csdnimg.cn/direct/ed6824e91c0c4228853b148c3435c743.png)

## 纯虚函数和抽象类

在虚函数的后⾯写上 = 0 ，则这个函数为纯虚函数，**纯虚函数不需要定义实现(实现没啥意义因为要被派⽣类重写，但是语法上可以实现)，只要声明即可。**包含纯虚函数的类（**哪怕只有一个类里面只有一个虚函数**）叫做抽象类，抽象类不能实例化出对象，**如果派⽣类继承后不重写纯虚函数，那么派⽣类也是抽象类。**纯虚函数某种程度上强制了 派⽣类重写虚函数，因为不重写实例化不出对象。

```cpp
class Car
{
public:
	virtual void Drive() = 0;
};
class Benz :public Car
{
public:
	virtual void Drive()
	{
		cout << "Benz-舒适" << endl;
	}
};
class BMW :public Car
{
public:
	virtual void Drive()
	{
		cout << "BMW-操控" << endl;
	}
};
int main()
{
	// 编译报错：error C2259: “Car”: ⽆法实例化抽象类
	Car car;
	Car* pBenz = new Benz;
	pBenz->Drive();
	Car* pBMW = new BMW;
	pBMW->Drive();
	return 0;
}
```

## 多态的原理

### 虚函数表指针

含有虚函数的类中除了成员变量，还多⼀个__vfptr放在对象的前⾯(注意有些平台可能会放到对象的最后⾯，这个跟平台有关)，对象中的这个指针我们叫做虚函数表指针(v代表virtual，f代表function)。⼀个含有虚函数的类中都⾄少都有⼀个虚函数表指针，因为⼀个类所有虚函数的地址要 被放到这个类对象的虚函数表中，虚函数表也简称虚表。

### 多态是如何实现的

```cpp
class Person {
public:
	virtual void BuyTicket() { cout << "买票-全价" << endl; }
};
class Student : public Person {
public:
	virtual void BuyTicket() { cout << "买票-打折" << endl; }
};
class Soldier : public Person {
public:
	virtual void BuyTicket() { cout << "买票-优先" << endl; }
};
void Func(Person* ptr)
{
	// 这⾥可以看到虽然都是Person指针Ptr在调⽤BuyTicket
	// 但是跟ptr没关系，⽽是由ptr指向的对象决定的。
	ptr->BuyTicket();
}
int main()
{
	// 其次多态不仅仅发⽣在派⽣类对象之间，多个派⽣类继承基类，重写虚函数后
	// 多态也会发⽣在多个派⽣类之间。
	Person ps;
	Student st;
	Soldier sr;
	Func(&ps);
	Func(&st);
	Func(&sr);
	return 0;
}
```

从底层的⻆度Func函数中ptr->BuyTicket()，是如何作为ptr指向Person对象调用Person::BuyTicket， ptr指向Student对象调⽤Student::BuyTicket的呢？

通过下图我们可以看到，满⾜多态条件后，底层不再是编译时通过调⽤对象确定函数的地址，⽽是运⾏时到指向的对象的虚表中确定对应的虚函数的地址，这样就实现了指针或引⽤指向基类就调⽤基类的虚函数，指向派⽣类就调⽤派⽣类对应的虚函数。

**ptr将子类中父类的部分切出来，子类对象的父类部分中有虚函数表，这个表里面存的是子类中重写父类虚函数的函数地址。这样就实现了ptr指向父类就调用父类的虚函数，指向子类就调用子类的虚函数。**![图片](https://i-blog.csdnimg.cn/direct/b9904c903f224bd1af12ab0c5749cb66.png)

### 动态绑定与静态绑定

• 对不满⾜多态条件(指针或者引⽤+调⽤虚函数)的函数调⽤是在编译时绑定，也就是编译时确定调⽤函数的地址，叫做静态绑定。

• 满⾜多态条件的函数调⽤是在运⾏时绑定，也就是在运⾏时到指向对象的虚函数表中找到调⽤函数的地址，也就做动态绑定。

```cpp
// ptr是指针+BuyTicket是虚函数满⾜多态条件。
// 这⾥就是动态绑定，编译在运⾏时到ptr指向对象的虚函数表中确定调⽤函数地址
ptr->BuyTicket();
00EF2001 mov eax, dword ptr[ptr]
00EF2004 mov edx, dword ptr[eax]
00EF2006 mov esi, esp
00EF2008 mov ecx, dword ptr[ptr]
00EF200B mov eax, dword ptr[edx]
00EF200D call eax
// BuyTicket不是虚函数，不满⾜多态条件。
// 这⾥就是静态绑定，编译器直接确定调⽤函数地址
ptr->BuyTicket();
00EA2C91 mov ecx, dword ptr[ptr]
00EA2C94 call Student::Student(0EA153Ch)
```

### 虚函数表

```cpp
class Base {
public:
	virtual void func1() { cout << "Base::func1" << endl; }
	virtual void func2() { cout << "Base::func2" << endl; }
	void func5() { cout << "Base::func5" << endl; }
protected:
	int a = 1;
};
class Derive : public Base
{
public:
	// 重写基类的func1
	virtual void func1() { cout << "Derive::func1" << endl; }
	virtual void func3() { cout << "Derive::func1" << endl; }
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

• 基类对象的虚函数表中存放基类所有虚函数的地址。

• 派⽣类由两部分构成，继承下来的基类和⾃⼰的成员，**⼀般情况下，继承下来的基类中有虚函数表指针，⾃⼰就不会再⽣成虚函数表指针。****但是要注意的这⾥继承下来的基类部分虚函数表指针和基类对象的虚函数表指针不是同⼀个，就像基类对象的成员和派⽣类对象中的基类对象成员也独⽴的。**

###

• 派⽣类中重写的基类的虚函数，基类对象中的派⽣类的虚函数表中对应的虚函数就会被**覆盖**成派⽣类重写的虚函数地址。![图片](https://i-blog.csdnimg.cn/direct/7ae20053b063420589ea9f570214004a.png)

• 派⽣类的虚函数表中包含，基类的虚函数地址，派⽣类重写的虚函数地址，派⽣类⾃⼰的虚函数地址三个部分。

• 虚函数表本质是⼀个存虚函数指针的指针数组，⼀般情况这个数组最后⾯放了⼀个0x00000000标记。(这个C++并没有进⾏规定，各个编译器⾃⾏定义的，vs系列编译器会在后⾯放个0x00000000 标记，g++系列编译不会放)

![图片](https://i-blog.csdnimg.cn/direct/ae200614d91140489852919d08cb4454.png)

• 虚函数存在哪的？**虚函数和普通函数⼀样的，编译好后是⼀段指令，都是存在代码段的，只是虚函数的地址⼜存到了虚表中。**

• 虚函数表存在哪的？这个问题严格说并没有标准答案C++标准并没有规定，我们写下⾯的代码可以对⽐验证⼀下。vs下是存在代码段(常量区)

![图片](https://i-blog.csdnimg.cn/direct/b531cec144f343728e2346adfda141bf.png)

### 多继承情况下的虚表

在 C++ 多继承的情况下，子类对象包含多个父类子对象，当子类重写了某个虚函数时，**通常只将其放到第一个父类的虚表后面**，有以下原因：

### 一、多继承下的内存布局

- 在多继承中，子类对象的内存布局是按照继承顺序依次排列各个父类子对象。
- 例如，有类`A`、类`B`和类`C`继承自`A`和`B`，对象`c`的内存布局大致为：首先是`A`的子对象部分，接着是`B`的子对象部分，最后是`C`自己独有的部分。

### **二、虚函数表的作用和调用机制**

1. 虚函数表的作用：
  - 虚函数表是实现多态的关键机制。每个包含虚函数的类都有一个虚函数表，表中存储了指向该类虚函数的指针。
  - 当通过基类指针或引用调用虚函数时，实际调用的是根据对象的实际类型在虚函数表中对应的函数。
2. 调用机制与虚表位置：
  - 当通过指向子类对象的父类指针调用虚函数时，编译器会根据指针的静态类型确定从哪个虚函数表开始查找。
  - **如果子类重写的虚函数被放到多个父类的虚表中，会导致混乱和不确定性。**例如，如果子类重写了父类`A`和父类`B`中的同名虚函数，而这两个函数都被放到了各自父类的虚表中，那么当通过不同的父类指针调用时，无法确定应该调用哪个版本的函数。
  - 为了避免这种混乱，通常只将子类重写的虚函数放到第一个父类的虚表后面，这样在通过第一个父类指针调用时，可以正确地调用到子类重写的版本。而通过其他父类指针调用时，由于子类重写的函数不在这些父类的虚表中，会调用父类自己的版本或者根据继承关系进行其他的查找机制，但不会出现多个版本的混乱情况。

```cpp
class A1
{
public:
	virtual void fun1()
	{
		cout << "A1::void fun1()";
	}
private:
	int a1 = 1;

};
class A2
{
public:
	virtual void fun1()
	{
		cout << "A2::void fun1()";
	}
private:
	int a2 = 2;

};
class B :public A1,A2
{
public:
	virtual void fun1()
	{
		cout << "B::void fun1()";
	}
	virtual void fun2()
	{
		cout << "B::void fun2()";
	}
private:
	int b = 3;
};

int main()
{
	A1 a1;
	A2 a2;
	B b;
	return 0;
}
```

![图片](https://i-blog.csdnimg.cn/direct/651e9597e6944049befe2b31b8e3610b.png)

综上所述，多继承情况下，子类自己的虚函数只放到第一个父类的虚表后面，是为了保证多继承下虚函数调用的确定性和一致性，避免混乱和错误的调用。存储在其他父类的虚表中不仅没有必要，还会增加复杂性和不确定性，所以通常不这么做。

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
