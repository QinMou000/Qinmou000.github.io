---
title: C++进阶：哈希
date: 2024-10-21
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## 哈希概念

哈希(hash)⼜称散列，是⼀种组织数据的⽅式。从译名来看，有散乱排列的意思。本质就是通过哈希函数把关键字Key跟存储位置建⽴⼀个映射关系，查找时通过这个哈希函数计算出Key存储的位置，进⾏快速查找。

## 直接定址法

当关键字的范围⽐较集中时，直接定址法就是⾮常简单⾼效的⽅法，⽐如⼀组关键字都在[0,99]之间， 那么我们开⼀个100个数的数组，每个关键字的值直接就是存储位置的下标。再⽐如⼀组关键字值都在 [a,z]的⼩写字⺟，那么我们开⼀个26个数的数组，每个关键字ascll码减去字符a，就是存储位置的下标。 也就是说直接定址法本质就是⽤关键字计算出⼀个绝对位置或者相对位置。这个⽅法我们在**计数排序**部分已经⽤过了，其实在下面的oj中也用用过

[387. 字符串中的第一个唯一字符 - 力扣（LeetCode）](https://leetcode.cn/problems/first-unique-character-in-a-string/description/)

```cpp
class Solution {
public:
    int firstUniqChar(string s) {
        int arr[26] = { 0 };// 用数组模拟hash
        for(char ch : s)
            arr[ch - 'a']++;
        for(int i = 0;i < s.size();i++)
            if(arr[s[i] - 'a'] == 1)
                return i;
        return -1;
    }
};
```

## 哈希冲突

直接定址法的缺点也⾮常明显，当关键字的范围⽐较分散时，就很浪费内存甚⾄内存不够⽤。假设我们只有数据范围是[0, 9999]的N个值，我们要映射到⼀个M个空间的数组中(⼀般情况下M >= N)，那么 就要借助哈希函数(hash function)hf，关键字key被放到数组的h(key)位置，这⾥要注意的是h(key)计算出的值必须在[0, M)之间。 **这⾥存在的⼀个问题就是，两个不同的key可能会映射到同⼀个位置去，这种问题我们叫做哈希冲突， 或者哈希碰撞。**理想情况是找出⼀个好的哈希函数避免冲突，但是实际场景中，冲突是不可避免的， 所以我们尽可能设计出优秀的哈希函数，减少冲突的次数，同时也要去设计出解决冲突的⽅案。

## 负载因⼦

假设哈希表中已经映射存储了N个值，哈希表的⼤⼩为M，那么 ，负载因⼦有些地⽅也翻译为载荷因⼦/装载因⼦等，他的英⽂为load factor。负载因⼦越⼤，哈希冲突的概率越⾼，空间利⽤率越⾼；负载因⼦越⼩，哈希冲突的概率越低，空间利⽤率越低；

## 将关键字转为整数

我们将关键字映射到数组中位置，⼀般是整数好做映射计算，在实际情况中，key常常是string，vector等内置类型，有时还可能是Date等自定义类型，如果关键字不是整数，我们要想办法转换成整数，并且同时要考虑到尽可能减少哈希冲突。下⾯哈希函数部分我们会再次讨论，如果关键字不是整数，如何恰当的将关键字转换成整数。

## 哈希函数

⼀个好的哈希函数应该让N个关键字被等概率的均匀的散列分布到哈希表的M个空间中，但是实际中却很难做到，但是我们要尽量往这个⽅向去考量设计。

### 除法散列法/除留余数法

- 除法散列法也叫做除留余数法，顾名思义，假设哈希表的⼤⼩为M，那么通过key除以M的余数作为映射位置的下标，也就是哈希函数为：h(key) = key % M。
- 当使⽤除法散列法时，要尽量避免M为某些值，如2的幂，10的幂等。如果是2^x ，**那么key % 2^x 本质相当于保留key的后X位，那么后x位相同的值，计算出的哈希值都是⼀样的，就冲突了。**如： {63 , 31}看起来没有关联的值，如果M是16，也就是2^4 ，那么计算出的哈希值都是15，因为63的⼆进制后8位是 0011 1111，31的⼆进制后8位是 0001 1111。如果是10^x ，就更明显了，保留的都是10进值的后x位，如：{112, 12312}，如果M是100，也就是10^2 ，那么计算出的哈希值都是12。
- **当使⽤除法散列法时，建议M取不太接近2的整数次冥的⼀个质数(素数)。**
- 需要说明的是，实践中也是⼋仙过海，各显神通，Java的HashMap采⽤除法散列法时就是2的整数次冥做哈希表的⼤⼩M，这样玩的话，就不⽤取模，⽽可以直接位运算，**相对⽽⾔位运算⽐模更⾼效⼀些。但是他不是单纯的去取模，⽐如M是2^16次⽅，本质是取后16位，那么⽤key’ = key>>16，然后把key和key' 异或的结果作为哈希值。**也就是说我们映射出的值还是在[0,M)范围 内，但是尽量让key所有的位都参与计算，这样映射出的哈希值更均匀⼀些即可。所以我们上⾯建议M取不太接近2的整数次幂的⼀个质数的理论是⼤多数数据结构书籍中写的理论，但是实践中， 灵活运⽤，抓住本质，⽽不能死读书。

### 乘法散列法

- 乘法散列法对哈希表大小M没有要求，他的大思路第一步：用关键字K乘上常数A(0<A<1)，并抽取出 k*A的小数部分。第二步:后再用M乘以k*A的小数部分，再向下取整。
- h(key)= floor(M *((A * key)%1.0))，其中floor表示对表达式进行下取整，A∈(0,1)，这里最重要的是A的值应该如何设定，Knuth认为A=(V5-1)/2=0.6180339887...(黄金分割点])比较好。
- 乘法散列法对哈希表大小M是没有要求的，假设M为1024，key为1234，A=0.6180339887,A*key=762.6539420558，取小数部分为0.6539420558,M*((A * key)%1.0)=0.6539420558*1024=669.6366651392，那么h(1234)=669。

