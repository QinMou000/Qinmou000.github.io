---
title: C++进阶：set和map
date: 2024-09-27
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## 序列式容器和关联式容器

前⾯我们已经接触过STL中的部分容器如：string、vector、list、deque、array、forward_list等，这些容器统称为序列式容器，因为逻辑结构为线性序列的数据结构，两个位置存储的值之间⼀般没有紧密的关联关系，⽐如交换⼀下，他依旧是序列式容器。顺序容器中的元素是按他们在容器中的存储位置来顺序保存和访问的。

关联式容器也是⽤来存储数据的，与序列式容器不同的是，关联式容器逻辑结构通常是⾮线性结构， 两个位置有紧密的关联关系，交换⼀下，他的存储结构就被破坏了。顺序容器中的元素是按关键字来保存和访问的。关联式容器有map/set系列和unordered_map/unordered_set系列。 set是key搜索场景的结构， map是key/value搜索场景的结构。**它们的底层都是红黑树，红⿊树是⼀颗平衡⼆叉搜索树。**

## set类的介绍

• set的声明如下，T就是set底层关键字的类型

```cpp
template < class T, // set::key_type/value_type
	class Compare = less<T>, // set::key_compare/value_compare
	class Alloc = allocator<T> // set::allocator_type
> class set;
```

• set默认要求T⽀持⼩于⽐较，如果不⽀持或者想按⾃⼰的需求⾛可以⾃**⾏实现仿函数传给第⼆个模版参数**

• set底层存储数据的内存是从空间配置器申请的，如果需要可以⾃⼰实现内存池，传给第三个参 数。

• ⼀般情况下，我们都不需要传后两个模版参数。

• set底层是⽤红⿊树实现，**增删查效率是O(logN) ，迭代器遍历是⾛的搜索树的中序，所以是有序的。**

### set的构造和迭代器

set的构造我们关注以下⼏个接⼝即可。**set的⽀持正向和反向迭代遍历，遍历默认按升序顺序，因为底层是⼆叉搜索树，迭代器遍历⾛的中序**；⽀持迭代器就意味着⽀持范围for，**set的iterator和const_iterator都不⽀持迭代器修改数据，因为修改关键字数据，就破坏了底层搜索树的结构。**

```cpp
// empty (1) ⽆参默认构造
explicit set(const key_compare& comp = key_compare(),
	const allocator_type& alloc = allocator_type());
// range (2) 迭代器区间构造
template <class InputIterator>
set(InputIterator first, InputIterator last,
	const key_compare& comp = key_compare(),
	const allocator_type & = allocator_type());
// copy (3) 拷⻉构造
set(const set& x);
// initializer list (5) initializer 列表构造
set(initializer_list<value_type> il,
	const key_compare& comp = key_compare(),
	const allocator_type& alloc = allocator_type());
// 迭代器是⼀个双向迭代器
iterator->a bidirectional iterator to const value_type
// 正向迭代器
iterator begin();
iterator end();
// 反向迭代器
reverse_iterator rbegin();
reverse_iterator rend();
```

### set的增删查

set的增删查关注以下⼏个接⼝即可：

```cpp
Member types
key_type->The first template parameter(T)
value_type->The first template parameter(T)
// 单个数据插⼊，如果已经存在则插⼊失败
pair<iterator, bool> insert(const value_type& val);

// 列表插⼊，已经在容器中存在的值不会插⼊
void insert(initializer_list<value_type> il);

// 迭代器区间插⼊，已经在容器中存在的值不会插⼊
template <class InputIterator>
void insert(InputIterator first, InputIterator last);

// 查找val，返回val所在的迭代器，没有找到返回end()
iterator find(const value_type& val);

// 查找val，返回val的个数
size_type count(const value_type& val) const;

// 删除⼀个迭代器位置的值
void erase(const_iterator position);

// 删除val，val不存在返回0，存在返回1
size_type erase(const value_type& val);

// 删除⼀段迭代器区间的值
void erase(const_iterator first, const_iterator last);

// 返回⼤于等val位置的迭代器
iterator lower_bound(const value_type& val) const;

// 返回⼤于val位置的迭代器
iterator upper_bound(const value_type& val) const;
```

### multiset和set的差异

multiset和set的使⽤基本完全类似，**主要区别点在于multiset⽀持值冗余**，那么 insert/find/count/erase都围绕着⽀持值冗余有所差异，具体参看下⾯的样例代码理解。

