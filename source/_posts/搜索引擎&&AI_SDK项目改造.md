---
title: 搜索引擎&&AI_SDK项目改造
date: 2026-08-09
categories:
  - 复习
---

------

# 一、BoostSearcher

这个项目我如果是 C++ 后端面试官，会非常喜欢问，因为它可以一路从**数据结构 → 搜索算法 → BM25 → UTF-8 → 并发 → 性能优化**往下挖。

你现在的实现大致是：

```
Markdown → 预处理语料 → 正排索引 + 倒排索引 → cppjieba 分词 → 精确召回 → BM25F 风格排序 → 短语加权 → 编辑距离模糊召回 → HTTP JSON
```

仓库当前确实维护了文档字段长度、title/content 词频、平均字段长度，并据此计算 BM25 风格的字段评分。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/index.cpp))

## 1. ⭐ 你先介绍一下这个搜索引擎？

这是**必问第一题**。

你不要从“我使用了 cppjieba……”开始讲，而应该：

> BoostSearcher 是一个 C++17 实现的本地 Markdown 全文搜索引擎。
>
> 数据侧先把 Markdown 文档解析成统一语料，启动阶段建立正排索引和倒排索引；查询时通过 cppjieba 对查询词进行中文分词，根据倒排表完成候选文档召回，再使用带字段权重的 BM25 评分排序，其中标题权重大于正文，并增加短语匹配 boost。
>
> 为了解决输入错别字或者拼写错误导致完全召回不到的问题，我又增加了基于 UTF-8 编辑距离的模糊召回，并控制最大编辑距离、候选词数量以及模糊结果权重。最后通过 HTTP 接口返回 JSON 搜索结果。

这一段控制在 **40~60 秒**。

目前代码里的标题、正文是分字段计算 BM25 后再加权，标题权重 3、正文权重 1；还额外存在短语 boost。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

------

## 2. ⭐ 什么是正排索引？什么是倒排索引？为什么两个都需要？

面试官实际上是在看你是不是“抄了个搜索引擎”。

可以答：

> 正排索引是 `doc_id → 文档信息`，保存 title、content、url 等信息。
>
> 倒排索引则是 `term → posting list`，posting list 中保存这个词出现在哪些文档以及 title/content 中的词频。
>
> 查询阶段不能遍历所有文档，因为那相当于每次全文扫描。所以先通过倒排索引快速找到候选 `doc_id`，完成召回；排完序以后，再通过正排索引根据 `doc_id` 找回标题、正文和 URL，组装结果。

你的 `DocInfo` 当前确实存 title/content/url/doc_id/字段长度，倒排项记录 doc_id 和 title/content 的 term frequency。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/include/index.h))

### 面试官继续问：

**为什么倒排索引用 `unordered_map`？**

答：

> 因为最主要操作是根据 query term 精确查倒排链，`unordered_map` 平均 O(1) 查询比较合适。
>
> 缺点是它没有有序性，所以我现在做模糊搜索时无法利用顺序，需要扫描词典。如果未来引入前缀检索、Trie 或 BK-Tree，索引结构还可以继续拆分。

这就已经不是背八股了。

------

# 3. ⭐ BM25 是什么？你这个为什么叫“轻量 BM25F”？

**这是 BoostSearcher 最危险、同时也是最能拉开差距的一题。**

你至少应该会写：
$$
IDF(q)=\ln\left(1+\frac{N-df+0.5}{df+0.5}\right)
$$
然后单字段：
$$
score =IDF \cdot\frac{tf(k_1+1)}{tf+k_1(1-b+b\frac{L}{avgL})}
$$
你代码当前使用 `k1=1.5, b=0.75`，title 和 content 分开算，再按 `3:1` 加权。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

你可以这样解释：