### 全域散列法

- 如果存在⼀个恶意的对⼿，他针对我们提供的散列函数，特意构造出⼀个发⽣严重冲突的数据集， ⽐如，让所有关键字全部落⼊同⼀个位置中。这种情况是可以存在的，只要散列函数是公开且确定的，就可以实现此攻击。解决⽅法⾃然是⻅招拆招，给散列函数增加随机性，攻击者就⽆法找出确定可以导致最坏情况的数据。这种⽅法叫做全域散列。
- *Hab (key) = ((a × key + b)%P )%M*，P需要选⼀个⾜够⼤的质数，a可以随机选[1,P-1]之间的 任意整数，b可以随机选[0,P-1]之间的任意整数，这些函数构成了⼀个P*(P-1)组全域散列函数组。 假设P=17，M=6，a = 3， b = 4, 则 。*H34 (8) = ((3 × 8 + 4)%17)%6 = 5*
- **需要注意的是每次初始化哈希表时，随机选取全域散列函数组中的⼀个散列函数使⽤，后续增删查改都固定使⽤这个散列函数，否则每次哈希都是随机选⼀个散列函数，那么插⼊是⼀个散列函数， 查找⼜是另⼀个散列函数，就会导致找不到插⼊的key了。**

*上⾯的⼏种⽅法是《算法导论》书籍中讲解的⽅法，《殷⼈昆 数据结构：⽤⾯向对象⽅法与C++语⾔描述 （第⼆版）》和 《[数据结构(C语⾔版)].严蔚敏_吴伟⺠》等教材型书籍上⾯还给出了平⽅取中法、折叠法、随机数法、数学分析法等，这些⽅法相对更适⽤于⼀些局限的特定场景。当然在实际使用中用的最多的方法还是除留余数法。*

## 处理哈希冲突

实践中哈希表⼀般还是选择除法散列法作为哈希函数，当然**哈希表⽆论选择什么哈希函数也避免不了冲突**，那么插⼊数据时，如何解决冲突呢？主要有两种两种⽅法，开放定址法和链地址法。

### 开放定址法

