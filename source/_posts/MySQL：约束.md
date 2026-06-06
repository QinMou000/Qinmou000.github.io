---
title: MySQL：约束
date: 2024-12-12
categories:
  - MySQL
---

> ![图片](https://i-blog.csdnimg.cn/direct/6cba51481e444fb6b602b9ddab2084cd.png)
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨
>
> ✨✨所属专栏：[MySql](https://blog.csdn.net/2301_80194476/category_12841400.html?spm=1001.2014.3001.5482)✨✨

## **空属性**

两个值：

null

（默认的）和

not null(

不为空

)

数据库默认字段基本都是字段为空，但是实际开发时，尽可能保证字段不为空，因为数据为空没办法参与运算。

**案例：**

创建一个班级表，包含班级名和班级所在的教室。

在正常的业务逻辑中：

- 如果班级没有名字，你不知道你在哪个班级
- 如果教室名字可以为空，就不知道在哪上课

所以我们在设计数据库表的时候，一定要在表中进行限制，满足上面条件的数据就不能插入到表中。这就是“

约束

”

。

```cpp
mysql> create table myclass(
-> class_name varchar(20) not null,
-> class_room varchar(10) not null);
Query OK, 0 rows affected (0.02 sec)
mysql> desc myclass;
+------------+-------------+------+-----+---------+-------+
| Field | Type | Null | Key | Default | Extra |
+------------+-------------+------+-----+---------+-------+
| class_name | varchar(20) | NO | | NULL | |
| class_room | varchar(10) | NO | | NULL | |
+------------+-------------+------+-----+---------+-------+

//插入数据时,没有给教室数据插入失败：
mysql> insert into myclass(class_name) values('class1');
ERROR 1364 (HY000): Field 'class_room' doesn't have a default value
```

## **默认值**

默认值：某一种数据会经常性的出现某个具体的值，可以在一开始就指定好，在需要真实数据的时候，用户可以选择性的使用默认值。

```cpp
mysql> create table tt10 (
-> name varchar(20) not null,
-> age tinyint unsigned default 0,
-> sex char(2) default '男'
-> );
Query OK, 0 rows affected (0.00 sec)
mysql> desc tt10;
+-------+---------------------+------+-----+---------+-------+
| Field | Type | Null | Key | Default | Extra |
+-------+---------------------+------+-----+---------+-------+
| name | varchar(20) | NO | | NULL | |
| age | tinyint(3) unsigned | YES | | 0 | |
| sex | char(2) | YES | | 男 | |
+-------+---------------------+------+-----+---------+-------+
```

## **列描述**

列描述：

comment

，没有实际含义，专门用来描述字段，会根据表创建语句保存，用来给程序员或

DBA（数据库管理员）来进行了解。

```cpp
mysql> create table tt12 (
-> name varchar(20) not null comment '姓名',
-> age tinyint unsigned default 0 comment '年龄',
-> sex char(2) default '男' comment '性别'
-> );
--注意：not null和defalut一般不需要同时出现，因为default本身有默认值，不会为空
```

通过desc查看不到注释信息：

```cpp
mysql> desc tt12;
+-------+---------------------+------+-----+---------+-------+
| Field | Type              | Null | Key | Default | Extra |
+-------+---------------------+------+-----+---------+-------+
| name | varchar(20)        | NO   |     | NULL    |       |
| age | tinyint(3) unsigned | YES  |     | 0       |       |
| sex | char(2)             | YES  |     | 男      |       |
+-------+---------------------+------+-----+---------+-------+
```

通过

show

可以看到：

```cpp
mysql> show create table tt12\G
*************************** 1. row ***************************
Table: tt12
Create Table: CREATE TABLE `tt12` (
`name` varchar(20) NOT NULL COMMENT '姓名',
`age` tinyint(3) unsigned DEFAULT '0' COMMENT '年龄',
`sex` char(2) DEFAULT '男' COMMENT '性别'
) ENGINE=MyISAM DEFAULT CHARSET=gbk
1 row in set (0.00 sec)
```

## **zerofill（零填充）**

刚开始学习数据库时，很多人对**数字类型**后面的长度很迷茫。通过show看看tt3表的建表语句：

```cpp
mysql> show create table tt3\G
***************** 1. row *****************
Table: tt3
Create Table: CREATE TABLE `tt3` (
`a` int(10) unsigned DEFAULT NULL,
`b` int(10) unsigned DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=gbk
1 row in set (0.00 sec)
```

可以看到

int(10),

这个代表什么意思呢？整型不是

4

字节码？这个

10

又代表什么呢？

**（其实就是长度，无符号int最大为42亿多，也就是一个十位数）**

其实没有

zerofill

这个属性，括号内的数字是毫无意义的。a

和

b

列就是前面插入的数据，如下：

```cpp
mysql> insert into tt3 values(1,2);
Query OK, 1 row affected (0.00 sec)
mysql> select * from tt3;
+------+------+
| a    | b    |
+------+------+
| 1    | 2    |
+------+------+
```

对列添加了zerofill

属性后，显示的结果就有所不同了。修改

tt3

表的属性：

```cpp
mysql> alter table tt3 change a a int(5) unsigned zerofill;
mysql> show create table tt3\G
*************************** 1. row ***************************
Table: tt3
Create Table: CREATE TABLE `tt3` (
`a` int(5) unsigned zerofill DEFAULT NULL, --具有了zerofill
`b` int(10) unsigned DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=gbk
1 row in set (0.00 sec)
```

这次可以看到

a

的值由原来的

**1变成00001，这就是zerofill属性的作用**

，如果宽度小于设定的宽度（这里设置的是5

），自动填充

0

。要注意的是，这只是最后显示的结果，

**在MySQL中实际存储的还是1。**

为什么是这样呢？我们可以用hex

函数来证明。

```cpp
mysql> select a, hex(a) from tt3;
+-------+--------+
| a     | hex(a) |
+-------+--------+
| 00001 | 1      |
+-------+--------+
```

可以看出数据库内部存储的还是

1,00001

只是设置了

zerofill

属性后的一种格式化输出而已。

## **主键**

主键：

primary key

用来唯一的

**约束该字段里面的数据，不能重复，不能为空，一张表中最多只能有一个主键**

；主键所在的列通常是整数类型。

案例：

创建表的时候直接在字段上指定主键

```cpp
mysql> create table tt13 (
-> id int unsigned primary key comment '学号不能为空',
-> name varchar(20) not null);
Query OK, 0 rows affected (0.00 sec)
mysql> desc tt13;
+-------+------------------+------+-----+---------+-------+
| Field | Type             | Null | Key | Default | Extra |
+-------+------------------+------+-----+---------+-------+
| id    | int(10) unsigned | NO   | PRI | NULL    |       | <= key 中 pri表示该字段是主键
| name  | varchar(20)      | NO   |     | NULL    |       |
+-------+------------------+------+-----+---------+-------+
```

主键约束：主键对应的字段中不能重复，一旦重复，操作失败。

当表创建好以后但是没有主键的时候，可以再次追加主键

```cpp
alter table 表名 add primary key(字段列表)
```

删除主键

```cpp
alter table 表名 drop primary key;
```

```cpp
mysql> alter table tt13 drop primary key;
mysql> desc tt13;
+-------+------------------+------+-----+---------+-------+
| Field | Type             | Null | Key | Default | Extra |
+-------+------------------+------+-----+---------+-------+
| id    | int(10) unsigned | NO   |     | NULL    |       |
| name  | varchar(20)      | NO   |     | NULL    |       |
+-------+------------------+------+-----+---------+-------+
```

### 复合主键

在创建表的时候，在所有字段之后，使用primary key(

主键字段列表

)

来创建主键，如果有多个字段

作为主键，可以使用复合主键。

```cpp
mysql> create table tt14(
-> id int unsigned,
-> course char(10) comment '课程代码',
-> score tinyint unsigned default 60 comment '成绩',
-> primary key(id, course) -- id和course为复合主键
-> );
Query OK, 0 rows affected (0.01 sec)
mysql> desc tt14;
+--------+---------------------+------+-----+---------+-------+
| Field  | Type                | Null | Key | Default | Extra |
+--------+---------------------+------+-----+---------+-------+
| id     | int(10) unsigned    | NO   | PRI | 0       |       | <= 这两列合成主键
| course | char(10)            | NO   | PRI |         |       |
| score  | tinyint(3) unsigned | YES  |     | 60      |       |
+--------+---------------------+------+-----+---------+-------+

mysql> insert into tt14 (id,course)values(1, '123');
Query OK, 1 row affected (0.02 sec)
mysql> insert into tt14 (id,course)values(1, '123');
ERROR 1062 (23000): Duplicate entry '1-123' for key 'PRIMARY' -- 主键冲突
```

## **自增长**

auto_increment

：当对应的字段，不给值，会自动的被系统触发，系统会

**从当前字段中已经有的最大值+1操作，得到一个新的不同的值。**

通常和主键搭配使用，作为逻辑主键。

自增长的特点

:

- 任何一个字段要做自增长，前提是本身是一个索引（key一栏有值）
- 自增长字段必须是整数
- 一张表最多只能有一个自增长

案例：

```cpp
mysql> create table tt21(
-> id int unsigned primary key auto_increment,
-> name varchar(10) not null default ''
-> );
mysql> insert into tt21(name) values('a');
mysql> insert into tt21(name) values('b');
mysql> select * from tt21;
+----+------+
| id | name |
+----+------+
| 1  | a    |
| 2  | b    |
+----+------+
```

在插入后

**获取上次插入的 AUTO_INCREMENT 的值**

（批量插入获取的是第一个值）

```cpp
mysql > select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
| 1                |
+------------------+
```

### 索引

在关系数据库中，索引是一种单独的、物理的对数据库表中一列或多列的值进行排序的一种存储结

构，它是某个表中一列或若干列值的集合和相应的指向表中物理标识这些值的数据页的逻辑指针清单。 索引的作用相当于图书的目录，可以根据目录中的页码快速找到所需的内容。

索引提供指向存储在表的指定列中的数据值的指针，然后根据您指定的排序顺序对这些指针排序。

数据库使用索引以找到特定值，然后顺指针找到包含该值的行。这样可以使对应于表的

SQL

语句执行得 更快，可快速访问数据库表中的特定信息。

## **唯一键**

**一张表中有往往有很多字段需要唯一性，数据不能重复，但是一张表中只能有一个主键**

：唯一键就可以解决表中有多个字段需要唯一性约束的问题。

唯一键的本质和主键差不多，

**唯一键允许为空，而且可以多个为空，空字段不做唯一性比较。**

关于唯一键和主键的区别：

我们可以简单理解成，主键更多的是标识唯一性的。而

**唯一键更多的是保证在业务上，不要和别的信息出现重复。**

乍一听好像没啥区别，我们举一个例子

> *假设一个场景(当然，具体可能并不是这样，仅仅为了帮助理解)*
>
> *比如在公司，我们需要一个员工管理系统，系统中有一个员工表，员工表中有两列信息，一个身份证号码，一个是员工工号，我们可以选择身份号码作为主键。 而我们设计员工工号的时候，需要一种约束：而所有的员工工号都不能重复。 具体指的是在公司的业务上不能重复，我们设计表的时候，需要这个约束，那么就可以将员工工号设计成为唯一键。 一般而言，*
>
> ***我们建议将主键设计成为和当前业务无关的字段，这样，当业务调整的时候，我们可以尽量不会对主键做过大的调整。***

案例：

```cpp
mysql> create table student (
-> id char(10) unique comment '学号，不能重复，但可以为空',
-> name varchar(10)
-> );
Query OK, 0 rows affected (0.01 sec)
mysql> insert into student(id, name) values('01', 'aaa');
Query OK, 1 row affected (0.00 sec)
mysql> insert into student(id, name) values('01', 'bbb'); --唯一约束不能重复
ERROR 1062 (23000): Duplicate entry '01' for key 'id'
mysql> insert into student(id, name) values(null, 'bbb'); -- 但可以为空
Query OK, 1 row affected (0.00 sec)
mysql> select * from student;
+------+------+
| id   | name |
+------+------+
| 01   | aaa  |
| NULL | bbb  |
+------+------+
```

## **外键**

外键用于定义主表和从表之间的关系：外键约束主要定义在从表上，主表则必须是有主键约束或

unique约束。当定义外键后，要求外键列数据必须在主表的主键列存在或为null

。

```cpp
foreign key (字段名) references 主表(列)
```

![图片](https://i-blog.csdnimg.cn/direct/f1e7f85918df4f06a01c3fbc0a4401e4.png)

> 首先我们承认，这个世界是数据很多都是相关性的。
>
> 理论上，上面的例子，如果我们不创建外键约束，就正常建立学生表，以及班级表，该有的字段我们都有。 此时，在实际使用的时候，可能会出现什么问题？
>
> 有没有可能插入的学生信息中有具体的班级，但是该班级却没有在班级表中？
>
> 这很明显是有问题的。 因为此时两张表在业务上是有相关性的，但是在业务上没有建立约束关系，那么就可能出现问题。 解决方案就是通过外键完成的。建立外键的本质其实就是把相关性交给mysql
>
> 去审核了，提前告诉
>
> mysql 表之间的约束关系，那么当用户插入不符合业务逻辑的数据的时候，mysql
>
> 不允许你插入。

案例：

有一个商店的数据，记录客户及购物情况，有以下三个表组成：

- 商品goods(商品编号goods_id，商品名goods_name,单价unitprice,商品类别category,供应商 provider)
- 客户customer(客户号customer_id,姓名name,住址address,邮箱email,性别sex，身份证card_id)
- 购买purchase(购买订单号order_id,客户号customer_id,商品号goods_id,购买数量nums)

要求：

- 每个表的主外键
- 客户的姓名不能为空值
- 邮箱不能重复
- 客户的性别(男，女)

```cpp
-- 创建数据库
create database if not exists store
default character set utf8 ;

-- 选择数据库
use store;

-- 创建数据库表
-- 商品
create table if not exists goods
(
goods_id int primary key auto_increment comment '商品编号',
goods_name varchar(32) not null comment '商品名称',
unitprice float not null default 0 comment '单价，单位分',
category varchar(12) comment '商品分类',
provider varchar(64) not null comment '供应商名称'
);

-- 客户
create table if not exists customer
(
customer_id int primary key auto_increment comment '客户编号',
name varchar(32) not null comment '客户姓名',
address varchar(256) comment '客户地址',
email varchar(64) unique key comment '电子邮箱',
sex enum('男','女') not null comment '性别',
card_id char(18) unique key comment '身份证'
);

-- 购买
create table if not exists purchase
(
order_id int primary key auto_increment comment '订单号',
customer_id int comment '客户编号',
goods_id int comment '商品编号',
nums int default 1 comment '购买数量',
foreign key (customer_id) references customer(customer_id),
foreign key (goods_id) references goods(goods_id)
);
```

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
