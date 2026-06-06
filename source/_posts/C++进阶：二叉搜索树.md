---
title: C++进阶：二叉搜索树
date: 2024-09-16
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

## ⼆叉搜索树的概念

⼆叉搜索树⼜称⼆叉排序树，它或者是⼀棵空树，或者是具有以下性质的⼆叉树:

> • 若它的左⼦树不为空，则左⼦树上所有结点的值都⼩于等于根结点的值
>
> • 若它的右⼦树不为空，则右⼦树上所有结点的值都⼤于等于根结点的值
>
> • 它的左右⼦树也分别为⼆叉搜索树

```cpp
template<class K>
struct BSNode
{
	BSNode(const K& key)
	{
		_key = key;
		_left = nullptr;
		_right = nullptr;
	}
	struct BSNode* _left;
	struct BSNode* _right;
	K _key;
};
```

```cpp
template<class K>
class BSTree
{
	typedef struct BSNode<K> Node;
public:
    // 函数
private:
	Node* _root = nullptr;
};
```

⼆叉搜索树中可以⽀持插⼊相等的值，也可以不⽀持插⼊相等的值，具体看使⽤场景定义，后续学习map/set/multimap/multiset系列容器底层就是⼆叉搜索树，其中map/set不⽀持插⼊相等值，multimap/multiset⽀持插⼊相等值。

