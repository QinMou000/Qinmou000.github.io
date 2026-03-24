# 上下文摘要：按文章 categories 分类展示

## 任务目标
为站点补一个可访问的分类入口页，按每篇文章 frontmatter 中的 `categories` 路径分组展示文章，并提供到对应分类归档页的入口。

## 已检索资料与用途
- `_config.yml`
  - 用途：确认 `category_dir`、`category_map` 与分类路径规则。
  - 结论：分类目录前缀为 `categories`，多级分类会生成层级路径，如 `算法 -> LeetCode` 映射到 `categories/algorithm/leetcode/`。
- `themes/hexo-theme-coder 2/layout/index.ejs`
  - 用途：复用首页文章列表结构与站点头部布局。
  - 结论：首页使用 logo + 导航 + 年份标题 + `.list` 文章行的模式，适合复用到分类页。
- `themes/hexo-theme-coder 2/layout/_partial/nav.ejs`
  - 用途：确认导航入口来源。
  - 结论：导航完全由主题 `_config.yml` 的 `menu` 驱动，新增分类入口应改主题配置而不是硬编码模板。
- `themes/hexo-theme-coder 2/source/css/_partial/index.styl`
  - 用途：确认首页列表与标题样式来源。
  - 结论：`.titlex`、`.list`、`.postname`、`.posttime` 已可直接复用，只需补少量分类页样式。
- `public/categories/essay/index.html`
  - 用途：确认当前分类归档页表现。
  - 结论：现有分类归档页会复用首页模板，只显示某个分类下的文章列表，但缺少 `/categories/` 总入口页。
- `source/_posts/LeetCode_1304.和为零的 N 个不同整数.md`
  - 用途：确认文章 `categories` 写法。
  - 结论：当前文章使用 YAML 数组表示层级分类，如 `算法 -> LeetCode`。
- `source/_posts/数据结构_顺序表基本操作代码：.md`
  - 用途：确认另一组多级分类样例。
  - 结论：存在 `算法 -> 数据结构` 这类并列子分类。
- `source/_posts/2026.3.16随笔：爽的前提是你得足够痛苦.md`
  - 用途：确认单级分类样例。
  - 结论：存在单级分类 `随笔`，分类页需要同时兼容单级与多级路径。

## 已识别的既有模式（至少 3 个）
1. **首页列表复用模式**
   - `layout/index.ejs` 通过 `.titlex + .list` 展示文章，可直接复用到分类页，避免重复造轮子。
2. **导航配置驱动模式**
   - `layout/_partial/nav.ejs` 只消费 `theme.menu`，因此分类入口应通过主题配置注入。
3. **Hexo 层级分类模式**
   - 文章 frontmatter 的 `categories` 数组表示层级路径；Hexo 已生成各分类归档页，但没有总览入口。
4. **样式局部补充模式**
   - 首页通用样式集中在 `_partial/index.styl`，新页面应优先补充局部样式，而不是新建独立样式文件。

## 方案选择
- **为什么用这个方案**：仓库已经有分类归档页生成能力，缺的是统一入口和按文章 `categories` 路径聚合的展示页面；直接新增一个分类页模板和入口最小、最贴合现有结构。
- **优势**：改动小、复用现有主题结构、无需引入插件、能直接链接到 Hexo 已生成的分类归档页。
- **劣势和风险**：分类分组逻辑写在 EJS 模板里，可读性一般；若未来 frontmatter 改成更复杂的多分类写法，需要再调整分组规则。

## 关键风险点
- **并发问题**：无。
- **边界条件**：需要同时兼容单级分类和多级分类路径；链接应指向分类链路的最后一级路径。
- **性能瓶颈**：分类页会遍历全站文章，但博客规模小，可接受。
- **安全考虑**：模板只消费 Hexo 生成的站内数据，不引入外部输入。