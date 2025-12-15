---
title: Qt：对象树
date: 2025-12-15
categories:
  - Qt
---
# Qt中的继承是存在多继承情况的

比如我目前发现了widget类同时继承了Q_Widget和UI_Widget两个类

![image-20251215210304005](https://raw.githubusercontent.com/QinMou000/pic/main/image-20251215210304005.png)

![image-20251215210339803](https://raw.githubusercontent.com/QinMou000/pic/main/image-20251215210339803.png)

# Qt对象树中的对象析构顺序是什么样的

Qt 的对象树（Object Tree）是 Qt 用于管理`QObject`及其子类对象生命周期的核心机制，其**析构顺序**遵循 **“子对象先于父对象析构”** 的核心原则，但具体行为会因对象的创建方式（是否指定父对象、是否在栈 / 堆上创建）和析构触发方式（主动析构、父对象析构、程序退出）略有差异。下面分层次详细说明：

### 一、对象树的核心关联规则

首先明确：当一个`QObject`对象 A 被设置为另一个`QObject`对象 B 的**父对象**（通过构造函数指定`parent`参数，或调用`setParent()`方法），A 会将 B 加入自己的**子对象列表**（`children()`），B 会持有 A 的弱引用。这种父子关联是对象树析构顺序的基础。

### 二、核心析构顺序：子先父后

当**父对象开始析构**时，会按以下步骤处理子对象：

1. 父对象的析构函数（`~QObject()`）被调用时，首先会遍历自己的**子对象列表**。
2. 对每一个子对象，调用其**析构函数**（子对象的析构会递归触发它自己的子对象析构）。
3. 所有子对象析构完成后，父对象再完成自身的析构。

#### 示例 1：堆上创建的父子对象

```cpp
#include <QObject>

int main() {
    // 父对象：堆上创建
    QObject *parent = new QObject();
    // 子对象：构造时指定父对象
    QObject *child1 = new QObject(parent);
    // 孙对象：子对象作为父对象
    QObject *grandchild = new QObject(child1);

    // 析构父对象（触发对象树析构）
    delete parent;

    return 0;
}
```

**析构顺序**：`grandchild`（孙） → `child1`（子） → `parent`（父）。原因：删除`parent`时，先析构其直接子对象`child1`；析构`child1`时，又先析构其直接子对象`grandchild`；最后`parent`完成析构。

### 三、栈上对象的特殊情况：析构顺序与创建顺序相反（叠加对象树规则）

栈对象的析构遵循 C++ 的 **“后创建先析构”** 规则，若栈对象存在父子关联，会叠加 Qt 对象树的 “子先父后” 规则，需注意**避免双重析构**（Qt 已做防护）。

#### 示例 2：栈上的父子对象

```cpp
#include <QObject>

int main() {
    // 栈上父对象：先创建
    QObject parent;
    // 栈上子对象：后创建，指定父对象
    QObject child(&parent);

    // 程序退出时，栈对象自动析构
    return 0;
}
```

**析构顺序**：`child`（子） → `parent`（父）。原因：

1. 按 C++ 栈规则，`child`后创建，本应先析构；
2. 同时，`parent`是`child`的父对象，按对象树规则，`child`也需先析构；
3. 最终析构顺序一致，无冲突。

#### 示例 3：栈父 + 堆子的混合场景

```cpp
#include <QObject>

int main() {
    QObject parent; // 栈父
    QObject *child = new QObject(&parent); // 堆子

    // 程序退出时，parent析构
    return 0;
}
```

**析构顺序**：`child`（堆子） → `parent`（栈父）。原因：栈对象`parent`析构时，会自动删除其堆上的子对象`child`（无需手动`delete`），避免内存泄漏。

### 四、反向情况：子对象先被主动析构

若手动删除**子对象**（而非等待父对象析构），Qt 会自动将该子对象从父对象的子列表中移除，避免父对象析构时重复析构。

#### 示例 4：主动删除子对象

```cpp
#include <QObject>

int main() {
    QObject *parent = new QObject();
    QObject *child = new QObject(parent);

    // 主动删除子对象
    delete child;
    // 此时parent的子列表已无child

    // 析构父对象（无子对象需要处理）
    delete parent;

    return 0;
}
```

**析构顺序**：`child`（主动删除） → `parent`（后续删除）。关键：Qt 的`QObject`析构函数会调用`parent->removeChild(this)`，确保父对象的子列表与实际对象一致。

### 五、特殊注意点：QWidget 的父子与布局

`QWidget`作为`QObject`的子类，除了遵循对象树规则，还与**布局（Layout）** 关联：

1. 若`QWidget`被添加到布局中，布局会自动将该`Widget`的父对象设置为布局的父`Widget`（除非手动指定）。
2. `QWidget`的析构会触发其所有子`Widget`的析构，同时移除布局中的相关项，遵循 “子先父后” 规则。

### 六、常见坑点：避免父对象是栈对象、子对象是堆对象的跨作用域问题

```cpp
#include <QObject>

QObject *createChild() {
    QObject parent; // 栈对象，作用域为函数内
    QObject *child = new QObject(&parent); // 堆子对象
    return child; // 错误：函数结束后parent析构，child被自动删除，返回野指针
}
```

上述代码中，函数结束时`parent`（栈对象）析构，会自动删除`child`，导致返回的`child`是野指针。

### 总结：Qt 对象树的析构顺序核心规则

1. **父对象析构时，先递归析构所有子对象（直接 + 间接），再析构自身**（子先父后）。
2. **主动析构子对象时，子对象会自动从父对象的子列表中移除，父对象析构时不再处理**。
3. **栈对象的析构叠加 C++“后创建先析构” 规则，与对象树规则冲突时，Qt 会保证不重复析构**。
4. **堆对象的父子关联由 Qt 自动管理，无需手动删除子对象（父对象析构时会自动处理）**。

这一机制的核心目的是**简化内存管理**，避免`QObject`子类对象的内存泄漏，是 Qt 开发中无需手动管理内存的关键特性。

# 那么对象树中的父对象如何知道它自己有哪些子对象呢

Qt 的父对象之所以能知道自己有哪些子对象，核心是 **`QObject`内部维护了子对象的存储结构，并通过父子关联的接口自动管理这个结构 **。具体来说，父对象通过**内置的子对象列表**存储子对象的指针，同时 Qt 在`setParent()`、析构等关键时机自动更新这个列表，保证父子关联的一致性。下面分层次详细说明：

### 一、核心存储：QObject 内部的子对象容器

`QObject`类中定义了**私有的子对象存储结构**（不同 Qt 版本实现略有差异，但核心逻辑一致）：

- 在 Qt 的源码中，`QObject`包含一个`QObjectPrivate`类型的私有成员（d 指针模式），其中`QObjectPrivate`里维护了一个**子对象列表**（例如`QList<QObject*>`或`QVector<QObject*>`），用于存储所有直接子对象的指针。
- 父对象通过这个列表，可以直接访问所有**直接子对象**（间接子对象是子对象的子对象，不会直接存储在父对象的列表中）。

简单来说，父对象的内存布局中，有一块区域专门存放 “我的直接子对象有哪些” 的清单。

### 二、父子关联建立时：自动将子对象加入父对象的列表

当一个`QObject`被设置为另一个`QObject`的子对象时（两种方式），Qt 会自动执行 “子对象入列” 的操作：

#### 1. 构造函数指定父对象

```cpp
QObject *child = new QObject(parent);
```

`QObject`的构造函数中，若传入非空的`parent`参数，会调用`parent->setChild(this)`（底层逻辑），将当前子对象添加到父对象的子列表中。

#### 2. 调用`setParent(QObject *parent)`方法

```cpp
QObject *child = new QObject();
child->setParent(parent);
```

`setParent()`是`QObject`的核心方法，其关键逻辑如下：

```cpp
// 简化的setParent核心逻辑（Qt源码简化版）
void QObject::setParent(QObject *newParent) {
    if (parent == newParent) return;

    // 1. 从旧父对象的子列表中移除自己
    if (parent) {
        parent->d_ptr->removeChild(this); // 旧父对象删除子对象
    }

    // 2. 设置新父对象
    parent = newParent;

    // 3. 加入新父对象的子列表
    if (parent) {
        parent->d_ptr->addChild(this); // 新父对象添加子对象
    }
}
```

其中：

- `addChild(QObject *child)`：将子对象指针添加到父对象的子列表中，并维护相关的索引 / 顺序。
- 同时，子对象会持有父对象的指针（`QObject`的`parent`成员），用于后续快速访问父对象。

### 三、父对象如何访问子对象：提供公开接口

`QObject`提供了**公开的成员函数**，让开发者可以访问父对象的子对象列表，本质上是对内部私有子列表的封装：

| 接口                                                         | 作用                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `QObject *parent() const`                                    | 子对象获取自己的父对象                                       |
| `const QObjectList &children() const`                        | 父对象获取所有**直接子对象**的列表（`QObjectList`是`QList<QObject*>`的别名） |
| `T findChild(const QString &name = QString(), Qt::FindChildOptions options = Qt::FindChildrenRecursively) const` | 父对象查找**单个子对象**（可按类型、名称查找，支持递归查找间接子对象） |
| `QList<T> findChildren(const QString &name = QString(), Qt::FindChildOptions options = Qt::FindChildrenRecursively) const` | 父对象查找**多个子对象**（可按类型、名称查找，支持递归）     |

#### 示例：父对象访问子对象

```cpp
#include <QObject>
#include <QDebug>

int main() {
    QObject parent;
    QObject *child1 = new QObject(&parent);
    child1->setObjectName("child1"); // 设置对象名
    QObject *child2 = new QObject(&parent);
    QObject *grandchild = new QObject(child1); // 间接子对象

    // 1. 获取所有直接子对象
    qDebug() << "直接子对象数量：" << parent.children().size(); // 输出：2（child1、child2）

    // 2. 按类型+名称查找单个直接子对象
    QObject *c1 = parent.findChild<QObject*>("child1", Qt::FindDirectChildrenOnly);
    qDebug() << "找到child1：" << c1; // 输出：child1的地址

    // 3. 递归查找所有子对象（包括间接）
    QList<QObject*> allChildren = parent.findChildren<QObject*>();
    qDebug() << "所有子对象数量（递归）：" << allChildren.size(); // 输出：3（child1、child2、grandchild）

    delete grandchild;
    delete child2;
    delete child1;
    return 0;
}
```

### 四、父子关联解除时：自动将子对象从父列表中移除

当子对象被析构、或调用`setParent(nullptr)`时，Qt 会自动将子对象从父对象的子列表中移除，避免父对象持有无效指针或重复处理子对象。

#### 1. 子对象析构时的处理

`QObject`的析构函数中，会执行以下关键逻辑：

```cpp
// 简化的QObject析构函数逻辑
QObject::~QObject() {
    // 1. 从父对象的子列表中移除自己
    if (parent) {
        parent->d_ptr->removeChild(this);
    }

    // 2. 递归析构自己的所有子对象（子先父后）
    while (!d_ptr->children.isEmpty()) {
        delete d_ptr->children.takeFirst();
    }
}
```

这一步保证了：父对象的子列表中永远不会存在已被析构的子对象指针。

#### 2. 子对象调用`setParent(nullptr)`时的处理

如前文`setParent()`的逻辑，子对象会先从旧父对象的子列表中移除，再将父对象设为`nullptr`，此时父对象的子列表中就不再包含该子对象。

### 五、特殊情况：QWidget 的父子与视觉层级

`QWidget`作为`QObject`的子类，除了维护`QObject`的子列表，还会维护**视觉层级的子部件列表**（因为`QWidget`有界面显示的属性），但这部分逻辑是基于`QObject`的父子机制扩展的：

- 当`QWidget`设置父对象时，不仅会加入父`QObject`的子列表，还会加入父`QWidget`的子部件列表（`QWidget::children()`实际是调用`QObject::children()`）。
- `QWidget`的`findChild`/`findChildren`同样支持按部件类型（如`QPushButton*`）查找，本质是对`QObject`接口的模板特化。

### 六、关键总结：父对象知晓子对象的核心逻辑

1. **存储层**：`QObject`通过私有成员（d_ptr）维护**直接子对象的列表**，这是父对象知晓子对象的基础。
2. **关联层**：当通过构造函数或`setParent()`建立父子关系时，子对象会被**自动添加**到父对象的子列表中。
3. **维护层**：当子对象析构、或解除父子关系时，子对象会被**自动移除**出父对象的子列表，保证列表的有效性。
4. **接口层**：`QObject`提供`children()`、`findChild()`、`findChildren()`等公开接口，让开发者可以访问父对象的子对象。

这种设计既保证了父子关联的自动化管理（无需开发者手动维护列表），又提供了灵活的访问接口，是 Qt 对象树机制的核心支撑之一。