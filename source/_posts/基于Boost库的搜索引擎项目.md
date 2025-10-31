# 基于Boost库的搜索引擎项目



```C++
std::string GetAbstract(const std::string &content, const std::string &word)
{
    // 在当前内容中找到 word 位置
    long long pos = content.find(word);
    if (pos == std::string::npos)
        return "None";
    // 确定摘要范围
    long long start = 0;
    long long end = content.size() - 1; // 严谨一点~

    if (pos - 50 > 0) // 控制长度
        start = pos - 50;
    if (pos + 100 < end)
        end = pos + 100;

    // std::cout << pos << " " << start << " " << end << std::endl;
    if (start > end)
        return "start > end ? ";

    // 切分字符串
    return content.substr(start, end - start);
}
```

```C++
std::string GetAbstract(const std::string &content, const std::string &word)
{
    // 在当前内容中找到 word 位置
    // long long pos = content.find(word);
    // if (pos == std::string::npos)
    //     return "None";

    auto it = std::search(content.begin(), content.end(), word.begin(), word.end(), [](char x, char y)
                          { return std::tolower(x) == std::tolower(y); });
    if (it == content.end())
        return "None";

    long long pos = std::distance(content.begin(), it);

    // 确定摘要范围
    long long start = 0;
    long long end = content.size() - 1; // 严谨一点~

    if (pos - 50 > 0) // 控制长度
        start = pos - 50;
    if (pos + 100 < end)
        end = pos + 100;

    // std::cout << pos << " " << start << " " << end << std::endl;
    if (start > end)
        return "start > end ? ";

    // 切分字符串
    return content.substr(start, end - start);
}
```

![image-20250927133527959](C:\Users\wq\AppData\Roaming\Typora\typora-user-images\image-20250927133527959.png)

![image-20250927133556178](C:\Users\wq\AppData\Roaming\Typora\typora-user-images\image-20250927133556178.png)

```C++
      // 用户给我一个关键字 我返回一个 json 串
        void Search(const std::string &query, std::string *json)
        {
            // 对关键字进行切词
            std::vector<std::string> words;
            Jieba_util::CutString(query, &words);

            struct invertedElem_to_merge
            {
                uint64_t doc_id;                // 文档id
                int sum_weight;                 // 这个文档在本次搜索中占的总权值
                std::vector<std::string> Words; // 本次搜索被切分的词中和文档内容相关的词
            };

            // 根据切词结果 到索引里面去找
            // ns_index::InvertedList inverted_list_all;

            std::unordered_map<uint64_t, invertedElem_to_merge> map; // 避免多个词搜索到同一个文档的情况

            for (std::string word : words)
            {
                boost::to_lower(word);                                                // 转小写
                ns_index::InvertedList *inverted_list = index->GetInvertedList(word); // 拿到倒排拉链
                if (inverted_list == nullptr)
                    continue;
                for (auto &item : *inverted_list)
                {
                    // 将拿到的倒排拉链中的元素插入到hash里面去重
                    auto &Second = map[item.doc_id]; // 需要加引用 不加引用并不会改变map里面的值
                    Second.doc_id = item.doc_id;
                    Second.sum_weight += item.weight;  // 将所有文档的权值累加
                    Second.Words.emplace_back(item.word); // 依旧减少拷贝
                }

                // inverted_list_all.insert(inverted_list_all.end(), inverted_list->begin(), inverted_list->end()); // 将找到的倒排拉链里面的元素都插进新的拉链里面
            }
            ........
  
```







- 建立整站搜索
- 设计定时更新，爬取网页内容
- 自己实现http，log，json模块
- 用户多了后，可以添加竞价排名
- 添加热词统计，智能显示搜索关键字（字典树，优先级队列）
- 设置登录注册服务
