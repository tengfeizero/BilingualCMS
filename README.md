# CMS 内容管理系统 — 技术方案

基于 **Next.js + SQLite** 的自建内容管理系统，前后端一体，数据存储于单文件 SQLite 数据库，部署简单、零外部依赖。

---

## 1. 项目简介

- **定位**：轻量级、可扩展的内容管理系统，覆盖内容发布、分类、媒体、用户权限、SEO 等核心能力。
- **技术栈**：Next.js (App Router) + TypeScript + SQLite + Tailwind CSS
- **核心原则**：
  - 单进程、单文件数据库，开箱即用，无需额外安装 MySQL/Redis
  - 前后端一体（Server Actions + Route Handlers），也可对外暴露 REST API
  - 后台管理界面与前台展示共用一套代码，通过路由 `/admin` 隔离

---

## 2. 技术选型

| 类别 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | 服务端渲染 + 路由 + API |
| 语言 | TypeScript | 类型安全 |
| 数据库 | SQLite | 单文件数据库 |
| ORM | Drizzle ORM + better-sqlite3 | 类型安全的 SQL 生成，同步 API 简单高效 |
| 认证 | jose JWT + 会话 Cookie | 自研轻量会话（无外部依赖） |
| 密码 | bcryptjs | 密码哈希 |
| 表单校验 | Zod | 请求/表单数据校验 |
| 富文本 | TipTap | 所见即所得编辑器 |
| 媒体处理 | 本地 uploads 目录 | 图片入库登记、按需缩略图 |
| 样式 | Tailwind CSS | UI 构建 |
| 搜索 | SQLite FTS5（trigram） | 中文全文搜索 |
| 部署 | Node.js 单进程 + PM2 / Docker | 单容器部署 |

---

## 3. 功能清单

### 3.1 内容管理
- 内容 CRUD：创建 / 编辑 / 发布 / 下线 / 删除
- 内容类型：文章（Article）、页面（Page），支持自定义字段扩展
- 草稿与状态机：`草稿 → 待审核 → 已发布 → 已归档`
- 定时发布
- 历史版本记录与回滚
- 富文本编辑（TipTap）+ Markdown 兼容
- 批量操作：批量发布 / 删除 / 移动分类

### 3.2 分类与组织
- 树形无限层级分类
- 标签体系
- 置顶 / 排序 / 权重

### 3.3 媒体库
- 图片 / 文件上传，自动重命名防冲突
- 图片压缩与缩略图生成
- 媒体分类与引用统计

### 3.4 用户与权限
- 用户注册（可选开启）/ 登录 / 登出
- 角色权限（RBAC）：`超级管理员 / 管理员 / 编辑 / 作者 / 访客`
- 细粒度权限：`post:create`、`post:publish`、`media:manage` 等
- 审核流：作者提交 → 编辑审核 → 发布
- 操作日志

### 3.5 前台展示
- 列表页：首页、分类页、标签页、文章详情页、独立页面
- 站内全文搜索（FTS5）
- 分页、按分类/标签/时间筛选
- 自定义导航菜单

### 3.6 SEO 与性能
- 自定义 URL 别名（slug）
- meta 标题 / 描述 / OG 标签
- 自动生成 `sitemap.xml`、`robots.txt`
- 页面缓存（Next.js ISR / 手动缓存层）
- 友好的 404 页面

### 3.7 后台管理界面
- 仪表盘：内容统计、最近动态、待审核数量
- 系统设置：站点名称、描述、Logo、评论开关
- 数据备份：SQLite 文件导出 / 恢复

### 3.8 API 与扩展
- RESTful API：对外输出内容数据，支持前后端分离场景
- 可扩展的字段系统：内容模型可配置自定义字段

---

## 4. 架构设计

```
┌─────────────────────────────────────────────┐
│                 Next.js 应用                 │
│                                             │
│  前台页面 (/blog/*)   后台管理 (/admin/*)     │
│      │                    │                 │
│      ├── Server Components / Server Actions │
│      │                    │                 │
│      ├────── Route Handlers (/api/*) ───────┤
│      │                    │                 │
│      └──────── Service 层（业务逻辑）────────┘
│                        │                    │
│              ┌─────────┴─────────┐          │
│           Drizzle ORM      上传/媒体处理      │
│              │                   │          │
│        ┌─────┴─────┐       ┌─────┴─────┐    │
│      SQLite 数据库  │       │ uploads/   │    │
│      (cms.db)      │       │ 文件目录    │    │
│        └───────────┘       └───────────┘    │
└─────────────────────────────────────────────┘
```