```cpp
#include<iostream>
#include<set>
using namespace std;
int main()
{
	// 相⽐set不同的是，multiset是排序，但是不去重
	multiset<int> s = { 4,2,7,2,4,8,4,5,4,9 };
	auto it = s.begin();
	while (it != s.end())
	{
		cout << *it << " ";
		++it;
	}
	cout << endl;
	// 相⽐set不同的是，x可能会存在多个，find查找中序的第⼀个
	int x;
	cin >> x;
	auto pos = s.find(x);
	while (pos != s.end() && *pos == x)
	{
		cout << *pos << " ";
		++pos;
	}
	cout << endl;
	// 相⽐set不同的是，count会返回x的实际个数
	cout << s.count(x) << endl;
	// 相⽐set不同的是，erase给值时会删除所有的x
	s.erase(x);
	for (auto e : s)
	{
		cout << e << " ";
	}
	cout << endl;
	return 0;
}
```

## map类的介绍

map的声明如下，Key就是map底层关键字的类型，T是map底层value的类型，set默认要求Key⽀持⼩于⽐较，**如果不⽀持或者需要的话可以⾃⾏实现仿函数传给第⼆个模版参数**，map底层存储数据的内存是从空间配置器申请的。⼀般情况下，我们都不需要传后两个模版参数。**map底层是⽤红⿊树实现，增删查改效率是 O(logN) ，迭代器遍历是⾛的中序，所以是****按key有序顺序遍历的。**

```cpp
template < class Key, // map::key_type
	class T, // map::mapped_type
	class Compare = less<Key>, // map::key_compare
	class Alloc = allocator<pair<const Key, T> > //
	map::allocator_type
> class map;
```

### pair类型介绍

map底层的红⿊树节点中的数据，使⽤pair存储键值对数据。

```cpp
typedef pair<const Key, T> value_type;
template <class T1, class T2>
struct pair
{
	typedef T1 first_type;
	typedef T2 second_type;
	T1 first;
	T2 second;
	pair() : first(T1()), second(T2()){}

	pair(const T1& a, const T2& b) : first(a), second(b){}

	template<class U, class V>
	pair(const pair<U, V>& pr) : first(pr.first), second(pr.second){}
};
template <class T1, class T2>
inline pair<T1, T2> make_pair(T1 x, T2 y)
{
	return (pair<T1, T2>(x, y));
}
```

> 当然不止map里面会用到pair，你也可以在vector里用pair储存键值对数据，但是在进行排序操作的时候数据可能并不会按照我们希望的那样排序，这时最好传一个仿函数过去，让排序能够正常进行。

```cpp
template<class T1,class T2>
struct kvCompare{
		bool operator()(const pair<T1,T2>& kv1, const pair<T1, T2>& kv2)
		{
			// return kv1.second > kv2.second; or something ...
		}
};
```

### map的构造

map的构造我们关注以下⼏个接⼝即可。

map的⽀持正向和反向迭代遍历，遍历默认按key的升序顺序，因为底层是⼆叉搜索树，迭代器遍历⾛的中序；⽀持迭代器就意味着⽀持范围for，**map⽀持修改value数据，不⽀持修改key数据，修改关键字数据，破坏了底层搜索树的结构。**

```cpp
// empty (1) ⽆参默认构造
explicit map(const key_compare& comp = key_compare(),
	const allocator_type& alloc = allocator_type());
// range (2) 迭代器区间构造
template <class InputIterator>
map(InputIterator first, InputIterator last,
	const key_compare& comp = key_compare(),
	const allocator_type & = allocator_type());
// copy (3) 拷⻉构造
map(const map& x);
// initializer list (5) initializer 列表构造
map(initializer_list<value_type> il,
	const key_compare& comp = key_compare(),
	const allocator_type& alloc = allocator_type());
// 迭代器是⼀个双向迭代器
iterator->a bidirectional iterator to const value_type
// 正向迭代器
iterator begin();
iterator end();
// 反向迭代器
reverse_iterator rbegin();
reverse_iterator rend();
```

### map的增删查

map的增删查关注以下⼏个接⼝即可： map增接⼝，插⼊的pair键值对数据，跟set所有不同，但是查和删的接口只⽤关键字key跟set是完全类似的，不过find返回iterator，不仅仅可以确认key在不在，还找到key映射的value，同时通过迭代还可以修改value

注意map的insert在插入一个pair值的时候也会返回一个两个pair是不一样的，插入成功pair的第二个值是true反之为false，pair的第一个值在插入成功的情况下会是新节点的迭代器，插入失败就证明这个key已经存在，返回已经存在的这个节点的迭代器。

