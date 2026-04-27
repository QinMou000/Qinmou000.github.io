---
title: web_ai后端项目中遇到的问题
date: 2026-04-27
categories:
  - 征图日记
---

# 项目历史中的重大技术难题与解决方案
## 难题一：N+1 数据库查询致性能崩溃
现象：导出包含 23,000 帧的标注数据集时，后端直接卡死，一个导出任务跑了几小时还没完成。

根因：ORM 代码在循环内部调用 label_list()，这个方法每次都会触发 attribute_spec_set.all() 查询。23,000 帧 × N 个标签 = 百万级的数据库查询。

解法（提交 3b048038）：将 label_list() 的计算提到循环外部，存为 cached_label_list，循环内直接复用。同时引入批量预取、O(1) 查找字典、批量 bulk_create/bulk_update 替代逐条写入（a58edc85、d14fd740、27a26684 三次迭代优化）。

学到的：ORM 的便利性会掩盖 SQL 的真实数量，循环里调用查询方法是新手最常见也最致命的性能坑。

## 难题二：CPU 被死循环打满 100%
现象：线上服务部署后，每个 worker 进程长期占满一个 CPU 核心，服务器风扇狂转。

根因（提交 b24a4567）：轮询 Redis 获取任务状态的 _get_rq_job_status 函数里，while True 循环中的 time.sleep(0.2) 被注释掉了，导致每秒对 Redis 发起数千次查询。更致命的是：当 Redis 的 job key 因 TTL 到期或内存淘汰（volatile-lru）被删除后，get_status() 返回 None，is_finished/is_failed 都是 False，循环永不退出。

解法：恢复 time.sleep(0.2)，将轮询频率限制在 5 次/秒；新增 get_status() 返回 None 时立即 break，处理 key 消失的边缘场景。

学到的：轮询必须有 sleep + 必须有退出条件。热循环在生产环境中会在几秒内榨干 CPU。

## 难题三：Redis 锁被内存淘汰导致任务误报失败
现象（提交 b894426b）：导出任务报 "ReleaseUnlockedLock" 异常，任务明明完成了却被标记为失败。

根因：Redis 的 volatile-lru 内存淘汰策略在内存不足时会删除带 TTL 的 key（包括导出锁）。锁被 Redis 删了，任务完成后去释放锁时发现锁不存在，直接抛异常。同时大量图片预览缓存 key 占满了 Redis 内存。

解法：预览图默认不再走 Redis 缓存（只走内存缓存），减少 Redis 内存压力；缓存 TTL 从 300s 降到 60s 可配置；释放锁时主动捕获 ReleaseUnlockedLock 异常而不是让它传播。

学到的：用 Redis 做分布式锁必须考虑 key 被意外删除的情况，不能假设锁一定存在。

## 难题四：并发提交推理任务导致重复建任务 + 死锁
现象（提交 6d491dc8、6041099c）：用户快速双击提交推理按钮，或者两个请求几乎同时到达，导致同一个推理任务被创建了两次。偶尔还报数据库死锁。

根因：两个并发请求同时读到 "还不存在任务"，于是各自创建了一个。数据库层面没有阻止。

解法：在创建推理任务前，对 Flow/FlowVersion 行加 select_for_update 数据库行锁。第一个请求拿到锁后创建任务，第二个请求等锁释放后再查询就能看到已创建的任务，不会重复创建。

学到的：Web 请求天然并发，任何"先查后写"的逻辑都可能被竞态条件打穿。数据库行锁是最简单有效的并发控制手段。

## 难题五：多 Worker 进程重启触发全库数据清理
现象（提交 10addcca）：每次重启服务，所有正在进行中的任务状态会被全部清掉，用户以为任务丢了。

根因：Uvicorn 的多 worker 模式下，每个子进程启动时都会运行 AppConfig.ready()，里面对"残留 alive 任务"的清理逻辑被每个 worker 执行了一遍。这不是清理残留——这是把正在跑的任务都清了。

解法：将清理逻辑从 AppConfig.ready() 抽离为独立的 Django management command（fsglobal_startup_cleanup），只在 systemd 的 ExecStartPost 中执行一次，而非每个 worker 各执行一次。

学到的：在 prefork 模型（Gunicorn/Uvicorn workers）下，初始化代码会被每个子进程执行。需要区分"进程级初始化"和"服务级一次性操作"。

## 难题六：跨平台 ZIP 文件 MD5 不一致
现象（提交 3977a5db）：同一个数据集，Windows 上导出后计算的 MD5 和 Linux 上导出后的 MD5 不同，导致文件校验失败。

根因：ZIP 格式会把文件的修改时间戳写入元数据。同样的内容在不同操作系统上打包，时间戳不同（时区、文件系统精度），导致 ZIP 文件的字节级哈希不同。

解法：在导出过程中统一将 ZIP 内文件的时间戳设置为固定值，消除操作系统差异。

学到的：文件格式的元数据（非内容数据）也会影响哈希值，跨平台一致性需要显式控制元数据。

## 难题七：DEBUG 模式在生产环境意外开启
现象（提交 3b048038）：RQ 导出任务内存持续膨胀，最终 OOM，但代码逻辑看起来没问题。

根因：DEBUG=True 时，Django 会用 CursorDebugWrapper 把每条执行的 SQL 存入 connection.queries 列表。RQ 导出任务可能执行几十万条 SQL，这个列表无限增长，把内存吃光。

解法：将 DEBUG 的默认值从 True 改为 False，需要时通过环境变量 CVAT_DEBUG=1 显式开启。

学到的：Django DEBUG 模式不只是"显示详细报错页面"，它会改变数据库连接行为，对长时间运行的任务有隐蔽的内存影响。

## 难题八：Python 3.11 UUID 类型兼容性
现象（提交 23827d44）：升级 Python 3.11 后，标注更新的 PATCH 接口报错 TypeError。

根因：代码把已是 uuid.UUID 类型的字段又包了一层 uuid.UUID()，Python 3.10 能容忍，3.11 严格报错。同时前端 action=create 时带的旧 ID 值导致数据库主键冲突。

解法：先判断是否已经是 UUID 实例再做转换（安全归一化）；纯创建路径中去掉客户端传入的旧主键。

学到的：Python 版本升级可能在看似无害的类型转换处引入 breaking change，不能假设"以前能用就一直能用"。