> TF-IDF 最大的问题之一是词频近似线性增长，比如一个词出现 100 次理论上会比出现 10 次贡献大很多，但相关性实际上不会线性增加。
>
> BM25 对 TF 做了饱和处理，同时加入文档长度归一化，所以长文档不会仅仅因为词多就占优势。
>
> 我的实现进一步区分 title 和 content，两边分别保存词频和字段长度，分别计算 BM25，然后给 title 更高权重。
>
> 严格来说它不是完整学术定义上的 BM25F，所以我更愿意叫它“轻量 BM25F 风格评分”。

最后这句非常好。

**不要硬说“我实现了标准 BM25F”。**

因为你现在确实是两个字段分别 BM25 后加权求和。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

------

# 4. 为什么 title 权重是 3，content 是 1？

千万别说：

> “因为 BM25F 就这么规定的。”

错。

应该：

> 这是工程上的经验参数，不是 BM25 规定的。对于 Markdown 技术文章来说，标题的信息密度通常比正文高，所以我人为提高标题权重。
>
> 现在这个参数属于 heuristic。如果做成真正生产系统，我会通过离线标注 query-document relevance，然后用 Hit@K、MRR、NDCG 等指标调参，而不是认为 3:1 天然就是最优。

这一回答非常成熟。

------

# 5. ⭐ 为什么还要增加短语匹配？

比如用户搜索：智能指针

分词以后可能成为多个 token。

仅 BM25：智能`、`指针

分别出现就能得高分。但：“这篇文章讲智能设备，其中还提到了几个指针”不一定比：“C++ 智能指针原理”更相关。

所以回答：

> BM25 更关注 term 层面的相关性，并不知道几个 term 是否以用户输入的连续顺序出现。
>
> 因此我额外做 phrase boost。如果原始查询短语直接出现在标题或正文中，再给予额外分数，从而提升连续语义匹配结果。

代码中确实对归一化后的 phrase 做了额外 boost。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

------

# 6. ⭐ 你的模糊搜索怎么做的？

建议直接说整个流程：

> 我采用的是 exact-first。
>
> 查询词先正常查倒排表；如果某个 term 没有精确命中，再进行模糊召回。
>
> 模糊匹配使用 Levenshtein 编辑距离，对于短词严格限制距离：1 个字符不模糊召回，2~4 个字符最大距离 1，更长的词最大距离 2。
>
> 同时只保留有限数量相似 term，并降低模糊结果的评分权重，避免错误候选把精确结果挤下去。

现在 README 和代码中确实采用：1 字不 fuzzy、2~4 字 distance 1、更长 distance 2、最多 5 个相似 term、模糊权重约 60%。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

### 接下来 90% 会追：

**为什么 1 个汉字不做模糊？**

> 单字符的信息量太低。
>
> 比如“树”，编辑距离 1 可以变成几乎所有单字符词，会造成大量误召回，所以短词宁可降低 recall，也要保证 precision。

------

# 7. ⭐ 中文字符串为什么不能直接算 `std::string` 编辑距离？

这也是一个非常好的 C++ 面试点。

答：

> 因为 `std::string` 的长度实际上是 byte 数量，而 UTF-8 一个汉字通常占多个字节。
>
> 如果直接对 byte 做 Levenshtein，比如“智能”和“只能”只差一个汉字，但字节层面可能出现多个位置变化，算出来的编辑距离就失去了字符语义。
>
> 所以我的实现先按 UTF-8 code point 拆分，然后在字符序列上做 DP。

当前代码确实有 UTF-8 拆字符及编辑距离实现，并且对异常 UTF-8 做了 fallback。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/include/searcher.h))

### 再追：

Levenshtein：
$$
dp[i][j]=min
\begin{cases}
dp[i-1][j]+1\
dp[i][j-1]+1\
dp[i-1][j-1]+cost
\end{cases}
$$
时间复杂度：
$$
O(mn)
$$
空间：
$$
O(mn)
$$
如果滚动数组：
$$
O(min(m,n))
$$
你一定要会。

------

# 8. ⭐ 模糊召回现在最大的性能问题是什么？

这道题你甚至可以主动暴露。