```cpp
Member types
key_type->The first template parameter(Key)
mapped_type->The second template parameter(T)
value_type->pair<const key_type, mapped_type>
// 单个数据插⼊，如果已经key存在则插⼊失败,key存在相等value不相等也会插⼊失败
pair<iterator, bool> insert(const value_type& val);
// 列表插⼊，已经在容器中存在的值不会插⼊
void insert(initializer_list<value_type> il);
// 迭代器区间插⼊，已经在容器中存在的值不会插⼊
template <class InputIterator>
void insert(InputIterator first, InputIterator last);
// 查找k，返回k所在的迭代器，没有找到返回end()
iterator find(const key_type& k);
// 查找k，返回k的个数
size_type count(const key_type& k) const;
// 删除⼀个迭代器位置的值
iterator erase(const_iterator position);
// 删除k，k存在返回0，存在返回1
size_type erase(const key_type& k);
// 删除⼀段迭代器区间的值
iterator erase(const_iterator first, const_iterator last);
// 返回⼤于等k位置的迭代器
iterator lower_bound(const key_type& k);
// 返回⼤于k位置的迭代器
const_iterator lower_bound(const key_type& k) const;
```

### map的数据修改

前⾯提到map⽀持修改mapped_type数据，不⽀持修改key数据，修改关键字数据，破坏了底层搜索树的结构。 map第⼀个⽀持修改的⽅式时通过迭代器，迭代器遍历时或者find返回key所在的iterator修改，**map还有⼀个⾮常重要的修改接⼝operator[]，但是operator[]不仅仅⽀持修改，还⽀持插⼊数据和查找数据，所以他是⼀个多功能复合接⼝。**

需要注意从内部实现⻆度，map这⾥把我们传统说的value值，给的是T类型，typedef为 mapped_type。⽽value_type是红⿊树结点中存储的pair键值对值。⽇常使⽤我们还是习惯将这⾥的T映射值叫做value。

```cpp
Member types
key_type->The first template parameter(Key)
mapped_type->The second template parameter(T)
value_type->pair<const key_type, mapped_type>

// 查找k，返回k所在的迭代器，没有找到返回end()，
// 如果找到了通过iterator可以修改key对应的mapped_type值
iterator find(const key_type& k);

pair<iterator, bool> insert(const value_type& val);

mapped_type& operator[] (const key_type& k);

```

⽂档中对insert返回值的说明
![图片](https://i-blog.csdnimg.cn/direct/2fda05516ce1423cb0d991888b2a3c99.png)

注意这里的 insert插⼊⼀个pair<key, T>对象

> **1、如果key已经在map中，插⼊失败，则返回⼀个pair<iterator,bool>对象，返回pair对象
>  first是key所在结点的迭代器，second是false
>  2、如果key不在在map中，插⼊成功，则返回⼀个pair<iterator,bool>对象，返回pair对象
>  first是新插⼊key所在结点的迭代器，second是true**

**也就是说⽆论插⼊成功还是失败，返回pair<iterator,bool>对象的first都会指向key所在的迭代器
 那么也就意味着insert插⼊失败时充当了查找的功能，正是因为这⼀点，insert可以⽤来实现operator[]**

> 需要注意的是这⾥有两个pair，不要混淆了，⼀个是map底层红⿊树节点中存的pair<key, T>，另⼀个是insert返回值pair < iterator, bool>

```cpp
// operator的内部实现
mapped_type& operator[] (const key_type& k)
{
	// 1、如果k不在map中，insert会插⼊k和mapped_type默认值，同时[]返回结点中存储
	mapped_type值的引⽤，那么我们可以通过引⽤修改返映射值。所以[]具备了插⼊ + 修改功能
		// 2、如果k在map中，insert会插⼊失败，但是insert返回pair对象的first是指向key结点的
		迭代器，返回值同时[]返回结点中存储mapped_type值的引⽤，所以[]具备了查找 + 修改的功能
		pair<iterator, bool> ret = insert({ k, mapped_type() });
	iterator it = ret.first;
	return it->second;
}
```

利用 [ ] 操作符的插入和修改数据的功能，巧妙实现计数

```cpp
int main()
{
	// 利⽤[]插⼊+修改功能，巧妙实现统计⽔果出现的次数
	string arr[] = { "苹果", "西⽠", "苹果", "西⽠", "苹果", "苹果", "西⽠",
	"苹果", "⾹蕉", "苹果", "⾹蕉" };
	map<string, int> countMap;
	for (const auto& str : arr)
	{
		// []先查找⽔果在不在map中
		// 1、不在，说明⽔果第⼀次出现，则插⼊{⽔果, 0}，同时返回次数的引⽤，
		//++⼀下就变成1次了
		// 2、在，则返回⽔果对应的次数++
			countMap[str]++;
	}
	for (const auto& e : countMap)
	{
		cout << e.first << ":" << e.second << endl;
	}
	cout << endl;
	return 0;
}
```

### multimap和map的差异

multimap和map的使⽤基本完全类似，主要区别点在于multimap⽀持关键值key冗余，那么 insert/find/count/erase都围绕着⽀持关键值key冗余有所差异，这⾥跟set和multiset完全⼀样，⽐如find时，有多个key，返回中序第⼀个。**其次就是因为⽀持key冗余，所以multimap不⽀持[]。**

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