在开放定址法中所有的元素都放到哈希表⾥，当⼀个关键字key⽤哈希函数计算出的位置冲突了，则按照**某种规则**找到⼀个没有存储数据的位置进⾏存储，开放定址法中负载因⼦⼀定是⼩于的。这⾥的规则有三种：线性探测、⼆次探测、双重探测。

#### 线性探测

- 从发⽣冲突的位置开始，依次线性向后探测，直到寻找到下⼀个没有存储数据的位置为⽌，如果⾛ 到哈希表尾，则回绕到哈希表头的位置。
- H(key) = hash0 = key % M，hash0位置冲突了，则线性探测公式为：hc(key,i) = hashi = (hash0 + i) % M， i = {1, 2, 3, ..., M − 1} 因为负载因⼦⼩于1， 则最多探测M-1次，⼀定能找到⼀个存储key的位置。
- 线性探测的⽐较简单且容易实现，线性探测的问题假设，hash0位置连续冲突，hash0，hash1， hash2位置已经存储数据了，后续映射到hash0，hash1，hash2，hash3的值都会争夺hash3位 置，这种现象叫做群集/堆积。下⾯的⼆次探测可以⼀定程度改善这个问题。
- 下⾯演⽰ {19,30,5,36,13,20,21,12} 等这⼀组值映射到M=11的表中。

> h(19) = 8，h(30) = 8，h(5) = 5，h(36) = 3，h(13) = 2，h(20) = 9，h(21) = 10，h(12) = 1