> 当前最大瓶颈是：模糊查询需要遍历整个 inverted dictionary，然后逐词计算编辑距离。
>
> 假设词典规模是 V，query term 长度 m，候选词平均长度 n，最坏大致会达到：O(Vmn)
>
> 小规模本地文档还能接受，但词典到几十万甚至百万以后就不可接受。

你当前实现确实会扫描倒排词典，只做了长度差剪枝等优化。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

### 然后面试官问：“怎么优化？”

你可以说：

> 第一层先做长度剪枝；
>
> 再进一步可以使用 BK-Tree，因为编辑距离满足 metric distance，可以快速筛选一定距离内的 term；
>
> 如果偏搜索工程，也可以构建 character n-gram/trigram 倒排，先召回可能相似词再算真实编辑距离；
>
> 中文还可以增加拼音、同音字召回。

这个回答很好。

------

# 9. ⭐ 你的搜索为什么能支持并发？

这里有一个**非常值得你提前准备的代码问题**。

可以说：

> 索引是在服务启动阶段构建完成，搜索阶段主要是只读，所以多个搜索线程可以共享同一份 inverted index 和 forward index，而每次 Search 的候选集合、评分等中间状态都是局部变量，因此查询阶段天然比较适合并发读取。
>
> 但当前设计不支持服务运行过程中一边 Reset/BuildIndex 一边搜索，如果需要在线更新，我会使用 immutable index snapshot，例如后台构建一份新索引后用 `shared_ptr` 原子切换。

这个设计思路不错。

------

# 10. ⭐ 你这个 Singleton 写法线程安全吗？

**这里你千万别硬扛。**

你现在：

```cpp
if (instance == nullptr) {
    lock_guard<mutex> lock(mtx);
    if (instance == nullptr) {
        instance = new Index;
    }
}
// 这段双重检查锁定代码，**如果`instance`是普通裸指针，C++11 及以后依然线程不安全。**
// `instance = new Index;`会被拆分为分配内存、调用构造函数、赋值指针三步。编译器或 CPU 可以发生指令重排序，**把指针赋值重排到构造对象之前**。
// 线程 A 分配内存，给 instance 赋值非空，但对象还没有构造完成；此时线程 B 外层判断发现 instance 不为空，直接访问一个未构造完成的半成品对象，产生未定义行为。
// 解决：将`instance`声明为`std::atomic<Index*>`，依靠原子变量的内存屏障阻止指令重排。
// C++11 之后更推荐 Meyers 单例：函数内部 static 局部对象，标准保证初始化线程安全，不用手写锁与双重检查。
```

源码就是这个 double-check 结构。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/index.cpp))

如果面试官较懂 C++，可以直接攻击你：

> 外层读取 `instance` 没加锁，但是另一个线程可能正在写，这不是 data race 吗？

最好的回答不是辩解，而是：

> 对，这一版这里可以进一步改。
>
> 虽然我用了 double-check locking，但普通指针在 C++ 内存模型下并不能天然保证这种无锁读写安全。
>
> 更简单的实现是直接使用 C++11 之后的 function-local static：
>
> ```cpp
> static Index instance;
> return &instance;
> ```
>
> C++11 保证局部静态对象初始化线程安全，同时还能自动析构，比现在手动 `new` 更干净。

**如果你现场能这么回答，我反而会给你加分。**

因为说明你是真的理解代码，不是在维护“我的项目绝对没 bug”的人设。

------

# 11. 为什么建立 forward index 的时候 `doc_id = vector.size()`？

你代码就是这样生成 doc_id 的。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/index.cpp))

答：

> 因为文档不会在线删除，索引构建阶段顺序 append，所以直接把 vector 下标当 doc_id。
>
> 优点是根据 doc_id 查正排时 O(1)，不需要再维护一层 hash。
>
> 缺点也很明显：不适合在线删除和稳定 ID。如果支持增量更新，我会引入独立 document ID，并解决 tombstone、索引合并等问题。

------

# 12. ⭐ 如果让你把 BoostSearcher 做到百万文档，你怎么改？

这是一道非常好的开放题。

不要只说“加 Redis”。

你可以按层回答：

