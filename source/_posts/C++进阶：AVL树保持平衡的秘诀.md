---
title: C++进阶：AVL树保持平衡的秘诀
date: 2024-09-28
categories:
  - C++
---

> ![图片](https://i-blog.csdnimg.cn/direct/9e66b67c73ef431f887a88a78f972ea7.png)
>
> ✨✨所属专栏：[C++](https://blog.csdn.net/2301_80194476/category_12723828.html?spm=1001.2014.3001.5482)✨✨
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨

[AVL树的底层实现代码：BSTree.h · 钦某/C++learning](https://gitee.com/wang-qin928/c-learning/blob/master/function/BinSearchTree/BSTree.h)

## 什么是AVL树？

• AVL树是最先发明的⾃平衡⼆叉查找树，AVL是⼀颗空树，或者具备下列性质的⼆叉搜索树：**它的左右⼦树都是AVL树，且左右⼦树的⾼度差的绝对值不超过1。**AVL树是⼀颗⾼度平衡搜索⼆叉树， 通过控制⾼度差去控制平衡。

• AVL树得名于它的发明者G. M. Adelson-Velsky和E. M. Landis是两个前苏联的科学家，他们在1962 年的论⽂《An algorithm for the organization of information》中发表了它。

• AVL树实现这⾥我们引⼊⼀个**平衡因⼦(balance factor)的概念**，每个结点都有⼀个平衡因⼦，任何结点的平衡因⼦等于右⼦树的⾼度减去左⼦树的⾼度，也就是说任何结点的平衡因⼦等于0/1/-1， **AVL树并不是必须要平衡因⼦**，但是有了平衡因⼦可以更⽅便我们去进⾏观察和控制树是否平衡， 就像⼀个⻛向标⼀样。（有平衡因子和没有平衡因子都有各自的好处）

• 思考⼀下为什么AVL树是⾼度平衡搜索⼆叉树，要求⾼度差不超过1，⽽不是⾼度差是0呢？0不是更好的平衡吗？画画图分析我们发现，不是不想这样设计，⽽是有些情况是做不到⾼度差是0的。⽐如⼀棵树是2个结点，4个结点等情况下，⾼度差最好就是1，⽆法作为⾼度差是0

**• AVL树整体结点数量和分布和完全⼆叉树类似，⾼度可以控制在log(n)，那么增删查改的效率也可 以控制在O(log(n))，相⽐⼆叉搜索树有了本质的提升。**

![图片](https://i-blog.csdnimg.cn/direct/67c19731804f4e38be79d87202463075.png)

## 实现AVL树

### AVL树的结构

```cpp
template<class K,class V>
struct AVLTreeNode
{

	AVLTreeNode(const pair<K, V>& kv)
		:_parent(nullptr),
		_left(nullptr),
		_right(nullptr),
		_kv(kv),
		_bf(0)
	{}
	struct AVLTreeNode<K, V>* _parent;
	struct AVLTreeNode<K, V>* _left;
	struct AVLTreeNode<K, V>* _right;
	pair<K, V> _kv;
	int _bf;
};

template<class K,class V>
class AVLTree
{
	typedef struct AVLTreeNode<K,V> Node;
public:
	AVLTree()
		:_root(nullptr)
		,_size(0)
	{}
	bool Insert(const pair<K,V>& kv)
    {
        //...
    }
private:
	int _size;
	Node* _root;
};
```

AVL树的核心就是在插入的时候保持左右子树的高度差平衡，这里我们着重分析插入环节

### AVL树的插⼊

AVL树插⼊⼀个值的⼤概过程

1. 插⼊⼀个值按⼆叉搜索树规则进⾏插⼊。

2. 新增结点以后，只会影响祖先结点的⾼度，也就是可能会影响部分祖先结点的平衡因⼦，所以更新从新增结点->根结点路径上的平衡因⼦，实际中最坏情况下要更新到根，有些情况更新到中间就可以停⽌了，具体情况我们下⾯再详细分析。

3. 更新平衡因⼦过程中没有出现问题，则插⼊结束。

4. 更新平衡因⼦过程中出现不平衡，**对不平衡⼦树旋转，旋转后本质调平衡的同时，本质降低了⼦树的⾼度，不会再影响上⼀层，所以插⼊结束。**

#### 平衡因⼦更新

更新原则：

• 平衡因⼦ = 右⼦树⾼度-左⼦树⾼度

• 只有⼦树⾼度变化才会影响当前结点平衡因⼦。

• 插⼊结点，会增加⾼度，所以新增结点在parent的右⼦树，parent的平衡因⼦++，新增结点在 parent的左⼦树，parent平衡因⼦--

• parent所在⼦树的⾼度是否变化决定了是否会继续往上更新

更新停⽌条件：

• 更新后parent的平衡因⼦等于0，更新中parent的平衡因⼦变化为-1->0 或者 1->0，说明更新前 parent⼦树⼀边⾼⼀边低，新增的结点插⼊在低的那边，插⼊后parent所在的⼦树⾼度不变，不会 影响parent的⽗亲结点的平衡因⼦，更新结束。

• 更新后parent的平衡因⼦等于1 或 -1，更新前更新中parent的平衡因⼦变化为0->1 或者 0->-1，说 明更新前parent⼦树两边⼀样⾼，新增的插⼊结点后，parent所在的⼦树⼀边⾼⼀边低，parent所 在的⼦树符合平衡要求，但是⾼度增加了1，会影响arent的⽗亲结点的平衡因⼦，所以要继续向上 更新。

• 更新后parent的平衡因⼦等于2 或 -2，更新前更新中parent的平衡因⼦变化为1->2 或者 -1->-2，说明更新前parent⼦树⼀边⾼⼀边低，新增的插⼊结点在⾼的那边，parent所在的⼦树⾼的那边更⾼ 了，破坏了平衡，parent所在的⼦树不符合平衡要求，需要旋转处理，旋转的⽬标有两个：

> 1、把 parent⼦树旋转平衡。
>
> 2、降低parent⼦树的⾼度，恢复到插⼊结点以前的⾼度。所以旋转后也不 需要继续往上更新，插⼊结束。

更新到10结点，平衡因⼦为2，10所在的⼦树已经不平衡，需要旋转处理

![图片](https://i-blog.csdnimg.cn/direct/507eee5244f848f59ef75564abc98934.png)

更新到中间结点，3为根的⼦树⾼度不变，不会影响上⼀层，更新结束

![图片](https://i-blog.csdnimg.cn/direct/22490a0f99bc4b309b091cde84af80ec.png)

最坏更新到根停⽌

![图片](https://i-blog.csdnimg.cn/direct/3d2b5c9aa9384afb87f750ca1b9f630e.png)

插⼊结点及更新平衡因⼦的代码实现

```cpp
bool Insert(const pair<K,V>& kv)
	// 插入不要新建一个newnode，直接用cur节点，
	// newnode可能会导致
{
	if (_root == nullptr)
	{
		_root = new Node(kv);
		_size++;
		return true;
	}
	else
	{
		Node* parent = nullptr;
		Node* cur = _root;
		while (cur)
		{
			if (cur->_kv.first > kv.first)
			{
				parent = cur;//先更新parent
				cur = cur->_left;
			}
			else if (cur->_kv.first < kv.first)
			{
				parent = cur;
				cur = cur->_right;
			}
			else
				return false;
		}
		cur = new Node(kv);

		if (parent->_kv.first < cur->_kv.first)
			parent->_right = cur;
		else
			parent->_left = cur;
		cur->_parent = parent;

		while (parent)
		{
			if (cur == parent->_left)
				parent->_bf--;
			else
				parent->_bf++;

			if (parent->_bf == 0)
				break;// 结束更新
			else if (parent->_bf == 1 || parent->_bf == -1)
			{
				// 继续往上更新
				cur = parent;// 先更新cur
				parent = parent->_parent;
			}
			else if (parent->_bf == 2 || parent->_bf == -2)
			{
				// 不平衡，旋转...
                break;
			}
			else
				assert(false);// 在插入之前就不是AVL树
		}
	}
	_size++;
	return true;
}
```

### 旋转

旋转的原则

1. 保持搜索树的规则

2. 让旋转的树从不满⾜变平衡，其次降低旋转树的⾼度

旋转总共分为四种，左单旋/右单旋/左右双旋/右左双旋。

说明：下⾯的图中，有些结点我们给的是具体值，如10和5等结点，这⾥是为了⽅便讲解，实际中是什 么值都可以，只要⼤⼩关系符合搜索树的规则即可。

#### 右单旋

• 本图1展⽰的是10为根的树，有a/b/c抽象为三棵⾼度为h的⼦树(h>=0)，a/b/c均符合AVL树的要 求。10可能是整棵树的根，也可能是⼀个整棵树中局部的⼦树的根。这⾥a/b/c是⾼度为h的⼦树， 是⼀种概括抽象表⽰，他代表了所有右单旋的场景，实际右单旋形态有很多种，具体图2/图3/图4/ 图5进⾏了详细描述。

• 在a⼦树中插⼊⼀个新结点，导致a⼦树的⾼度从h变成h+1，不断向上更新平衡因⼦，导致10的平 衡因⼦从-1变成-2，10为根的树左右⾼度差超过1，违反平衡规则。10为根的树左边太⾼了，需要 往右边旋转，控制两棵树的平衡。

• 旋转核⼼步骤，因为5 < b⼦树的值 < 10，将b变成10的左⼦树，10变成5的右⼦树，5变成这棵树新 的根，符合搜索树的规则，控制了平衡，同时这棵的⾼度恢复到了插⼊之前的h+2，符合旋转原 则。如果插⼊之前10整棵树的⼀个局部⼦树，旋转后不会再影响上⼀层，插⼊结束了。

![图片](https://i-blog.csdnimg.cn/direct/5be33b68506d41ff9030ff9f880a793d.png)

图一

右单旋代码

```cpp
void RotateR(Node* parent)
{
	Node* subL = parent->_left;
	Node* subLR = subL->_right;

	parent->_left = subLR;
	if (subLR)
		subLR->_parent = parent;

	Node* Pparent = parent->_parent;

	subL->_right = parent;
	parent->_parent = subL;

	//链接上面的
	if (Pparent)
	{
		subL->_parent = Pparent;

		if (Pparent->_left == parent)
			Pparent->_left = subL;
		else
			Pparent->_right = subL;
	}
	else
	{
		subL->_parent = nullptr;
		_root = subL;
	}
	parent->_bf = 0;
	subL->_bf = 0;
}
```

#### 左单旋

• 本图2展⽰的是10为根的树，有a/b/c抽象为三棵⾼度为h的⼦树(h>=0)，a/b/c均符合AVL树的要 求。10可能是整棵树的根，也可能是⼀个整棵树中局部的⼦树的根。这⾥a/b/c是⾼度为h的⼦树， 是⼀种概括抽象表示，他代表了所有右单旋的场景，实际右单旋形态有很多种，具体跟上⾯左旋类 似。

• 在a⼦树中插⼊⼀个新结点，导致a⼦树的⾼度从h变成h+1，不断向上更新平衡因⼦，导致10的平 衡因⼦从1变成2，10为根的树左右⾼度差超过1，违反平衡规则。10为根的树右边太⾼了，需要往 左边旋转，控制两棵树的平衡。

• 旋转核⼼步骤，因为10 < b⼦树的值 < 15，将b变成10的右⼦树，10变成15的左⼦树，15变成这棵 树新的根，符合搜索树的规则，控制了平衡，同时这棵的⾼度恢复到了插⼊之前的h+2，符合旋转原则。如果插⼊之前10整棵树的⼀个局部⼦树，旋转后不会再影响上⼀层，插⼊结束了。

![图片](https://i-blog.csdnimg.cn/direct/be4bee4b1c924a20bd81760021965e91.png)

图二

左单旋代码实现

```cpp
void RotateL(Node* parent)
{
	Node* subR = parent->_right;
	Node* subRL = subR->_left;

	parent->_right = subRL;
	if (subRL)
		subRL->_parent = parent;

	Node* Pparent = parent->_parent;

	subR->_left = parent;
	parent->_parent = subR;

	if (Pparent)
	{
		if(Pparent->_left == parent)
			Pparent->_left = subR;
		else
			Pparent->_right = subR;

		subR->_parent = Pparent;
	}
	else
	{
		_root = subR;
		subR->_parent = nullptr;
	}
	subR->_bf = 0;
	parent->_bf = 0;
}
```

#### 左右双旋

通过图3和图4可以看到，左边⾼时，如果插⼊位置不是在a⼦树，⽽是插⼊在b⼦树，b⼦树⾼度从h变 成h+1，引发旋转，右单旋⽆法解决问题，右单旋后，我们的树依旧不平衡。右单旋解决的纯粹的左边 ⾼，但是插⼊在b⼦树中，10为跟的⼦树不再是单纯的左边⾼，对于10是左边⾼，但是对于5是右边 ⾼，需要⽤两次旋转才能解决，以5为旋转点进⾏⼀个左单旋，以10为旋转点进⾏⼀个右单旋，这棵树这棵树就平衡了。

![图片](https://i-blog.csdnimg.cn/direct/25bc5c571dac411eb82618ac4ec8abc5.png)

图三

![图片](https://i-blog.csdnimg.cn/direct/9043ecf2fac74905a544c16844023419.png)

图四

图3和图4分别为左右双旋中h==0和h==1具体场景分析，下⾯我们将a/b/c⼦树抽象为⾼度h的AVL ⼦树进⾏分析，另外我们需要把b⼦树的细节进⼀步展开为8和左⼦树⾼度为h-1的e和f⼦树，因为 我们要对b的⽗亲5为旋转点进⾏左单旋，左单旋需要动b树中的左⼦树。b⼦树中新增结点的位置 不同，平衡因⼦更新的细节也不同，通过观察8的平衡因⼦不同，这⾥我们要分三个场景讨论。

• 场景1：h >= 1时，新增结点插⼊在e⼦树，e⼦树⾼度从h-1并为h并不断更新8->5->10平衡因⼦， 引发旋转，其中8的平衡因⼦为-1，旋转后8和5平衡因⼦为0，10平衡因⼦为1。

• 场景2：h >= 1时，新增结点插⼊在f⼦树，f⼦树⾼度从h-1变为h并不断更新8->5->10平衡因⼦，引 发旋转，其中8的平衡因⼦为1，旋转后8和10平衡因⼦为0，5平衡因⼦为-1。

• 场景3：h == 0时，a/b/c都是空树，b⾃⼰就是⼀个新增结点，不断更新5->10平衡因⼦，引发旋 转，其中8的平衡因⼦为0，旋转后8和10和5平衡因⼦均为0。

![图片](https://i-blog.csdnimg.cn/direct/a5824c78adc84f21b52b54f9dfa83960.png)

左右双旋实现代码

```cpp
void RotateLR(Node* parent)
{
	Node* subL = parent->_left;
	Node* subLR = subL->_right;

	int bf = subLR->_bf;

	RotateL(subL);
	RotateR(parent);

	if (bf == 0)
	{
		subL->_bf = 0;
		subLR->_bf = 0;
		parent->_bf = 0;
	}
	else if (bf == 1)
	{
		subL->_bf = -1;
		subLR->_bf = 0;
		parent->_bf = 0;
	}
	else if (bf == -1)
	{
		subL = 0;
		subLR->_bf = 0;
		parent->_bf = 1;
	}
	else
		assert(false);
}
```

#### 右左双旋

• 跟左右双旋类似，下⾯我们将a/b/c⼦树抽象为⾼度h的AVL⼦树进⾏分析，另外我们需要把b⼦树的 细节进⼀步展开为12和左⼦树⾼度为h-1的e和f⼦树，因为我们要对b的⽗亲15为旋转点进⾏右单 旋，右单旋需要动b树中的右⼦树。b⼦树中新增结点的位置不同，平衡因⼦更新的细节也不同，通 过观察12的平衡因⼦不同，这⾥我们要分三个场景讨论。

• 场景1：h >= 1时，新增结点插⼊在e⼦树，e⼦树⾼度从h-1变为h并不断更新12->15->10平衡因 ⼦，引发旋转，其中12的平衡因⼦为-1，旋转后10和12平衡因⼦为0，15平衡因⼦为1。

• 场景2：h >= 1时，新增结点插⼊在f⼦树，f⼦树⾼度从h-1变为h并不断更新12->15->10平衡因⼦， 引发旋转，其中12的平衡因⼦为1，旋转后15和12平衡因⼦为0，10平衡因⼦为-1。

• 场景3：h == 0时，a/b/c都是空树，b⾃⼰就是⼀个新增结点，不断更新15->10平衡因⼦，引发旋 转，其中12的平衡因⼦为0，旋转后10和12和15平衡因⼦均为0。

![图片](https://i-blog.csdnimg.cn/direct/8edfec6304444ce6893d2cf981b355c7.png)

```cpp
void RotateRL(Node* parent)
{
	Node* subR = parent->_right;
	Node* subRL = subR->_left;

	int bf = subRL->_bf;

	RotateR(subR);
	RotateL(parent);

	if (bf == 0)
	{
		subR->_bf = 0;
		subRL->_bf = 0;
		parent->_bf = 0;
	}
	else if (bf == -1)
	{
		subR->_bf = 1;
		subRL->_bf = 0;
		parent->_bf = 0;
	}
	else if (bf == 1)
	{
		subR->_bf = 0;
		subRL->_bf = 0;
		parent->_bf = -1;
	}
	else
		assert(false);
}
```

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
