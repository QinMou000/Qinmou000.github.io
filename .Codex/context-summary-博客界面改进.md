# 博客界面改进上下文摘要

## 任务目标
- 修复移动端首页分类栏与文章列表并排导致正文区域过窄的问题。
- 降低首页一次展示 139 篇文章造成的浏览压力。
- 改善中文正文阅读体验，并消除文章页重复标题。
- 改进主题切换、导航、目录和页脚信息。

## 已分析的既有实现
1. `themes/hexo-theme-coder 2/layout/index.ejs`
   - 使用 `data-category-filter`、`data-home-post` 和 `data-home-year-group` 完成首页分类筛选。
   - 可继续扩展同一数据属性协议实现渐进展示，无需引入新框架。
2. `themes/hexo-theme-coder 2/source/js/js.js`
   - 使用 `localStorage` 保存黑白主题状态。
   - 已集中处理代码高亮和文章目录，适合继续承载全站交互。
3. `themes/hexo-theme-coder 2/layout/post.ejs` 与 `_partial/post.styl`
   - 页面标题和正文内容职责清晰，目录由客户端根据正文标题生成。
   - 重复标题可在模板输出前处理首个一级标题，目录可根据有效标题数决定是否显示。
4. `themes/hexo-theme-coder 2/layout/categories.ejs`
   - 分类页沿用头像、导航、文章列表等主题组件。
   - 本次保持其数据组织不变，仅让全局字体、导航和页脚改进自然覆盖。

## 依赖与集成点
- 输入：Hexo 的 `page.posts`、`page.content`、`page.title`、主题配置和文章分类数据。
- 输出：`public/` 下的静态 HTML、CSS 和 JavaScript。
- 构建：Hexo 7.3.0，EJS 模板，Stylus 样式。
- 运行时：浏览器原生 DOM API、IntersectionObserver、localStorage，以及仓库已有 jQuery。
- 发布：GitHub Pages 工作流使用 Node 22 执行 `npm install` 和 `npm run build`。

## 项目约定
- 模板类名使用连字符命名，例如 `home-post-link`、`post-toc-nav`。
- 运行时钩子优先使用 `data-*` 属性。
- 响应式断点集中在对应页面的 Stylus 分文件。
- 不新增依赖，不修改发布流程，不编辑生成目录 `public/`。

## 充分性检查
- 已确认首页、分类页、文章页三种展示模式。
- 已确认主题切换、目录生成和首页筛选的现有协议。
- 已确认无测试框架，最小自动验证为 `npm run build`，并补充本地浏览器桌面端与移动端检查。
- 当前信息足以实施，未发现需要外部资料或新增工具的部分。