**索引层**

倒排索引不再全部是 `unordered_map<string, vector<...>>` 的朴素内存对象，可以进行 posting list 压缩，例如 delta encoding / VarInt，并考虑 mmap。

**构建层**

离线分段建索引：

```
segment → merge
```

而不是一次全部构建。

**检索层**

先利用倒排表召回 Top-K，而不是完整候选全排序；使用 heap / WAND 一类优化。

**模糊检索**

从全词典扫描改成：

```
BK-Tree / n-gram candidate generation
```

**服务层**

索引 immutable，多线程共享；更新时构建 snapshot 再切换。

这样你就把一个“课程项目”讲成了一个能继续演进的搜索系统。

------

# 13. 你的性能测试靠谱吗？

这也是当前项目一个可能被攻击的地方。

README 明确说明当前 benchmark 更接近进程内 `Searcher::Search + JSON parse`，并不等价于完整 HTTP end-to-end benchmark，而且当前指标主要是 QPS/平均耗时，并没有 P95/P99、MRR、Hit@K。([GitHub](https://github.com/QinMou000/BoostSearcher))

所以别吹：

> “我的搜索引擎 QPS 就是 XXX。”

应该说：

> 我现在测的是 search core 的吞吐，更适合用来比较算法修改前后的相对变化，不应该把它包装成生产 HTTP 服务 QPS。
>
> 如果继续做，我会把性能指标拆成索引构建时间、搜索 core latency、HTTP E2E latency、P50/P95/P99，以及搜索质量指标 Hit@K、MRR/NDCG。

这反而很专业。

------

# 二、Ai_SDK

这个项目的重点已经不是“会调用 DeepSeek API”。

真正能让它有技术含量的是：

**Provider 抽象 + Tool Calling + SSE + Agent Loop + Runtime Safety + C++ 工程设计。**

当前仓库已经有统一 Provider 接口、ToolRegistry、AIClient、SimpleAgent，以及独立 agent runtime、workspace/command/resource policy 等。([GitHub](https://github.com/QinMou000/Ai_SDK))

------

# 1. ⭐ 先介绍一下 Ai_SDK

你可以这样回答：

> 这个项目的目标不是简单封装一次大模型 HTTP 请求，而是做一个可以嵌入 C++ 应用的 AI Runtime。
>
> 底层通过统一 `IModelProvider` 抽象不同模型，把同步 Chat、流式 Chat、Tool Calling 等能力统一起来；中间层通过 `ToolRegistry` 注册本地工具；再往上提供 `SimpleAgent` 实现基础 ReAct 循环。
>
> 后面我又进一步拆出了 agent runtime，增加 session、project memory、workspace 工具、命令执行、审批机制、资源限制以及 tracing，让它从“模型 API SDK”逐渐演进成可以承载 Agent 的 C++ Runtime。

这个定位非常重要。

不要说：

> “这是一个调用各种大模型 API 的 SDK。”

太普通。

------

# 2. ⭐ 为什么用 C++？Python LangChain 不香吗？

这是 **AI_SDK 必问第一梯队**。

一个比较好的答案：

> 如果只是快速做 Agent 应用，我会优先使用 Python，因为生态明显更成熟。
>
> 但这个项目解决的是另一类问题：让已有 C++ 程序，例如桌面客户端、工业软件、游戏或者本地工具，可以直接嵌入模型和 Agent 能力，而不是额外维护 Python Runtime 或一个 Python sidecar。
>
> C++ 的优势不是“HTTP 请求比 Python 快多少”，因为真正耗时的是网络和模型推理，而是部署形态、二进制集成、类型约束和已有 C++ 系统融合。
>
> 所以这是一个工程选型问题，不是为了证明 C++ 调 LLM 比 Python 性能高。

**这一答法比“C++ 性能高”强很多。**

------

# 3. ⭐ `IModelProvider` 有什么作用？为什么不用 if/else 判断模型？

当前接口提供 `chat`、`streamChat`、`info` 等抽象。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/include/provider/IModelProvider.h))

答：

> 我希望业务层依赖的是“模型能力”，而不是 DeepSeek API 的具体协议。
>
> 所以定义 `IModelProvider`，AIClient 面向接口编程。DeepSeekProvider 负责把统一的 ChatRequest 转换成 DeepSeek 所需 JSON，再把响应映射回统一 ChatResponse。
>
> 如果新增 Provider，只实现新的 adapter，而不是在业务代码里写：
>
> ```
> if DeepSeek ... else if MiniMax ...
> ```
>
> 这样符合依赖倒置，也避免 provider-specific protocol 泄漏到 Agent 层。

### 接着追：

**不同厂商并不完全兼容，怎么统一？**

答：

> 我不会为了统一而强行抹平所有差异。
>
> 公共能力进入统一模型，例如 messages、tool calls、stream；厂商特有能力留在 Provider 或扩展配置层。
>
> Provider abstraction 应该隔离协议差异，而不是假装所有模型完全相同。

这是很好的架构思想。

------

# 4. ⭐ Tool Calling 到底是什么流程？

一定要能完整讲出来：

```text
User
 ↓
LLM
 ↓
tool_calls
 ↓
ToolRegistry
 ↓
本地函数执行
 ↓
tool result
 ↓
再次发送给 LLM
 ↓
最终回答
```

你可以说：

> 模型本身不会执行 C++ 函数。
>
> SDK 首先把工具名称、description、JSON Schema 发送给模型。
>
> 模型决定调用工具以后，会返回 tool_call，包括函数名和 arguments。
>
> SDK 根据 name 从 ToolRegistry 找到 handler 并执行，再把执行结果构造成 tool message 放回上下文，然后再次请求模型。
>
> 直到模型不再产生 tool_call，才得到最终自然语言回复。

DeepSeekProvider 当前确实负责内部 `ToolCall` 与 OpenAI-compatible `tool_calls` JSON 的相互映射。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/src/provider/DeepSeekProvider.cpp))