![图片](https://i-blog.csdnimg.cn/direct/2a823e5b6f314333b0431644a8e038e0.png)

## ⼆叉搜索树的性能分析

> 最优情况下，⼆叉搜索树为完全⼆叉树(或者接近完全⼆叉树)，其⾼度为： O(lgN)
>
> 最差情况下，⼆叉搜索树退化为单⽀树(或者类似单⽀)，其⾼度为： O(N/2)
>
> 所以综合⽽⾔⼆叉搜索树增删查改时间复杂度为： O(N)

那么这样的效率显然是⽆法满⾜我们需求的，后续需要继续了解⼆叉搜索树的变形，平衡⼆叉搜索树AVL树和红⿊树，才能适⽤于我们在内存中存储和搜索数据。

另外，⼆分查找也可以实现O(logN) 级别的查找效率，但是⼆分查找有两⼤缺陷：

1. 需要存储在**⽀持下标随机访问**的结构中，并且**有序**。

2. **插⼊和删除数据效率很低**，因为存储在下标随机访问的结构中，插⼊和删除数据⼀般需要挪动数 据。 这⾥也就体现出了平衡⼆叉搜索树的价值。

![图片](https://i-blog.csdnimg.cn/direct/a63a17313feb4c429488a133423dc67f.png)

⼆叉搜索树的插⼊

插⼊的具体过程如下：

> 1. 树为空，则直接新增结点，赋值给root指针
>
> 2. 树不空，按⼆叉搜索树性质，插⼊值⽐当前结点⼤往右⾛，插⼊值⽐当前结点⼩往左⾛，找到空位置，插⼊新结点。
>
> 3. 如果⽀持插⼊相等的值，插⼊值跟当前结点相等的值可以往右⾛，也可以往左⾛，找到空位置，插 ⼊新结点。（要注意的是要保持逻辑⼀致性，插⼊相等的值不要⼀会往右⾛，⼀会往左⾛）

```cpp
bool Insert(const K& key)
	{
		Node* newnode = new Node(key);
		if (_root == nullptr)
		{
			_root = newnode;
			return true;
		}
		else
		{
			Node* parent = nullptr;
			Node* cur = _root;
			while (cur)
			{
				if (cur->_key > newnode->_key)
				{
					parent = cur;
					cur = cur->_left;
				}
				else if (cur->_key < newnode->_key)
				{
					parent = cur;
					cur = cur->_right;
				}
				else
					return false;
			}
			if (parent->_key > newnode->_key)
				parent->_left = newnode;
			if (parent->_key < newnode->_key)
				parent->_right = newnode;
			return true;
		}
	}
```

## ⼆叉搜索树的查找

> 1. 从根开始⽐较，查找x，x⽐根的值⼤则往右边⾛查找，x⽐根值⼩则往左边⾛查找。
>
> 2. 最多查找⾼度次，⾛到到空，还没找到，这个值不存在。
>
> 3. 如果不⽀持插⼊相等的值，找到x即可返回
>
> 4. 如果⽀持插⼊相等的值，意味着有多个x存在，⼀般要求查找**中序的第⼀个x**。如下图，查找3，要找到1的右孩⼦的那个3返回

![图片](https://i-blog.csdnimg.cn/direct/f3062c1926a04a12a0981aa95ead5dc7.png)

```cpp
Node* Find(const K& key)
	{
		assert(_root);
		Node* cur = _root;
		while (cur)
		{
			if (cur->_key > key)
			{
				cur = cur->_left;
			}
			else if (cur->_key < key)
			{
				cur = cur->_right;
			}
			else
				return cur;
		}
		return nullptr;
	}
```

⼆叉搜索树的删除

⾸先查找元素是否在⼆叉搜索树中，如果不存在，则返回false。 如果查找元素存在则分以下四种情况分别处理：（假设要删除的结点为N）

1. 要删除结点N左右孩⼦均为空

![图片](https://i-blog.csdnimg.cn/direct/75914af74bfb4083a03c337f253c78aa.png)

2. 要删除的结点N左孩⼦为空，右孩⼦结点不为空

3. 要删除的结点N右孩⼦为空，左孩⼦结点不为空

![图片](https://i-blog.csdnimg.cn/direct/3fd561d8768140dd841c342736644658.png)

注意还有这种情况：

![图片](https://i-blog.csdnimg.cn/direct/0e38f414f675489a9f31b3748c63ead2.png)

4. 要删除的结点N左右孩⼦结点均不为空

![图片](https://i-blog.csdnimg.cn/direct/83d2c034403244519fa1990503298057.png)

![图片](https://i-blog.csdnimg.cn/direct/26013fcf1b8f4e08bb470bc488fa1bb2.png)

对应以上四种情况的解决⽅案：

> 1. 把N结点的⽗亲对应孩⼦指针指向空，直接删除N结点（情况1可以当成2或者3处理，效果是⼀样的）
>
> 2. 把N结点的⽗亲对应孩⼦指针指向N的右孩⼦，直接删除N结点
>
> 3. 把N结点的⽗亲对应孩⼦指针指向N的左孩⼦，直接删除N结点
>
> 4. ⽆法直接删除N结点，因为N的两个孩⼦⽆处安放，只能⽤**替换法**删除。**找N左⼦树的值最⼤结点 R(最右结点)或者N右⼦树的值最⼩结点R(最左结点)替代N**，因为这两个结点中任意⼀个，放到N的位置，都满⾜⼆叉搜索树的规则。替代N的意思就是N和R的两个结点的值交换，转⽽变成删除R结点，R结点符合情况2或情况3，可以直接删除。

**注意：删除的代码逻辑较为复杂，复习的时候最好再写一遍~**

```cpp
bool Erase(const K& key)
	{
		assert(_root);
		Node* cur = _root;
		Node* parent = nullptr;
		while (cur)
		{
			if (cur->_key > key)
			{
				parent = cur;
				cur = cur->_left;
			}
			else if (cur->_key < key)
			{
				parent = cur;
				cur = cur->_right;
			}
			else
			{
				// 删除
				if (cur->_left == nullptr)
				{
					if (cur == _root)//如果删除没有左子树的根节点
					{
						_root = cur->_right;
					}
					// 左子树为空and左右子树都为空
					else if (parent->_left == cur)
					{
						parent->_left = cur->_right;
					}
					else if (parent->_right == cur)
					{
						parent->_right = cur->_right;
					}
					delete cur;
				}
				else if (cur->_right == nullptr)
				{
					if (cur == _root)//如果删除没有右子树的根节点
					{
						_root = cur->_left;
					}
					// 右子树为空
					else if (parent->_left == cur)
					{
						parent->_left = cur->_left;
					}
					else if (parent->_right == cur)
					{
						parent->_right = cur->_left;
					}
					delete cur;
				}
				else
				{
					//左右子树都不为空
					Node* replaceparent = cur;
					Node* replace = cur->_right;
					while (replace->_left)
					{
						replaceparent = replace;
						replace = replace->_left;
					}
					cur->_key = replace->_key;

					if (replaceparent->_left == replace)
					{
						replaceparent->_left = replace->_right;
					}
					else if (replaceparent->_right == replace)
					{
						replaceparent->_right = replace->_right;
					}
					delete replace;
				}
				return true;
			}
		}
		return false;
	}
```

## ⼆叉搜索树key和key/value使⽤场景

### key搜索场景：

只有key作为关键码，结构中只需要存储key即可，关键码即为需要搜索到的值，搜索场景只需要判断key在不在。key的搜索场景实现的⼆叉树搜索树⽀持增删查，但是不⽀持修改，修改key破坏搜索树结构了。

场景1：⼩区⽆⼈值守⻋库，⼩区⻋库买了⻋位的业主⻋才能进⼩区，那么物业会把买了⻋位的业主的⻋牌号录⼊后台系统，⻋辆进⼊时扫描⻋牌在不在系统中，在则抬杆，不在则提示⾮本⼩区⻋辆，⽆法进⼊。

场景2：检查⼀篇英⽂⽂章单词拼写是否正确，将词库中所有单词放⼊⼆叉搜索树，读取⽂章中的单词，查找是否在⼆叉搜索树中，不在则波浪线标红提示。

### key/value搜索场景：

每⼀个关键码key，都有与之对应的值value，value可以任意类型对象。树的结构中(结点)除了需要存储key还要存储对应的value，增/删/查还是以key为关键字⾛⼆叉搜索树的规则进⾏⽐较，可以快速查找到key对应的value。key/value的搜索场景实现的⼆叉树搜索树⽀持修改，但是不⽀持修改key，修改key破坏搜索树结构了，可以修改value。

场景1：简单中英互译字典，树的结构中(结点)存储key(英⽂)和vlaue(中⽂)，搜索时输⼊英⽂，则同时查找到了英⽂对应的中⽂。

场景2：商场⽆⼈值守⻋库，⼊⼝进场时扫描⻋牌，记录⻋牌和⼊场时间，出⼝离场时，扫描⻋牌，查找⼊场时间，⽤当前时间-⼊场时间计算出停⻋时⻓，计算出停⻋费⽤，缴费后抬杆，⻋辆离场。

场景3：统计⼀篇⽂章中单词出现的次数，读取⼀个单词，查找单词是否存在，不存在这个说明第⼀次出现，（单词，1），单词存在，则++单词对应的次数。

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
