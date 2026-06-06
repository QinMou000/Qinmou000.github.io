---
title: MySQL：基本查询
date: 2024-12-20
categories:
  - MySQL
---

> ![图片](https://i-blog.csdnimg.cn/direct/6cba51481e444fb6b602b9ddab2084cd.png)
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨
>
> ✨✨所属专栏：[MySql](https://blog.csdn.net/2301_80194476/category_12841400.html?spm=1001.2014.3001.5482)✨✨

***本文的代码中， [ ] 里面的都可以省略***

在 MySQL 中，**CRUD** 是数据库操作的核心，代表以下四种基本操作：

- **C**（Create）：创建、插入、数据。
- **R**（Retrieve）：检索、恢复、查询数据。
- **U**（Update）：更新数据。
- **D**（Delete）：删除数据。

## Create

- 单行插入

语法：

```sql
INSERT INTO 表名 (column1, column2, ...) VALUES (value1, value2, ...);
```

- 多行插入

语法：

```sql
INSERT INTO 表名 (column1, column2, ...) VALUES
(value1, value2, ...),
(value1, value2, ...)...;
```

在插入时，有时会遇到主键或唯一键冲突，而导致插入失败。这时我们可以：

- 使用 `INSERT IGNORE`

忽略冲突并跳过报错

```sql
INSERT IGNORE INTO table_name (column1, column2, ...) VALUES (value1, value2, ...);
```

> 如果插入的记录导致主键或唯一键冲突，MySQL 会**忽略这条记录，不会插入，也不会报错**。
>
> 适合场景：只需确保数据唯一性，冲突时无需更新数据。

- 使用 `ON DUPLICATE KEY UPDATE`

当冲突发生时，执行更新操作

```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...)
ON DUPLICATE KEY UPDATE column2 = value2, column3 = value3;
```

> 如果插入的记录导致主键或唯一键冲突，MySQL 会**更新指定的字段**，而不是插入新记录。
>
> 适合场景：需要更新已存在的数据时。

- 使用 `REPLACE INTO`

替换已有记录

```sql
REPLACE INTO table_name (column1, column2, ...) VALUES (value1, value2, ...);
```

> 如果记录已存在，MySQL 会删除原有记录，然后插入新记录。
>
> 适合场景：插入时确保数据完整替换。

**`REPLACE` 是先删除再插入，可能导致主键递增和触发器等副作用**

## Retrieve

语法：

```sql
SELECT
[DISTINCT] {* | {column [, column] ...}
[FROM table_name]
[WHERE ...]
[ORDER BY column [ASC | DESC], ...]
LIMIT ...
```

- 全列查询

```sql
SELECT * FROM table_name;
```

- 指定列查询

```sql
SELECT column1, column2, column3 FROM table_name;
```

- 查询字段为表达式

```sql
SELECT column1, column2, column1+column2 FROM table_name;
```

- 为查询结果指定别名

```sql
SELECT column [AS] alias_name [...] FROM table_name;
```

- 结果去重

```sql
SELECT DISTINCT column FROM table_name
```

### 条件筛选（WHERE子句）

比较运算符：

| 运算符 | 说明 |
| --- | --- |
| >、>=、<、<= | 大于，大于等于，小于，小于等于 |
| = | 等于，NULL不安全，例如NULL=NULL的结果是NULL |
| <=> | 等于，NULL安全，例如NULL=NULL的结果是TRUE(1) |
| !=<> | 不等于 |
| BETWEEN a0 AND a1 | 范围匹配，[a0,a1]，如果a0 <= value <= a1，返回TRUE(1) |
| IN (option, ...) | 如果是option中的任意一个，返回TRUE(1) |
| IS NULL | 是NULL |
| IS NOT NULL | 不是NULL |
| LIKE | 模糊匹配，%表示任意多个（包括0个）任意字符， _表示任意一个字符 |

逻辑运算符：

| 运算符 | 说明 |
| --- | --- |
| AND | 多个条件必须都为TRUE(1)，结果才是TRUE(1) |
| OR | 任意一个条件为TRUE(1)，结果才为TRUE(1) |
| NOT | 条件为TRUE(1)，结果为FALSE(0) |

案例：

假如我们有以下表结构和数据

![图片](https://i-blog.csdnimg.cn/direct/d15499d1c1894dedab82ebc107f83116.png)

![图片](https://i-blog.csdnimg.cn/direct/ea156bb329db403aa9ced431c68b3eb1.png)

- 英语不及格的同学及其英语成绩（< 60）

```sql
select name, english from exam_result where english < 60;
```

- 语文成绩在[80，90]分的同学及其语文成绩

```sql
select name, chinese from exam_result where chinese>=80 and chinese<=90;

select name, chinese from exam_result where chinese between 80 and 90;
```

- 数学成绩是58或者59或者98或者99分的同学及其数学成绩

```sql
select name, math from exam_result
    where math = 58
    or math = 59
    or math = 98
    or math = 99;

select name, math from exam_result where math in (58,59,98,99);
```

- 姓孙的同学 及 孙某同学

```sql
select name from exam_result where name like '孙%';

select name from exam_result where name like '孙_';
```

- 语文成绩好于英语成绩的同学

```sql
select name,chinese,english from exam_result where chinese>english;
```

- 总分在200以下的同学

```sql
select name,chinese+english+math total from exam_result
    where chinese+math+english<200;
```

- ***WHERE 子句中使用表达式，别名不能用在 WHERE 子句中***
- 语文成绩 >80 并且不姓孙的同学

```sql
select name,chinese from exam_result where chinese>80 and name not like '孙%';
```

孙某同学，否则要求总成绩 > 200 并且 语文成绩 < 数学成绩 并且 英语成绩 > 80

```sql
select name,chinese,math,english,chinese+math+english total
from exam_result
where name like '孙_'
or (chinese+math+english>200 and chinese<math and english>80);
```

### NULL的查询

- 查询已知语文成绩的同学

```sql
select name,chinese from exam_result where chinese is not NULL;
```

- NULL和NULL的比较，=和<=>的区别

![图片](https://i-blog.csdnimg.cn/direct/bc771582d656487b843510b42cf4982a.png)

### 结果排序（ORDER BY）

语法：

```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition
ORDER BY column_name [ASC|DESC];

// ASC为升序
// DESC为降序
```

***没有 ORDER BY 子句的查询，返回的顺序是未定义的，永远不要依赖这个顺序***

- 同学及其数学成绩，按数学成绩升序显示

```sql
select name,math from exam_result order by math asc;
```

- 如果需要先按一列排序，再对另一列排序，可以指定多列

```sql
SELECT name, age, city
FROM users
ORDER BY city ASC, age DESC;
```

- 查询同学各门成绩，依次按 数学降序，英语升序，语文升序的方式显示

```sql
select name,chinese,math,english from exam_result
    order by math desc,english asc,chinese asc;
```

- 查询同学总分，由高到低

```sql
select name,chinese+math+english total from exam_result
    order by chinese+math+english desc;

select name,chinese+math+english total from exam_result
    order by total desc;
```

***ORDER BY子句中可以使用表达式，也可以使用列别名***

- 查询姓孙的同学或者姓曹的同学数学成绩，结果按数学成绩由高到低显示

```sql
select name,math from exam_result
    where name like '孙%' or name like '曹%'
    order by math desc;
```

### 筛选分页结果（LIMIT）

语法：

```sql
-- 起始下标为 0

-- 从 s 开始，筛选 n 条结果
SELECT ... FROM table_name [WHERE ...] [ORDER BY ...] LIMIT s, n;

-- 从 0 开始，筛选 n 条结果
SELECT ... FROM table_name [WHERE ...] [ORDER BY ...] LIMIT n;

-- 从 s 开始，筛选 n 条结果，比第二种用法更明确，建议使用
SELECT ... FROM table_name [WHERE ...] [ORDER BY ...] LIMIT n OFFSET s;
```

***对未知表进行查询时，最好加一条 LIMIT 1，避免因为表中数据过大，查询全表数据导致数据库卡死***

- 按id进行分页，每页3条记录，分别显示 第1、2、3页

![图片](https://i-blog.csdnimg.cn/direct/a776bbb470394f9eb23804a39b625dec.png)

## Update

```sql
UPDATE table_name SET column = expr [, column = expr ...]
[WHERE ...] [ORDER BY ...] [LIMIT ...]
```

**对查询到的结果进行列值更新**

- 将孙悟空的数学成绩变更为80分

```sql
update exam_result set math = 80 where name='孙悟空';
```

- 将曹孟德同学的数学成绩变更为60分，语文成绩变更为70分

```sql
update exam_result set math = 60, chinese = 70 where name = '曹孟德';
```

- 将总成绩倒数前三的三位同学的数学成绩加上30分

```sql
update exam_result set math = math+30
    order by math+english+chinese asc limit 3;
```

***数据更新不支持 math += 30 这种语法***

- 将所有同学的语文成绩更新为原来的二倍**（全表更新的语句慎用啊！大人！）**

```sql
update exam_result set chinese = chinese*2;
```

## Delete

语法：

```sql
DELETE FROM table_name [WHERE ...] [ORDER BY ...] [LIMIT ...]
```

案例：

- 删除孙悟空的考试成绩

```sql
delete from exam_result where name = '孙悟空';
```

- 删除整张表数据**（删除整表的操作要慎用啊！大人！）**

![图片](https://i-blog.csdnimg.cn/direct/595ff72e52b74edeb49863844e52397c.png)

这时我们再插入一条数据

![图片](https://i-blog.csdnimg.cn/direct/8ddc1c893e7a4b55a8c7011981541d42.png)

查看表结构

![图片](https://i-blog.csdnimg.cn/direct/fb3f88b41748498b95622909f281c526.png)

### 截断表

语法：

```sql
TRUNCATE [TABLE] table_name
```

**注意：这个操作慎用**

1. 只能对整表操作，不能像DELETE一样针对部分数据操作；
2. 实际上MySQL不对数据操作，所以比DELETE更快，但是TRUNCATE在删除数据的时候，并经过真正的事物，所以无法回滚
3. 会重置AUTO_INCREMENT项

![图片](https://i-blog.csdnimg.cn/direct/13abdee38e324bdd8677bcebd7a88764.png)

![图片](https://i-blog.csdnimg.cn/direct/4043729184be454bbe06ce64c38e1ee8.png)

### truncate和delete的区别

| 操作 | TRUNCATE | DELETE |
| --- | --- | --- |
| 作用 | 删除表中的所有数据， 同时重置自增列（如果存在） | 删除表中满足条件的数据， 可选择性删除 |
| SQL语法 | TRUNCATE TABLE 表名; | DELETE FROM 表名 WHERE 条件; |
| 速度 | 更快（直接重置表，无需逐行删除） | 较慢（逐行删除，可能触发触发器） |
| 日志记录 | 最小化日志记录 （DDL：数据定义语言） | 详细日志记录 （DML：数据操作语言 ） |
| 事务支持 | 不支持事务回滚 | 支持事务回滚（需显式开启事务） |

## 插入查询结果

语法：

```sql
INSERT INTO table_name [(column [, column ...])] SELECT ...
```

案例：

- 删除表中的重复记录，重复的数据只能有一份

```sql
-- 创建一张空表 no_duplicate_table，结构和 duplicate_table 一样
CREATE TABLE no_duplicate_table LIKE duplicate_table;
Query OK, 0 rows affected (0.00 sec)

-- 将 duplicate_table 的去重数据插入到 no_duplicate_table
INSERT INTO no_duplicate_table SELECT DISTINCT * FROM duplicate_table;
Query OK, 3 rows affected (0.00 sec)
Records: 3 Duplicates: 0 Warnings: 0

-- 通过重命名表，实现原子的去重操作
RENAME TABLE duplicate_table TO old_duplicate_table,
no_duplicate_table TO duplicate_table;
Query OK, 0 rows affected (0.00 sec)

-- 查看最终结果
SELECT * FROM duplicate_table;
+------+------+
| id   | name |
+------+------+
| 100  | aaa  |
| 200  | bbb  |
| 300  | ccc  |
+------+------+
3 rows in set (0.00 sec)
```

![图片](https://i-blog.csdnimg.cn/direct/e599c157cba0488ba3b2290a9be5fabb.png)

## 聚合函数

| 函数 | 说明 |
| --- | --- |
| COUNT([DISTINCT] expr) | 返回查询到的数据的数量 |
| SUM([DISTINCT expr]) | 返回查询到的数据的总和，不是数字没有意义 |
| AVG([DISTINCT expr]) | 返回查询到的数据的平均值，不是数字没有意义 |
| MAX([DISTINCT expr]) | 返回查询到的数据的最大值，不是数字没有意义 |
| MIN([DISTINCT expr]) | 返回查询到的数据的最小值，不是数字没有意义 |

案例：

- 统计班级共有多少位同学

```sql
SELECT COUNT(*) FROM students;

SELECT COUNT(1) FROM students;
```

- 统计班级收集的qq号有多少（NULL不会被计入结果）

```sql
SELECT COUNT(qq) FROM students;
```

- 统计本次考试数学成绩分数个数

```sql
--COUNT(math) 统计的是全部成绩
SELECT COUNT(math) FROM exam_result;

--COUNT(DISTINCT math) 统计的是去重成绩数量
SELECT COUNT(DISTINCT math) FROM exam_result;
```

- 统计数学成绩总分

```sql
SELECT SUM(math) FROM exam_result;
```

- 统计平均总分

```sql
SELECT AVG(chinese + math + english) 平均总分 FROM exam_result;
```

- 返回英语最高分

```sql
SELECT MAX(english) FROM exam_result;
```

- 返回 >70 分以上的数学最低分

```sql
SELECT MIN(math) FROM exam_result WHERE math > 70;
```

## group by子句

在

select

中使用

group by

子句可以对指定列进行分组查询

```sql
select column1, column2, .. from table group by column;
```

案例：

准备工作，创建一个雇员信息表（来自oracle 9i的经典测试表）

- EMP员工表
- DEPT部门表
- SALGRADE工资等级表

![图片](https://i-blog.csdnimg.cn/direct/204f175f00944b38add0f4772daa97bb.png)![图片](https://i-blog.csdnimg.cn/direct/82e5a911c2c54382a43b65a4d50fdf44.png)![图片](https://i-blog.csdnimg.cn/direct/7ee50eef37a74e65ab7d11ee38689d95.png)

- 如何显示每个部门的平均工资和最高工资

```sql
select deptno,avg(sal),max(sal) from EMP group by deptno;
```

- 显示每个部门的每种岗位的平均工资和最低工资

```sql
select avg(sal),min(sal),job, deptno from EMP group by deptno, job;
```

- 显示平均工资低于2000的部门和它的平均工资

```sql
统计各个部门的平均工资
select avg(sal) from EMP group by deptno;

having和group by配合使用，对group by结果进行过滤
select avg(sal) as myavg from EMP group by deptno having myavg<2000;
```

*having经常和group by搭配使用，作用是对分组进行筛选，作用有些像where。但与where又有些不同*

| 特性 | WHERE | HAVING |
| --- | --- | --- |
| 作用阶段 | 用于在GROUP BY之前过滤数据 | 用于在GROUP BY之后过滤数据 |
| 适用对象 | 适用于单行数据或未分组的记录 | 适用于分组后的聚合数据（如 SUM、AVG等） |
| 语法位置 | 在GROUP BY或HAVING之前 | 在GROUP BY之后，ORDER BY之前 |
| 过滤目标 | 直接作用于表中的列 | 作用于聚合函数的结果或分组 |
| 性能差异 | 过滤数据的阶段较早，减少了数据处理量，性能更高 | 在分组后过滤，处理量可能较大 |

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