------

# 5. ⭐ AIClient 和 SimpleAgent 为什么要分开？

这是非常好的架构题。

> AIClient 负责一次模型交互和工具执行能力，但不应该偷偷帮用户无限循环。
>
> Agent 的核心是 orchestration：
>
> ```
> 模型 → 工具 → 模型 → 工具……
> ```
>
> 所以我把循环放到 SimpleAgent。
>
> 这样 AIClient 是基础 SDK primitive，用户可以自己控制什么时候执行工具；如果想开箱即用地运行 ReAct，再使用 SimpleAgent。
>
> 相当于把 transport/model abstraction 和 agent orchestration 解耦。

当前 README 也明确把 `AIClient::executeToolCalls` 与 SimpleAgent 的自动 ReAct loop 区分开。([GitHub](https://github.com/QinMou000/Ai_SDK))

这道答好了，很有“框架设计”味道。

------

# 6. ⭐ 什么是 ReAct？你的 Agent 是怎么实现的？

别背论文定义。

结合项目答：

> 我这里实现的是简化的 ReAct/Tool Loop。
>
> 每轮把 conversation 发给模型。如果模型返回正常回答，循环结束；如果返回 tool calls，就执行这些工具，把 assistant 的 tool call 和 tool result 都追加到 messages，再进入下一轮。
>
> 所以 Agent 本质上并不是一个神秘模块，而是一个不断：
>
> ```
> LLM decision → environment action → observation → LLM decision
> ```
>
> 的状态机。

当前 SimpleAgent 就是这个工作方式，并设置了内部请求轮次上限来防止失控循环。([GitHub](https://github.com/QinMou000/Ai_SDK))

------

# 7. ⭐ SSE 流式输出是怎么实现的？

这个很可能会被 C++ 网络面试官狠狠干。

关键一句：

> **TCP/HTTP chunk ≠ SSE event。**

然后解释：

> 网络层一次收到的数据可能只有半条 SSE，也可能一次包含多个 SSE event，所以不能收到一个 chunk 就直接 JSON parse。
>
> 我的处理方式是维护 buffer，不断 append 网络数据，找到 SSE 的事件边界，也就是连续两个换行；只有得到完整 event block 才交给 SSEParser。
>
> Parser 再提取 `data:`，处理 `[DONE]`、JSON error、content delta、usage、tool call delta 等事件。

你的代码当前确实同时处理 `\n\n` 与 `\r\n\r\n`，先缓存完整 event block 后再 parse，避免半包 JSON 解析失败。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/src/provider/DeepSeekProvider.cpp))

这题实际上和 TCP 粘包/拆包思想完全相通。

------

# 8. ⭐ 为什么流式请求不能直接设置一个普通 30 秒 timeout？

答：

> 非流式请求可以把整个 HTTP request 看成一次有限操作，所以 total timeout 比较合理。
>
> 但 streaming 可能持续几分钟。如果使用 total timeout，模型明明一直正常输出，也可能到 30 秒直接被杀掉。
>
> 所以流式请求应该区分：connect timeout 和 idle timeout
>
> idle timeout 的语义是“多久没有任何新数据才认为连接异常”，另外再限制 max response bytes 防止无限增长。

你的当前 README 已经明确把 streaming timeout 与非流式 timeout 分离。([GitHub](https://github.com/QinMou000/Ai_SDK))

------

# 9. ⭐ 流式 Tool Call 很麻烦在哪里？

这是很加分的一题。

比如模型不是一次返回：

```json
{"city":"重庆"}
```

而可能：

```text
chunk1: {"ci
chunk2: ty":"重
chunk3: 庆"}
```

所以：

> Tool Call 同样需要 aggregation。
>
> 流式阶段可能分别收到 id、function name 和 arguments delta，arguments 本身甚至是被拆开的 JSON 字符串。
>
> 所以不能每收到一个 chunk 就执行工具，而应该按照 tool-call index/id 累积，直到该 tool call 完整后再 parse arguments 并进入 ToolRegistry。

如果能说到这一步，说明你真的理解 streaming Agent。

------

# 10. ⭐ DeepSeek reasoning model + Tool Calling 有什么特殊地方？

你的实现里已经处理：reasoning_content

并且在后续包含工具调用的多轮请求里回传。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/src/provider/DeepSeekProvider.cpp))

可以答：

> reasoning model 做工具调用时，一轮 response 不只是普通 content/tool_calls，还可能存在 reasoning_content。
>
> 如果下一轮只保留 tool call 而丢掉 provider 要求的 reasoning state，就可能破坏模型的多轮工具调用协议。
>
> 所以 Provider 层需要负责保存并按厂商协议重新序列化，而不是让 Agent 层自己猜 DeepSeek 的特殊字段。

然后顺势回到：

> 这也是我为什么需要 Provider abstraction。

形成闭环。

------

# 11. ⭐ ToolRegistry 为什么需要 Registry 模式？

当前结构实际上是：tool name → Tool metadata 和 tool name → handler

并保留注册顺序。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/include/tool/ToolRegistry.h))

