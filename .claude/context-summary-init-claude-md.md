# 上下文摘要：生成仓库 CLAUDE.md

## 任务目标
为当前仓库生成供未来 Claude Code 实例使用的 `CLAUDE.md`，重点记录：
1. 可直接使用的开发命令。
2. 仓库的高层架构与关键集成点。
3. 现有说明文件中真正影响开发判断的信息。

## 已检索资料与用途
- `package.json`
  - 用途：确认可用脚本与运行方式。
  - 结论：只有 `build`、`clean`、`deploy`、`server` 四个脚本，没有 lint/test 脚本。
- `README.md`
  - 用途：确认仓库定位与公开站点信息。
  - 结论：这是个人博客仓库，对外站点为 `https://qinmou000.github.io`。
- `_config.yml`
  - 用途：确认 Hexo 站点配置、内容目录、主题名、分类映射、生成策略。
  - 结论：站点语言为 `zh-Hans`，主题是 `hexo-theme-coder 2`，首页 `per_page: 0`，产物目录为 `public/`。
- `.github/workflows/pages.yml`
  - 用途：确认实际部署链路。
  - 结论：推送到 `main` 后，GitHub Actions 使用 Node 22 执行 `npm install` 和 `npm run build`，随后发布 `public/`。
- `scaffolds/post.md`
  - 用途：确认文章 frontmatter 结构。
  - 结论：默认脚手架包含 `title`、`date`、`tags`。
- `source/404.md`
  - 用途：确认页面内容如何挂接到自定义布局。
  - 结论：404 页面通过 frontmatter 绑定到 `layout: "404"`。
- `themes/hexo-theme-coder 2/_config.yml`
  - 用途：确认主题层配置入口。
  - 结论：站点标题、菜单、头像、默认样式、Valine 开关与密钥都在主题配置里。
- `themes/hexo-theme-coder 2/layout/layout.ejs`
  - 用途：确认页面总布局与全局注入。
  - 结论：统一包裹 `head`、正文 `body`、`footer`，并在全站注入 canvas-nest 脚本。
- `themes/hexo-theme-coder 2/layout/index.ejs`
  - 用途：确认首页内容组织方式。
  - 结论：首页按年份分组遍历 `page.posts` 输出文章列表。
- `themes/hexo-theme-coder 2/layout/post.ejs`
  - 用途：确认文章页渲染方式。
  - 结论：文章页直接输出 `page.content`，评论区是否渲染由 `theme.valine.enable && page.comments` 控制。
- `themes/hexo-theme-coder 2/layout/_partial/head.ejs`
  - 用途：确认 SEO / 样式资源入口。
  - 结论：页面标题、描述、关键词、favicon 都依赖主题配置。
- `themes/hexo-theme-coder 2/layout/_partial/footer.ejs`
  - 用途：确认全局脚本与评论系统注入。
  - 结论：这里向前端注入样式切换状态与 Valine 凭据，并加载 `js/js.js`。
- `themes/hexo-theme-coder 2/source/js/js.js`
  - 用途：确认前端运行时行为。
  - 结论：负责 Valine 初始化、代码高亮、黑白主题切换，主题状态保存在 `localStorage`。
- `themes/hexo-theme-coder 2/source/css/style.styl`
  - 用途：确认样式组织方式。
  - 结论：全局样式通过 `@import` 组合 `_partial/index`、`_partial/post`、`_partial/markdown`。

## 高层架构摘要
这是一个 **Hexo 静态博客仓库**，整体可以分为四层：

1. **站点配置层**
   - 根目录 `_config.yml` 定义站点 URL、语言、永久链接、分类映射、主题选择和生成行为。
2. **内容层**
   - `source/_posts/*.md` 是博客文章源文件。
   - `source/404.md` 这类页面通过 frontmatter 指定特殊布局。
   - `scaffolds/*.md` 定义新内容的默认 frontmatter 模板。
3. **主题展示层**
   - 使用仓库内置主题 `themes/hexo-theme-coder 2`，而不是外部 npm 主题包。
   - EJS 模板负责页面结构，Stylus 负责样式，少量原生 JS 负责交互。
4. **构建与部署层**
   - 本地通过 Hexo CLI 生成 `public/` 静态文件。
   - 远端通过 GitHub Pages 工作流发布 `public/`。

## 关键集成点
- **Hexo → 主题**：根配置的 `theme: hexo-theme-coder 2` 决定渲染入口。
- **主题配置 → 模板/脚本**：主题 `_config.yml` 中的标题、菜单、评论配置会被 EJS 模板和前端脚本直接消费。
- **Markdown → 页面**：文章 Markdown 经 Hexo 渲染后，`post.ejs` 用 `page.content` 直接输出 HTML。
- **GitHub Actions → Pages**：`pages.yml` 是当前实际发布路径；`npm run deploy` 虽然存在，但根配置的 `deploy.type` 为空，默认不可用。

## 已识别的既有模式（至少 3 个）
1. **配置优先模式**
   - 站点级行为改 `_config.yml`，主题展示改 `themes/hexo-theme-coder 2/_config.yml`，尽量不要先改模板。
2. **模板组合模式**
   - `layout.ejs` 提供统一骨架，`index.ejs` / `post.ejs` / `404.ejs` 提供页面主体，`_partial/*.ejs` 提供共享片段。
3. **样式分层模式**
   - `style.styl` 只做聚合，具体页面样式拆到 `_partial/index.styl`、`_partial/post.styl`、`_partial/markdown.styl`。
4. **轻量前端增强模式**
   - 前端交互集中在 `source/js/js.js`，主要处理评论初始化、代码高亮和主题切换，没有复杂前端框架。

## 充分性判断
当前信息已足够支持编写一个高质量的仓库级 `CLAUDE.md`：
- 命令来源明确：`package.json` 与 CI workflow。
- 架构来源明确：站点配置、主题模板、样式和脚本入口都已确认。
- 没有发现 Cursor 规则或 Copilot 指令文件。
- 没有发现现有仓库级 `CLAUDE.md`，因此本次应直接新建。