**关键设计决策**
- **数据层隔离**：所有数据库操作集中在 `src/db` + `src/services`，页面和 API 不直接拼 SQL。
- **服务端为主**：前台用 Server Components 直接读库渲染（SSR/SSG），后台用 Server Actions 处理写操作。
- **权限校验**：写操作统一经过 `requirePermission()` 中间件，防止越权。
- **slug 唯一**：内容与分类的 URL 别名全站唯一，避免路由冲突。

---

## 5. 数据模型设计（SQLite）

```sql
-- 用户表
CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,             -- bcrypt 哈希
  role        TEXT NOT NULL DEFAULT 'author',
  avatar      TEXT,
  bio         TEXT,
  status      TEXT NOT NULL DEFAULT 'active',   -- active / disabled
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 角色表（RBAC）
CREATE TABLE roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,      -- super_admin / admin / editor / author
  permissions TEXT NOT NULL DEFAULT '[]' -- JSON 数组，如 ["post:create","post:publish"]
);

-- 分类表（树形）
CREATE TABLE categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 标签表
CREATE TABLE tags (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE
);

-- 文章表
CREATE TABLE posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  content      TEXT NOT NULL DEFAULT '',          -- 富文本 HTML / Markdown
  excerpt      TEXT,                              -- 摘要
  cover_image  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',     -- draft / pending / published / archived
  type         TEXT NOT NULL DEFAULT 'post',      -- post / page
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id    INTEGER NOT NULL REFERENCES users(id),
  is_pinned    INTEGER NOT NULL DEFAULT 0,        -- 置顶
  view_count   INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published_at);

-- 文章-标签关联表
CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 文章版本历史
CREATE TABLE post_versions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id   INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  content   TEXT NOT NULL,
  editor_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 媒体文件
CREATE TABLE media (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  filename     TEXT NOT NULL,             -- 存储文件名（防冲突重命名）
  original_name TEXT NOT NULL,
  url          TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  size         INTEGER NOT NULL,
  width        INTEGER,
  height       INTEGER,
  thumb_url    TEXT,                      -- 缩略图
  category     TEXT,                      -- image / file / video
  uploader_id  INTEGER REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 操作日志
CREATE TABLE audit_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id),
  action     TEXT NOT NULL,               -- post.create / post.publish / user.delete ...
  target_type TEXT,
  target_id   INTEGER,
  detail     TEXT,
  ip         TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 站点设置（KV 存储）
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL                -- JSON 序列化
);

-- 全文搜索（FTS5 虚拟表，同步 posts 数据）
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title, content, excerpt,
  content='posts', content_rowid='id'
);
```

---

## 6. API 设计

### 6.1 对外公开 API（前台）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 文章列表（分页、按分类/标签/关键词过滤） |
| GET | `/api/posts/:slug` | 文章详情 |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/tags` | 标签列表 |
| GET | `/api/search?q=xxx` | 全文搜索 |
| GET | `/api/media/:id` | 媒体信息 |

### 6.2 后台管理 API（需认证 + 权限）

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/admin/posts` | `post:create` | 创建文章 |
| PUT | `/api/admin/posts/:id` | `post:update` | 更新文章 |
| DELETE | `/api/admin/posts/:id` | `post:delete` | 删除文章 |
| POST | `/api/admin/posts/:id/publish` | `post:publish` | 发布/下线 |
| POST | `/api/admin/posts/:id/version` | `post:update` | 保存版本 / 回滚 |
| POST | `/api/admin/media` | `media:upload` | 上传文件 |
| DELETE | `/api/admin/media/:id` | `media:delete` | 删除媒体 |
| POST | `/api/admin/categories` | `category:manage` | 分类增删改 |
| GET | `/api/admin/users` | `user:manage` | 用户列表 |
| POST | `/api/admin/users` | `user:manage` | 创建用户 / 分配角色 |
| GET/PUT | `/api/admin/settings` | `setting:manage` | 站点设置 |
| GET | `/api/admin/dashboard` | 登录用户 | 仪表盘统计数据 |

> 后台写操作优先使用 **Server Actions**（更安全、减少客户端代码），API 路由作为等价补充对外暴露。

---

## 7. 项目目录结构