答：

> Tool 本身分成两个维度。
>
> 一个是告诉模型的 metadata：name、description、parameters schema；
>
> 一个是真正执行的 C++ callable。
>
> Registry 将它们绑定起来，因此模型只需要返回工具名和参数，Runtime 就可以动态 dispatch 到对应 handler。

再追：

**未知工具怎么办？handler throw 怎么办？**

> 不应该让整个 Agent Runtime 崩溃。
>
> 当前做法是转换成 failed ToolResult，再让上层决定是否把失败 observation 继续反馈给模型。

当前实现就是这个策略。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/include/tool/ToolRegistry.h))

------

# 12. ⭐ ToolRegistry 是线程安全的吗？

这里又是一个“不要硬吹”的地方。

当前实现本身**没有内部 synchronization**，要求调用方在并发注册/执行时保证同步。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/include/tool/ToolRegistry.h))

最好答：

> 当前 ToolRegistry 主要按照初始化阶段注册、运行阶段读取/执行来设计，所以没有在每个操作内部都加锁。
>
> 如果允许 runtime 动态注册和删除工具，同时 Agent 正在执行，就存在并发访问风险。
>
> 一种方案是 `shared_mutex`，查询/执行阶段 shared lock，注册和删除 unique lock。
>
> 另一种更适合 Agent Runtime 的设计是 immutable registry snapshot，配置变更时整体替换，这样 read path 基本无锁。

