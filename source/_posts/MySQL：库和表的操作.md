---
title: MySQL：库和表的操作
date: 2024-11-25
categories:
  - MySQL
---

> ![图片](https://i-blog.csdnimg.cn/direct/6cba51481e444fb6b602b9ddab2084cd.png)
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨
>
> ✨✨所属专栏：[MySql](https://blog.csdn.net/2301_80194476/category_12841400.html?spm=1001.2014.3001.5482)✨✨

## 库的操作

### 创建数据库

```
CREATE DATABASE [IF NOT EXISTS] db_name [create_specification [,
create_specification] ...]
create_specification:
[DEFAULT] CHARACTER SET charset_name
[DEFAULT] COLLATE collation_name
```

说明：

- 大写的表示关键字
- [] 是可选项
- CHARACTER SET: 指定数据库采用的字符集
- COLLATE: 指定数据库字符集的校验规则

创建名为db1的数据库

```
create database db1;
```

说明：当我们创建数据库没有指定字符集和校验规则时，系统使用默认字符集：utf8，校验规则 是：utf8_ general_ ci

创建一个使用utf8字符集的db2数据库

```
creat database db2 charset=utf8;
```

创建一个使用utf字符集，并带校队规则的db3数据库

```
create database db3 charset=utf8 collate utf8_general_ci;
```

### 字符集和校验规则

### 查看系统默认字符集及校验规则

```
show variables like 'character_set_database';
show variables like 'collation_database';
```

### 查看数据库支持的字符集

```
show charset;
```

字符集主要是控制用什么语言，比如utf8就可以使用中文。

![图片](https://i-blog.csdnimg.cn/direct/f20108b729084c78a28a73d665dfaff2.png)

### 查看数据库支持的字符集校验规则

```
show collation;
```

![图片](https://i-blog.csdnimg.cn/direct/4b19e68469f3406fb9482ac394e1be80.png)

### 校验规则对数据库的影响

创建一个数据库，校验规则使用utf8_general_ci[不区分大小写]

```cpp
create database test1 collate utf8_general_ci;
```

```cpp
use test1;
```

```cpp
create table person(name varchar(20));
```

```cpp
insert into person values('a');
insert into person values('A');
insert into person values('b');
insert into person values('B');
```

```cpp
select * from person where name='a';
```

![图片](https://i-blog.csdnimg.cn/direct/cfb527aa010143eca5db3b53afa20af6.png)

```cpp
select * from person order by name;
```

![图片](https://i-blog.csdnimg.cn/direct/1b05e35ed8b84e30974a72b359b8ee70.png)

创建一个数据库，校验规则使用utf8_ bin[区分大小写]

```cpp
create database test2 collate utf8_bin;
```

```cpp
use test2
```

```cpp
create table person(name varchar(20));
```

```cpp
insert into person values('a');
insert into person values('A');
insert into person values('b');
insert into person values('B');
```

```cpp
select * from person where name='a';
```

![图片](https://i-blog.csdnimg.cn/direct/eaa21e7e603f490fa30da368e6d5f47f.png)

```cpp
select * from person order by name;
```

![图片](https://i-blog.csdnimg.cn/direct/c3984943c10d4bc3975e201ad5520b29.png)

### 操作数据库

查看数据库

```cpp
show databases;
```

显示创建语句

```cpp
show create database 数据库名；
```

![图片](https://i-blog.csdnimg.cn/direct/43b2015cc3964ef58bd3cc92b71d9297.png)

### 修改数据库

```cpp
ALTER DATABASE db_name
[alter_spacification [,alter_spacification]...]
alter_spacification:
[DEFAULT] CHARACTER SET charset_name
[DEFAULT] COLLATE collation_name
```

说明：对数据库的修改主要指的是修改数据库的字符集，校验规则

实例： 将 mytest 数据库字符集改成 gbk

```cpp
mysql> alter database mytest charset=gbk;
Query OK, 1 row affected (0.00 sec)
mysql> show create database mytest;
+----------+----------------------------------------------------------------+
| Database | Create Database |
+----------+----------------------------------------------------------------+
| mytest | CREATE DATABASE `mytest` /*!40100 DEFAULT CHARACTER SET gbk */ |
+----------+----------------------------------------------------------------+
```

### 数据库删除（不推荐）

```cpp
DROP DATABASE [IF EXISTS] db_ name;
```

执行删除之后的结果:

- 数据库内部看不到对应的数据库
- 对应的数据库文件夹被删除，级联删除，里面的数据表全部被删

**注意：不要随意删除数据库**

### 备份和恢复

#### 备份

语法：

```cpp
# mysqldump -P3306 -u root -p 密码 -B 数据库名 > 数据库备份存储的文件路径
```

示例：将mytest库备份到文件（退出连接）

```cpp
# mysqldump -P3306 -u root -p123456 -B mytest > D:/mytest.sql
```

这时，可以打开看看 mytest.sql 文件里的内容，其实把我们整个创建数据库，建表，导入数据的语句 都装载这个文件中。

#### 还原

```cpp
mysql> source D:/mysql-5.7.22/mytest.sql;
```

#### 注意事项

如果备份的不是整个数据库，而是其中的一张表，怎么做？

```cpp
# mysqldump -u root -p 数据库名 表名1 表名2 > D:/mytest.sql
```

同时备份多个数据库

```cpp
# mysqldump -u root -p -B 数据库名1 数据库名2 ... > 数据库存放路径
```

如果备份一个数据库时，没有带上-B参数， 在恢复数据库时，需要先创建空数据库，然后使用数据库，再使用source来还原。

### 查看连接情况

语法

```cpp
show processlist
```

![图片](https://i-blog.csdnimg.cn/direct/ac103c8a28884eac9dab68e41e7d1f4b.png)

可以告诉我们当前有哪些用户连接到我们的MySQL，如果查出某个用户不是你正常登陆的，很有可能你的数据库被人入侵了。以后大家发现自己数据库比较慢时，可以用这个指令来查看数据库连接情况。

## 表的操作

### 创建表

语法

```cpp
CREATE TABLE table_name (
field1 datatype,
field2 datatype,
field3 datatype
) character set 字符集 collate 校验规则 engine 存储引擎;
```

说明：

- field 表示列名
- datatype 表示列的类型
- character set 字符集，如果没有指定字符集，则以所在数据库的字符集为准
- collate 校验规则，如果没有指定校验规则，则以所在数据库的校验规则为准

![图片](https://i-blog.csdnimg.cn/direct/474e7f077a7c4446b6cd95a8efc35e31.png)

说明：

不同的存储引擎，创建表的文件不一样。

users 表存储引擎是 MyISAM ，在数据目中有三个不同的文件，分别是：

- users.frm：表结构
- users.MYD：表数据
- users.MYI：表索引

![图片](https://i-blog.csdnimg.cn/direct/d4245d1cc45c4c7a8edf78004be866c0.png)

![图片](https://i-blog.csdnimg.cn/direct/9c2fa45ed88b472f9dd1da3ae050c273.png)

备注：创建一个engine是innodb的数据库，观察存储目录

### 查看表结构

```cpp
desc 表名;
```

![图片](https://i-blog.csdnimg.cn/direct/5c8adfb2452c431c950d78a3cb188d54.png)

### 修改表

在项目实际开发中，经常修改某个表的结构，比如字段名字，字段大小，字段类型，表的字符集类型， 表的存储引擎等等。我们还有需求，添加字段，删除字段等等。这时我们就需要修改表。

```cpp
ALTER TABLE tablename ADD (column datatype [DEFAULT expr][,column
datatype]...);
ALTER TABLE tablename MODIfy (column datatype [DEFAULT expr][,column
datatype]...);
ALTER TABLE tablename DROP (column);
```

案例：

- 在users表添加二条记录

```cpp
insert into users values(1,'a','b','1982-01-04'),(2,'b','c','1984-01-04');
```

- 在users表添加一个字段，用于保存图片路径

```cpp
mysql> alter table users add assets varchar(100) comment '图片路径' after
birthday;
```

![图片](https://i-blog.csdnimg.cn/direct/db91c16925c44526b894c334472ee2eb.png)

插入新字段后，对原来表中的数据没有影响：

![图片](https://i-blog.csdnimg.cn/direct/257a9417cbd74d4da95859157923a64d.png)

- 修改name，将其长度改成60

```cpp
alter table users modify name varchar(60);
```

![图片](https://i-blog.csdnimg.cn/direct/8960009a45c747b090ee014f8c9e38ed.png)

- 删除password列

**注意：删除字段一定要小心，删除字段及其对应的列数据都没了**

```cpp
alter table users drop password;
```

![图片](https://i-blog.csdnimg.cn/direct/ec20eda89f2e401d9818991f640c2e6f.png)

- 修改表名为employee

```cpp
alter table users rename to employee; // to可以省掉
```

![图片](https://i-blog.csdnimg.cn/direct/e4bbe677678e4913b42ec95ccf1ac0b2.png)

- 将name列修改为xingming

```cpp
alter table employee change name xingming varchar(60); --新字段需要完整定义
```

![图片](https://i-blog.csdnimg.cn/direct/40435229415f40679247dcb7dd107670.png)

### 删除表 （不推荐）

语法

```cpp
DROP [TEMPORARY] TABLE [IF EXISTS] tbl_name [, tbl_name] ...
```

```cpp
drop table t1
```

![图片](https://i-blog.csdnimg.cn/direct/7ee5d7b383ec4ab7942f6564bb3f1ef1.png)

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
