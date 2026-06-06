---
title: MySQL：内置函数
date: 2024-12-22
categories:
  - MySQL
---

> ![图片](https://i-blog.csdnimg.cn/direct/6cba51481e444fb6b602b9ddab2084cd.png)
>
> ✨✨作者主页：[嶔某](https://blog.csdn.net/2301_80194476?spm=1000.2115.3001.5343)✨✨
>
> ✨✨所属专栏：[MySql](https://blog.csdn.net/2301_80194476/category_12841400.html?spm=1001.2014.3001.5482)✨

***本文的代码中， [ ] 里面的都可以省略***

## 日期函数

***说明：日期xxxx-xx-xx 时间xx:xx:xx***

| 函数名称 | 描述 |
| --- | --- |
| current_date() | 当前日期 |
| current_time() | 当前时间 |
| current_timestamp() | 当前时间戳 |
| date(datetime) | 返回datetime参数的日期部分 |
| date_add(date, interval d_value_type) | 在date中加上日期或时间 interval后的数值单位可以是: year minute second day |
| date_sub(date, interval d_value_type) | 在date中减去日期或时间 interval后的数值单位可以是: year minute second day |
| datediff(date1, date2) | 两个日期的差，单位是天 |
| now() | 当前日期时间 |

基本使用：

- 获得年月日

![图片](https://i-blog.csdnimg.cn/direct/5cc1eeff29574a2cb0e866c357ae13ba.png)

- 获得时分秒

![图片](https://i-blog.csdnimg.cn/direct/8d8e5b12ebee4b9692174a53405a7d4b.png)

- 获得时间戳

![图片](https://i-blog.csdnimg.cn/direct/e74ed032f8304ed1be6f5bbece037689.png)

- 在日期的基础上加上日期或时间

![图片](https://i-blog.csdnimg.cn/direct/8649d7fb92464a9bba1493bbdd7401af.png)

- 在日期的基础上减去日期或时间

![图片](https://i-blog.csdnimg.cn/direct/c04d66da594a4ad09ddfb7bcf7619e36.png)

- 计算两个日期之间相差多少天（前一个减去后一个）

![图片](https://i-blog.csdnimg.cn/direct/6550a83287b34ebd8d34557727e63aa4.png)

案例：

- 创建一个留言表

```sql
create table msg (
id int primary key auto_increment,
content varchar(30) not null,
sendtime datetime
);
```

- 插入数据

```sql
insert into msg(content,sendtime) values('hello1', now());
insert into msg(content,sendtime) values('hello2', now());
```

![图片](https://i-blog.csdnimg.cn/direct/b6e276a139e641ecaa560916eb9864ef.png)

- **查询在两分钟内发布的贴子**

```sql
select content, sendtime from msg
where date_sub(now(), interval 2 minute)<sendtime;

select content, sendtime from msg
where date_add(sendtime, interval 2 minute)>now();
```

## 字符串函数

| charset(str) | 返回字符串字符集（一般就是utf-8） |
| --- | --- |
| concat(string1,[string2,...]) | 连接字符串 |
| instr(string,substring) | 返回substring在string中出现的位置，没有返回0 |
| ucase(string) | 转换成大写 |
| lcase(string) | 转换成小写 |
| left(string, length),right(string, length) | 从string2中的左边起职length个字符 |
| length(string) | string的长度，**实际上是占用的字节数，一个中文占多个字节（与字符集编码有关）** |
| replace(str, search_str, replace_str) | 在str中用replace_str替换search str**（只是显示，不会修改表中数据）** |
| strcmp(string1, string2) | 逐字符比较两字符串大小 |
| substring(string, position[, length]) | 从str的postion开始，取length个字符 |
| ltrim(string), rtrim(string) trim(string) | 去除前空格或后空格 |

## 数学函数

| 函数名称 | 描述 |
| --- | --- |
| abs(number) | 绝对值函数 |
| bin(decimal_number) | 十进制转换二进制 |
| hex(decimal_number) | 转换成十六进制 |
| conv(number, from_base, to_base) | 进制转换，从from_base进制转换为to_base进制 |
| ceiling(number) | 向上去整 |
| floor(number) | 向下去整**（C语言是向零取整）** |
| format(number, decimal_number) | 格式化，保留小数位数**（小数四舍五入）** |
| rand() | 返回随机浮点数，范围[0.0, 1.0) |
| mod(number, denominator) | 取模，求余**（注意负数取模）** |

## 其他函数

- user() 查询当前用户

![图片](https://i-blog.csdnimg.cn/direct/3401000fbaad4cd9b6dc172ed34469b5.png)

- md5() 对一个字符串进行md5摘要，摘要后得到一个32位字符串

![图片](https://i-blog.csdnimg.cn/direct/6ce51c8829284e7e9ae1065d895b4206.png)

- database() 显示当前正在使用的数据库

![图片](https://i-blog.csdnimg.cn/direct/b205f0e0766043ce9afe880b77367ac4.png)

- SHA2()函数

password() MySql使用该函数对用户加密（从 MySQL 8.0.11 开始，函数password()已被弃用）

推荐使用更新的哈希算法对密码进行加密如SHA2()函数

![图片](https://i-blog.csdnimg.cn/direct/013e93478ec04b27ae21ac854ef12a45.png)

```sql
SHA2('qinqin', 256);
这将会生成一个 256 位的加密哈希值
```

SHA-256会生成一个 256 位的加密哈希值，**256 位 等于 32 字节（每个字节是 8 位）**。MySQL 返回的哈希值是十六进制字符串，每个字节用两个十六进制字符表示（如 00、FF）。因此，**32 字节的哈希值最终变成 64 个十六进制字符**

- ifnull(val1, val2) 如果val1为null，回val2，否则返回val1的值

![图片](https://i-blog.csdnimg.cn/direct/ff57d40d3e1340de914634561abc5ec4.png)

**本期博客到这里就结束了，如果有什么错误，欢迎指出，如果对你有帮助，请点个赞，谢谢！**