```
CMS/
├── README.md
├── package.json
├── next.config.ts
├── drizzle.config.ts            # Drizzle ORM 配置
├── tsconfig.json
├── public/
├── uploads/                     # 上传的媒体文件（gitignore）
├── data/
│   └── cms.db                   # SQLite 数据库文件（gitignore）
└── src/
    ├── app/
    │   ├── layout.tsx           # 根布局
    │   ├── page.tsx             # 前台首页
    │   ├── blog/                # 前台内容页
    │   │   ├── page.tsx         # 文章列表
    │   │   └── [slug]/page.tsx  # 文章详情
    │   ├── category/[slug]/page.tsx
    │   ├── tag/[slug]/page.tsx
    │   ├── search/page.tsx      # 搜索页
    │   ├── sitemap.tsx
    │   ├── robots.ts
    │   ├── api/                 # REST API
    │   │   ├── posts/route.ts
    │   │   ├── search/route.ts
    │   │   └── admin/...
    │   └── admin/               # 后台管理
    │       ├── layout.tsx       # 后台布局 + 登录校验
    │       ├── login/page.tsx
    │       ├── dashboard/page.tsx
    │       ├── posts/page.tsx
    │       ├── posts/new/page.tsx
    │       ├── posts/[id]/page.tsx
    │       ├── categories/page.tsx
    │       ├── media/page.tsx
    │       ├── users/page.tsx
    │       └── settings/page.tsx
    ├── components/              # 通用组件
    │   ├── ui/                  # Button、Input、Modal 等基础组件
    │   ├── admin/               # 后台组件
    │   └── front/               # 前台组件（Header、Footer、PostCard 等）
    ├── db/
    │   ├── index.ts             # 数据库连接 + schema 导出
    │   └── schema.ts            # Drizzle 表定义
    ├── services/                # 业务逻辑层
    │   ├── post.service.ts
    │   ├── category.service.ts
    │   ├── media.service.ts
    │   ├── auth.service.ts
    │   └── setting.service.ts
    ├── lib/
    │   ├── auth.ts              # Auth.js 配置
    │   ├── permissions.ts       # 权限校验工具
    │   ├── slugify.ts           # URL 别名生成
    │   ├── validate.ts          # Zod 校验规则
    │   └── utils.ts
    ├── middleware.ts            # 路由守卫（可选）
    └── types/                   # 全局类型定义
```

---

## 8. 开发路线图

### 阶段一：基础设施（已完成）
- [x] 初始化 Next.js + TypeScript + Tailwind 项目
- [x] 集成 Drizzle ORM + SQLite，初始化数据库与全部表结构
- [x] 建立 `src/db`、`src/services`、`src/lib` 基础架构

### 阶段二：认证与权限（已完成）
- [x] JWT 会话认证，实现登录 / 登出 / Session
- [x] 角色权限系统（RBAC）与 `requirePermission()` 守卫
- [x] 后台管理布局与登录保护

### 阶段三：内容管理核心（已完成）
- [x] 文章 CRUD + 草稿状态机（draft / pending / published / archived）
- [x] 富文本编辑器（TipTap）集成
- [x] 分类 / 标签管理
- [x] 前台列表页、详情页渲染（含中文 slug 支持）

### 阶段四：媒体与搜索（已完成）
- [x] 媒体库上传 / 删除（缩略图字段预留）
- [x] SQLite FTS5（trigram）全文搜索，支持中文
- [x] 站点设置模块

### 阶段五：完善与打磨（进行中）
- [x] 操作日志、文章版本历史与回滚
- [x] 仪表盘统计
- [x] SEO（sitemap、robots、meta 标签）
- [ ] 定时发布（需 `scheduled_at` 字段 + 定时任务，待开发）
- [ ] 批量操作、后台 UX 优化

### 阶段六：部署（待开发）
- [ ] 生产环境构建与优化
- [ ] Docker 镜像（含 SQLite 持久化卷）
- [ ] 数据备份脚本

---

## 9. 技术要点与注意事项

1. **SQLite 并发**：better-sqlite3 为同步 API，写入操作在 Node.js 单线程下安全；高并发写入场景建议开启 WAL 模式。
2. **上传文件**：`uploads/` 目录需挂载为持久化卷（Docker 部署时），数据库文件同理。
3. **slug 冲突**：创建内容时校验 slug 唯一性，冲突自动追加后缀。
4. **权限前置**：后台每个 Server Action / Route Handler 必须调用 `requirePermission`，不可只做前端隐藏。
5. **XSS 防护**：富文本内容展示时进行消毒处理（DOMPurify 服务端版），防止存储型 XSS。
6. **备份策略**：定期 `cp data/cms.db` 并配合 `VACUUM INTO` 生成一致性快照。

---

## 10. 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:generate
npm run db:migrate

# 创建初始管理员账号
npm run seed

# 启动开发服务器
npm run dev
# 访问前台 http://localhost:3000
# 访问后台 http://localhost:3000/admin
```

---

> 本文档为整体技术方案，具体实现将按「开发路线图」逐步落地。如有调整（技术选型、数据字段、功能范围），优先更新本 README 保持一致。