非常适合 C++ 岗。

------

# 13. ⭐ Agent 让模型执行 Shell 命令，不危险吗？

这是你现在 `agent_runtime` 很有价值的一块。

你可以答：

> 所以我没有把“模型产生 command”直接等价为执行 command，而是在模型和执行环境之间增加 Policy。
>
> 文件读取属于低风险行为，可以自动执行；文件写入、memory 修改属于中风险，可以审批；command execution 属于更高风险，需要限制 workspace、执行时间、输出大小和取消机制。
>
> 同时 plan mode 应保持 read-only，让 Agent 在规划阶段不能直接修改环境。

当前 Runtime 的 README 就描述了 workspace boundary、不同风险等级、approval、plan read-only、command timeout/output/cancel 等机制。([GitHub](https://github.com/QinMou000/Ai_SDK))

这会让你的项目从：

**“套 LLM API”**

一下变成：

**“AI Runtime / Agent Infrastructure”。**

------

# 14. ⭐ 命令超时以后直接杀父进程够吗？

这一题非常 C++/OS。

答案：

> 不够，因为 shell command 可能继续 fork/创建子进程。
>
> 如果只杀父进程，child process 可能成为孤儿继续运行。
>
> 所以真正可靠的 cancellation 要按 process tree 处理。

当前代码在 Windows 侧用了 Job Object 管理进程，在 POSIX 路径则有独立 process handling，并且同时管理 stdout/stderr pipe、timeout、output bytes 和 cancellation。([GitHub](https://github.com/QinMou000/Ai_SDK/blob/master/agent/src/ProcessRunner.cpp))

如果你能讲出：

**process → pipe → non-blocking read → timeout → process tree cleanup**

这个项目对 C++ 后端岗位的含金量会上去很多。

------

# 15. ⭐ 为什么 Agent 要限制 context/token？

答：

> Agent 比普通 Chat 更容易无限增长。
>
> 每轮都会多：
>
> user → assistant tool call → tool result → assistant……
>
> 工具输出尤其可能非常大。如果不限制，最终要么超过模型 context window，要么成本和 latency 不可控。
>
> 因此 runtime 必须有 resource policy：估算 token、限制工具输出、必要时删除最老的完整 tool round，而不能随便砍半条 tool_call/tool_result，否则消息协议会不完整。

当前实现已经有 context token guard、动态 max_tokens，并以完整工具轮次为单位处理历史。([GitHub](https://github.com/QinMou000/Ai_SDK))

------

# 16. ⭐ Trace 为什么不能直接把 Prompt、工具参数全部记录下来？

非常适合 AI 工程面试。

答：

> Observability 和安全其实有冲突。
>
> Prompt 里可能有用户数据，tool parameters 可能含文件路径、command、token甚至 API key。
>
> 所以 Trace 默认更应该保存：
>
> latency、token usage、tool name、状态、错误类型、request id
>
> 这些结构化 metadata，而不是无脑 dump 所有 request/response。

当前项目的 request ledger/trace 也专门避免直接记录 prompt、回答、key、command 和完整 tool parameters。([GitHub](https://github.com/QinMou000/Ai_SDK))

------

# 三、如果我是面试官，我会专门用这 8 个问题判断“是不是你自己写的”

这几个你一定重点练：

| 项目          | 我会突然追问                                                 |
| ------------- | ------------------------------------------------------------ |
| BoostSearcher | **BM25 里的 `k1` 和 `b` 分别控制什么？**                     |
| BoostSearcher | **为什么 UTF-8 编辑距离不能直接操作 `std::string[i]`？**     |
| BoostSearcher | **你的 fuzzy search 为什么是 O(Vmn)，怎么优化？**            |
| BoostSearcher | **你 Singleton 的 double-check 在 C++ 内存模型下真的安全吗？** |
| AI SDK        | **一次完整 Tool Calling 从模型到 C++ handler 再回模型怎么走？** |
| AI SDK        | **为什么 HTTP chunk 不能直接当 SSE event？**                 |
| AI SDK        | **AIClient 和 Agent 为什么必须拆开？**                       |
| AI SDK        | **如果模型调用 `rm -rf`，你的 Runtime 在哪一层阻止它？**     |

你把这 **8 个问题真正弄透**，我基本就很难通过两三个追问把你问穿。

------

# 四、还有一类“项目拷打题”，两个项目都会问

比如我会突然问：

### “这个项目最难的问题是什么？”

Boost 不要答：

> cppjieba 配环境很麻烦。

建议：

> 最开始搜索只依赖简单词频权重，结果排序质量不稳定；后来我发现问题不只是召回，而是 ranking，因此把 title/content term frequency、field length、document frequency 都加入索引，改造成 BM25F 风格排序。同时模糊召回引入后又出现 precision 和性能之间的矛盾，所以最终采用 exact-first、动态编辑距离阈值和 fuzzy weight 控制。

AI_SDK：

> 最复杂的部分不是发送 HTTP 请求，而是流式 Tool Calling。网络 chunk、SSE event、JSON delta 和完整 tool call 是四个不同粒度，需要逐层做 buffering 和 aggregation；然后执行工具以后又要维持正确的多轮消息状态。因此我把 transport、provider、tool registry 和 agent orchestration 分开处理。

这两段非常像一个真正做过项目的人。

------

### “项目有什么缺陷？”

千万不要：

> “目前基本没有明显问题。”

这是送命答案。

Boost：

> 现在比较明显的问题是 fuzzy recall 需要扫描整个词典；索引只支持启动构建，不支持真正的实时增量更新；benchmark 也主要是 search core，没有完整 HTTP P95/P99 和搜索质量指标。这三个是我下一步会重点解决的问题。([GitHub](https://github.com/QinMou000/BoostSearcher/blob/master/engine/src/searcher.cpp))

AI_SDK：

> 当前 Provider 生态还比较有限，ToolRegistry 的并发模型也比较简单，Agent context management 目前主要依赖启发式 token estimation，而不是 tokenizer 精确计算。另外执行外部工具涉及安全边界，所以 Runtime 的 capability isolation 仍然可以继续做得更严格。([GitHub](https://github.com/QinMou000/Ai_SDK))

**主动知道项目缺陷，比假装项目完美更能证明项目是你的。**

------

# 五、从面试价值上，我怎么看这两个项目

如果你应聘 **C++ 后端 / 基础架构 / AI Infra / Agent 工程**，我会这样评价：

**BoostSearcher 更容易证明你的 C++ 基础。**

因为我能追：

```
vector/unordered_map → 倒排索引 → UTF-8 → DP → BM25 → 多线程 → 内存布局 → 性能优化
```

它非常适合传统 C++ 面试。

**Ai_SDK 更容易证明你的方向感和工程能力。**

因为它能追：

```
接口抽象 → HTTP → SSE → JSON → Tool Calling → ReAct → Agent Runtime → 进程管理 → 权限安全 → Context 管理
```

它更贴现在的 AI Infra / Agent 方向。

所以面试时我甚至建议你形成这样一个人物画像：

> **BoostSearcher 证明我有传统 C++ / 数据结构 / 后端基础；Ai_SDK 证明我能把这些能力继续用到 AI Runtime 和 Agent 工程里。**

这两个项目其实是能互相补的。

**现在最值得重点准备的不是再给项目加十个 feature，而是把 BM25、UTF-8 编辑距离、SSE、Tool Calling、ReAct、Agent 安全边界这六块真正讲透。** 它们基本就是这两个项目的“面试攻击面”。