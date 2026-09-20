---
title: 两种DFS
date: 2026-09-19
categories:
  - 算法

---

# 两种DFS

```C++
function<void(int pos, vector<int> &out)> dfs = [&](int pos, vector<int> &out) {
    if (pos == candidates.size()) {
        // do something with out
        return;
    }
    dfs(pos + 1, out);
    out.push_back(candidates[pos]);
    dfs(pos + 1, out);
    out.pop_back();
};

function<void(int pos, vector<int> &out)> dfs = [&](int pos, vector<int> &out) {
    if (pos == candidates.size()) {
        // do something with out
        return;
    }
    for (auto e : candidates[pos]) {
        out.push_back(e);
        dfs(pos + 1, out);
        out.pop_back();
    }
};
```

**第一种 DFS 是“选 / 不选”的二叉搜索，通常用来枚举子集；第二种 DFS 是“这一层从多个候选里选一个”，通常用来枚举笛卡尔积 / 多组选一。**

### 第一种：每个元素只有「选」和「不选」

```cpp
dfs(pos + 1, out);              // 不选 candidates[pos]

out.push_back(candidates[pos]);
dfs(pos + 1, out);              // 选 candidates[pos]
out.pop_back();
```

假设：`candidates = {1, 2, 3}; ` 对于每个数，都有两种选择：

```text
                    {}
               /          \
            不选1          选1
             {}            {1}
           /   \           /   \
       不选2  选2      不选2   选2
        {}    {2}       {1}    {1,2}
        ...
```

最后得到的是所有子集：

```text
{}
{1}
{2}
{3}
{1,2}
{1,3}
{2,3}
{1,2,3}
```

总共：2^n个结果。所以这种结构本质是：

```cpp
for 每个元素:
    选 or 不选
```

------

### 第二种：每一层「必须从这一组选一个」

这里的 `candidates` 通常不是：`vector<int>`而是类似：`vector<vector<int>> candidates;`

例如：

```cpp
candidates = {
    {1, 2},
    {3, 4, 5},
    {6, 7}
};
```

DFS：

```cpp
for (auto e : candidates[pos]) {
    out.push_back(e);
    dfs(pos + 1, out);
    out.pop_back();
}
```

意思就是：第0组选一个、第1组选一个、第2组选一个

搜索树大概是：

```text
                  {}
             /          \
            1            2
         /  |  \      /  |  \
        3   4   5    3   4   5
       /\
      6  7
```

最后得到：

```text
{1,3,6}
{1,3,7}
{1,4,6}
{1,4,7}
{1,5,6}
{1,5,7}

{2,3,6}
{2,3,7}
...
```

如果每组大小分别是：

```text
k1, k2, k3 ... kn
```

最终组合数量就是：

```text
k1 × k2 × k3 × ... × kn
```

------

所以可以把这两个模板直接记成：

| DFS    | 每层的含义         | 常见问题                             |
| ------ | ------------------ | ------------------------------------ |
| 第一种 | 当前元素选 or 不选 | 子集、组合                           |
| 第二种 | 当前组里选一个     | 电话号码字母组合、笛卡尔积、多组选一 |

**第一种只是每层恰好两个选择：选 / 不选。**

**第二种则是每层有 `candidates[pos].size()` 个选择。**

所以从本质上讲，**这两个 DFS 其实是同一种东西，只是搜索树每个节点的分支数不同。**