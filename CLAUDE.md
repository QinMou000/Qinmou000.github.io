# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库定位
- 这是一个 **Hexo 静态博客仓库**，内容源文件在 `source/`，构建产物输出到 `public/`。
- 站点使用仓库内维护的本地主题 `themes/hexo-theme-coder 2/`，不要假设主题逻辑来自 npm 包。
- 实际发布链路是 GitHub Pages 工作流，而不是本地 `hexo deploy`。

## 常用命令
### 环境与构建
- 安装依赖：`npm install`
- 本地预览：`npm run server`
- 生成静态文件：`npm run build`
- 清理缓存与产物：`npm run clean`

### 内容开发
- 新建文章：`npx hexo new post "文章标题"`
- 文章源文件目录：`source/_posts/`
- 普通页面通过 `source/*.md` 的 frontmatter 绑定布局，例如 `source/404.md`

### 部署与验证
- `npm run deploy` 已在 `package.json` 中声明，但当前 `_config.yml` 的 `deploy.type` 为空；默认不要把它当成可用发布路径。
- 仓库 **没有配置 lint 脚本**。
- 仓库 **没有配置测试框架，也没有单测/单文件测试命令**；当前最小可重复验证是 `npm run build`。
- CI 与线上发布使用 `.github/workflows/pages.yml`：Node 22 → `npm install` → `npm run build` → 上传 `public/`。

## 高层架构
### 1. 站点配置层
- 根配置在 `_config.yml`。
- 这里定义站点 URL、永久链接、语言、分类映射、首页分页策略，以及当前主题名 `hexo-theme-coder 2`。
- 如果修改站点级行为，优先先看这里，而不是直接改模板。

### 2. 内容层
- 博客文章位于 `source/_posts/*.md`。
- 特殊页面位于 `source/` 根下，通过 frontmatter 选择布局；例如 `source/404.md` 使用 `layout: "404"`。
- 新文章默认 frontmatter 来自 `scaffolds/post.md`。

### 3. 主题展示层
本仓库的主要前端逻辑集中在 `themes/hexo-theme-coder 2/`：

- `layout/layout.ejs`
  - 全站总布局，统一包裹 `<head>`、页面主体和 footer。
  - 在页面底部全局注入 canvas-nest 背景脚本。
- `layout/index.ejs`
  - 首页按年份遍历 `page.posts` 输出文章列表。
- `layout/post.ejs`
  - 文章页直接渲染 `page.content`。
  - 评论区是否出现由 `theme.valine.enable && page.comments` 控制。
- `layout/404.ejs`
  - 404 页面模板，对应 `source/404.md`。
- `layout/_partial/head.ejs`
  - 从主题配置读取标题、描述、关键词、favicon，并加载 CSS 资源。
- `layout/_partial/footer.ejs`
  - 注入样式切换状态、Valine 配置和全站 JS 资源。

### 4. 样式与前端脚本层
- `source/css/style.styl` 是样式聚合入口，继续拆分到 `_partial/index.styl`、`_partial/post.styl`、`_partial/markdown.styl`。
- `source/js/js.js` 负责三个运行时行为：
  - Valine 评论初始化
  - highlight.js 代码高亮
  - 黑/白主题切换（状态存到 `localStorage`）

## 常见修改落点
- 改站点 URL、permalink、分类映射、生成策略：`_config.yml`
- 改标题、菜单、头像、默认配色、评论开关：`themes/hexo-theme-coder 2/_config.yml`
- 改首页结构：`themes/hexo-theme-coder 2/layout/index.ejs`
- 改文章页结构：`themes/hexo-theme-coder 2/layout/post.ejs`
- 改全局头尾或资源引入：`themes/hexo-theme-coder 2/layout/_partial/*.ejs`
- 改视觉样式：`themes/hexo-theme-coder 2/source/css/**/*.styl`
- 改前端交互：`themes/hexo-theme-coder 2/source/js/*.js`
- 改文章内容：`source/_posts/*.md`

## 需要注意的仓库事实
- 主题目录名包含空格：`themes/hexo-theme-coder 2/`。在 shell 命令里始终为路径加引号。
- `public/` 和 `node_modules/` 都是生成/安装产物，已被 `.gitignore` 忽略。
- 主题里保留了 `layout/search.ejs` 和 `source/js/search.js`，但 `search.ejs` 当前只显示“搜索功能已移除”，不要假设仓库仍有可用搜索功能。
- 评论系统配置在主题 `_config.yml`，并通过 footer 模板注入前端；改评论相关逻辑时同时检查模板和脚本。