![图片](https://i-blog.csdnimg.cn/direct/1efc731df6d442f6bc5b151b83752cbf.png)

#### ⼆次探测

- 从发⽣冲突的位置开始，依次左右按⼆次⽅跳跃式探测，直到寻找到下⼀个没有存储数据的位置为⽌，如果往右⾛到哈希表尾，则回绕到哈希表头的位置；如果往左⾛到哈希表头，则回绕到哈希表尾的位置；
- h(key) = hash0 = key % M , hash0位置冲突了，则⼆次探测公式为： hc(key,i) = hashi = (hash0 ± i^2 ) % M， i = {1, 2, 3, ..., 2/M}
- ⼆次探测当 hashi = (hash0 − i*i/ )%M 时，当hashi<0时，需要hashi += M 使hashi落在表中。
- 下⾯演⽰ {19,30,52,63,11,22} 等这⼀组值映射到M=11的表中。

> h(19) = 8, h(30) = 8, h(52) = 8, h(63) = 8, h(11) = 0, h(22) = 0

![图片](https://i-blog.csdnimg.cn/direct/5de5a1ec23304e88aa584cfb2cb6d72c.png)

#### 双重散列

- 第⼀个哈希函数计算出的值发⽣冲突，使⽤第⼆个哈希函数计算出⼀个跟key相关的偏移量值，不断往后探测，直到寻找到下⼀个没有存储数据的位置为⽌。
- h1 (key) = hash0 = key % M , hash0位置冲突了，则双重探测公式为： hc(key,i) = hashi = (hash0 + i ∗ h2 (key)) % M， i = {1, 2, 3, ..., M}
- 要求 h2 (key) < M 且 h2 (key) 和M互为质数，有两种简单的取值⽅法：

> 1、当M为2整数冥时，h2 (key) 从[0，M-1]任选⼀个奇数；
>
> 2、当M为质数时，h2 (key) = key % (M − 1) + 1

- 保证 h2 (key) 与M互质是因为根据固定的偏移量所寻址的所有位置将形成⼀个群，若最⼤公约数 p = gcd(M, h1 (key)) > 1 ，那么所能寻址的位置的个数为M/P < M ，使得对于⼀个关键字来说⽆法充分利⽤整个散列表。举例来说，若初始探查位置为1，偏移量为3，整个散列表⼤⼩为12， 那么所能寻址的位置为{1, 4, 7, 10}，寻址个数为12/gcd(12, 3) = 4
- 下⾯演示 {19,30,52} 等这⼀组值映射到M=11的表中，设 h2 (key) = key%10 + 1

![图片](https://i-blog.csdnimg.cn/direct/80256c357ca746c09007bbe0ba396fcc.png)

#### 开放定址法代码实现

开放定址法在实践中，不如下⾯讲的链地址法，因为开放定址法解决冲突不管使⽤哪种⽅法，占⽤的都是哈希表中的空间，始终存在互相影响的问题。所以开放定址法，我们简单选择线性探测实现即可。 开放定址法的哈希表结构

```cpp
enum State// 表示当前位置的状态
{
	EXIST,
	EMPTY,
	DELETE
};
template<class K, class V>
struct HashData
{
	pair<K, V> _kv;
	State _state = EMPTY;
};
template<class K, class V>
class HashTable
{
private:
	vector<HashData<K, V>> _tables;
	size_t _n = 0; // 表中存储数据个数
};
```

要注意的是这⾥需要给每个存储值的位置加⼀个状态标识，**否则删除⼀些值以后，会影响后⾯冲突的值的查找。**如下图，我们删除30，会导致查找20失败，当我们给每个位置加⼀个状态标识 {EXIST,EMPTY,DELETE} ，删除30就可以不⽤删除值，⽽是把状态改为 DELETE ，那么查找20 时遇到DELETE时继续往下查找，当遇到 EMPTY 才停，就可以找到20。

> h(19) = 8，h(30) = 8，h(5) = 5，h(36) = 3，h(13) = 2，h(20) = 9，h(21) = 10，h(12) = 1

![图片](https://i-blog.csdnimg.cn/direct/20772a071a01461bb93a3fb7faa46a6d.png)![图片](https://i-blog.csdnimg.cn/direct/c9c50a2fbf6f45e99667de38472d5f71.png)

#### key不能取模的问题

当key是string/Date等类型时，key不能取模，**那么我们需要给HashTable增加⼀个仿函数，这个仿函数⽀持把key转换成⼀个可以取模的整形，**如果key可以转换为整形并且不容易冲突，那么这个仿函数就⽤默认参数即可，如果这个Key不能转换为整形，我们就需要⾃⼰实现⼀个仿函数传给这个参数，**实现这个仿函数的要求就是尽量key的每值都参与到计算中，让不同的key转换出的整形值不同。**string 做哈希表的key⾮常常⻅，所以我们可以考虑把string特化⼀下。

```cpp
template<class K>
struct HashFunc
{
	size_t operator()(const K& key)
	{
		return (size_t)key;
	}
};
// 模板特化
template<>
struct HashFunc<string>
{
	// 字符串转换成整形，可以把字符ascii码相加即可
	// 但是直接相加的话，类似"abcd"和"bcad"这样的字符串计算出是相同的
	// 这⾥我们使⽤BKDR哈希的思路，⽤上次的计算结果去乘以⼀个质数，这个质数⼀般去31, 131
	// 等效果会⽐较好
	size_t operator()(const string& key)
	{
		size_t hash = 0;
		for (auto e : key)
		{
			hash *= 131;
			hash += e;
		}
		return hash;
	}
};
template<class K, class V, class Hash = HashFunc<K>>
class HashTable
{
public:
private:
	vector<HashData<K, V>> _tables;
	size_t _n = 0; // 表中存储数据个数
};
```

#### 开放寻址法实现代码：

```cpp
namespace open_address
{
	enum State
	{
		EXIST,
		EMPTY,
		DELETE
	};
	template<class K, class V>
	struct HashData
	{
		pair<K, V> _kv;
		State _state = EMPTY;
	};
	template<class K, class V, class Hash = HashFunc<K>>
	class HashTable
	{
	public:
		inline unsigned long __stl_next_prime(unsigned long n)
		{
			// Note: assumes long is at least 32 bits.
			static const int __stl_num_primes = 28;
			static const unsigned long __stl_prime_list[__stl_num_primes] =
			{
				53, 97, 193, 389, 769,
				1543, 3079, 6151, 12289, 24593,
				49157, 98317, 196613, 393241, 786433,
				1572869, 3145739, 6291469, 12582917, 25165843,
				50331653, 100663319, 201326611, 402653189, 805306457,
				1610612741, 3221225473, 4294967291
			};
			const unsigned long* first = __stl_prime_list;
			const unsigned long* last = __stl_prime_list +
				__stl_num_primes;
			const unsigned long* pos = lower_bound(first, last, n);
			return pos == last ? *(last - 1) : *pos;
		}
		HashTable()
		{
			_tables.resize(__stl_next_prime(_tables.size()));
		}
		bool Insert(const pair<K, V>& kv)
		{
			if (Find(kv.first))
				return false;
			// 负载因⼦⼤于0.7就扩容
			if (_n * 10 / _tables.size() >= 7)
			{
				// 这⾥利⽤类似深拷贝现代写法的思想插⼊后交换解决
				HashTable<K, V, Hash> newHT;
				newHT._tables.resize(__stl_next_prime(_tables.size()));
				for (size_t i = 0; i < _tables.size(); i++)
				{
					if (_tables[i]._state == EXIST)
					{
						newHT.Insert(_tables[i]._kv);
					}
				}
				_tables.swap(newHT._tables);
			}
			Hash hs;
			size_t hashi = hs(kv.first) % _tables.size();
			while (_tables[hashi]._state == EXIST)
			{
				++hashi;
				hashi %= _tables.size();
			}
			_tables[hashi]._kv = kv;
			_tables[hashi]._state = EXIST;
			++_n;
			return true;
		}
		HashData<K, V>* Find(const K& key)
		{
			Hash hs;
			size_t hashi = hs(key) % _tables.size();
			while (_tables[hashi]._state != EMPTY)
			{
				if (_tables[hashi]._state == EXIST
					&& _tables[hashi]._kv.first == key)
				{
					return &_tables[hashi];
				}
				++hashi;
				hashi %= _tables.size();
			}
			return nullptr;
		}
		bool Erase(const K& key)
		{
			HashData<K, V>* ret = Find(key);
			if (ret == nullptr)
			{
				return false;
			}
			else
			{
				ret->_state = DELETE;
				return true;
			}
		}
	private:
		vector<HashData<K, V>> _tables;
		size_t _n = 0; // 表中存储数据个数
	};
}
```

### 链地址法

#### 解决冲突的思路

开放定址法中所有的元素都放到哈希表⾥，链地址法中所有的数据不再直接存储在哈希表中，哈希表中存储⼀个指针，没有数据映射这个位置时，这个指针为空，有多个数据映射到这个位置时，我们把这些冲突的数据链接成⼀个**链表，挂在哈希表这个位置下⾯，链地址法也叫做拉链法或者哈希桶。**

• 下⾯演示 {19,30,5,36,13,20,21,12,24,96} 等这⼀组值映射到M=11的表中。

> h(19) = 8，h(30) = 8，h(5) = 5，h(36) = 3，h(13) = 2，h(20) = 9，h(21) = 10，h(12) = 1,h(24) = 2,h(96) = 88

![图片](https://i-blog.csdnimg.cn/direct/a0a845f9d0c046fba85c856f272b0ea4.png)

#### 扩容

开放定址法负载因⼦必须⼩于1，链地址法的负载因⼦就没有限制了，可以⼤于1。负载因⼦越⼤，哈希冲突的概率越⾼，空间利⽤率越⾼；负载因⼦越⼩，哈希冲突的概率越低，空间利⽤率越低；**stl中 unordered_xxx的最⼤负载因⼦基本控制在1，⼤于1就扩容，我们下⾯实现也使⽤这个⽅式。**

#### 极端场景

如果极端场景下，某个桶特别⻓怎么办？其实我们可以考虑使⽤全域散列法，这样就不容易被针对 了。但是假设不是被针对了，⽤了全域散列法，但是偶然情况下，某个桶很⻓，查找效率很低怎么 办？这⾥在Java8的HashMap中当桶的⻓度超过⼀定阈值(8)时就把链表转换成红⿊树。⼀般情况下， 不断扩容，单个桶很⻓的场景还是⽐较少的，下⾯我们实现就不搞这么复杂了，这个解决极端场景的思路，了解⼀下即可。

#### 链地址法实现代码：

```cpp
namespace hash_bucket
{
	template<class K, class V>
	struct HashNode
	{
		pair<K, V> _kv;
		HashNode<K, V>* _next;
		HashNode(const pair<K, V>& kv)
			:_kv(kv)
			, _next(nullptr)
		{}
	};
	template<class K, class V, class Hash = HashFunc<K>>
	class HashTable
	{
		typedef HashNode<K, V> Node;
		inline unsigned long __stl_next_prime(unsigned long n)
		{
			static const int __stl_num_primes = 28;
			static const unsigned long __stl_prime_list[__stl_num_primes] =
			{
			53, 97, 193, 389, 769,
			1543, 3079, 6151, 12289, 24593,
			49157, 98317, 196613, 393241, 786433,
			1572869, 3145739, 6291469, 12582917, 25165843,
			50331653, 100663319, 201326611, 402653189, 805306457,
			1610612741, 3221225473, 4294967291
			};
			const unsigned long* first = __stl_prime_list;
			const unsigned long* last = __stl_prime_list +
				__stl_num_primes;
			const unsigned long* pos = lower_bound(first, last, n);
			return pos == last ? *(last - 1) : *pos;
		}
	public:
		HashTable()
		{
			_tables.resize(__stl_next_prime(_tables.size()), nullptr);
		}
		~HashTable()
		{
			// 依次把每个桶释放
			for (size_t i = 0; i < _tables.size(); i++)
			{
				Node* cur = _tables[i];
				while (cur)
				{
					Node* next = cur->_next;
					delete cur;
					cur = next;
				}
				_tables[i] = nullptr;
			}
		}
		bool Insert(const pair<K, V>& kv)
		{
			Hash hs;
			size_t hashi = hs(kv.first) % _tables.size();
			// 负载因⼦==1扩容
			if (_n == _tables.size())
			{
				/*HashTable<K, V> newHT;
				newHT._tables.resize(_tables.size() * 2);
				for (size_t i = 0; i < _tables.size(); i++)
				{
				Node* cur = _tables[i];
				while(cur)
				{
				newHT.Insert(cur->_kv);
				cur = cur->_next;
				}
				}
				_tables.swap(newHT._tables);*/
				// 这⾥如果使⽤上⾯的⽅法，扩容时创建新的结点，浪费了大量的资源
				// 下面的⽅法，直接移动旧表的结点到新表，效率更高
				vector<Node*> newtables(__stl_next_prime(_tables.size()), nullptr);
				for (size_t i = 0; i < _tables.size(); i++)
				{
					Node* cur = _tables[i];
					while (cur)
					{
						Node* next = cur->_next;
						// 旧表中节点，挪动新表重新映射的位置
						size_t hashi = hs(cur->_kv.first) % newtables.size();
						// 头插到新表
						cur->_next = newtables[hashi];
						newtables[hashi] = cur;
						cur = next;
					}
					_tables[i] = nullptr;
				}
				_tables.swap(newtables);
			}
			// 头插
			Node* newnode = new Node(kv);
			newnode->_next = _tables[hashi];
			_tables[hashi] = newnode;
			++_n;
			return true;
		}
		Node* Find(const K& key)
		{
			Hash hs;
			size_t hashi = hs(key) % _tables.size();
			Node* cur = _tables[hashi];
			while (cur)
			{
				if (cur->_kv.first == key)
				{
					return cur;
				}
				cur = cur->_next;
			}
			return nullptr;
		}
		bool Erase(const K& key)
		{
			Hash hs;
			size_t hashi = hs(key) % _tables.size();
			Node* prev = nullptr;
			Node* cur = _tables[hashi];
			while (cur)
			{
				if (cur->_kv.first == key)
				{
					if (prev == nullptr)
					{
						_tables[hashi] = cur->_next;
					}
					else
					{
						prev->_next = cur->_next;
					}
					delete cur;
					--_n;
					return true;
				}
				prev = cur;
				cur = cur->_next;
			}
			return false;
		}
	private:
		vector<Node*> _tables; // 指针数组
		size_t _n = 0; // 表中存储数据个数
	};
}
```

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
