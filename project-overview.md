# wrCBDjdh 个人博客 — 项目文档

## 概述

基于 **Next.js 14 (App Router)** 构建的全栈个人博客系统，集成了文章发布、评论互动、友情链接管理、用户认证等完整功能模块。采用 **Neon Serverless PostgreSQL** 作为数据库，**Prisma** 作为 ORM，部署在 **Vercel** 平台，支持 Docker 容器化运行。

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2.5 | React 框架 (App Router) |
| React | 18.3.1 | UI 库 |
| TypeScript | 5.5.4 | 类型安全 |
| Tailwind CSS | 3.4.7 | 原子化 CSS 框架 |
| react-markdown | 9.0.1 | Markdown 文章渲染 |
| remark-gfm | 4.0.0 | GFM 扩展 (表格/删除线等) |
| date-fns | 3.6.0 | 日期格式化 |
| react-hot-toast | 2.4.1 | 交互提示组件 |
| clsx | 2.1.1 | 条件 class 拼接 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js API Routes | 14.2.5 | 服务端 API |
| Prisma | 5.17.0 | ORM / 数据库操作 |
| PostgreSQL (Neon) | — | 数据库 (Serverless) |
| NextAuth.js | 4.24.7 | 身份认证 (Credentials + JWT) |
| bcryptjs | 2.4.3 | 密码哈希 |

### 存储 & 部署

| 服务 | 用途 |
|------|------|
| Neon (postgresql) | 数据库托管 |
| imgbb | 图片托管 (免费图床) |
| AWS S3 SDK | S3 兼容存储 (R2) |
| Vercel | 前端部署 |
| Docker (Alpine) | 容器化部署 |

---

## 项目结构

```
personal-blog/
├── prisma/
│   ├── schema.prisma       # 数据库模型定义 (User, Post, Comment, Like, RateLimit, FriendLink, ChatMessage)
│   ├── seed.ts             # 管理员账号初始化脚本
│   └── dev.db              # 开发环境 SQLite 数据库
│
├── src/
│   ├── app/                # Next.js App Router 页面 & API
│   │   ├── page.tsx        # 首页 — 个人资料、最近文章、统计数据、时钟
│   │   ├── layout.tsx      # 全局布局 — Header + Footer + Session 提供
│   │   ├── globals.css     # 全局样式、Tailwind、Prose 排版
│   │   ├── articles/       # 文章列表 ([id]/page.tsx — 文章详情)
│   │   ├── admin/          # 管理后台 (仪表盘、文章 CRUD、友链管理、登录)
│   │   ├── account/        # 账号设置 (昵称、头像、密码修改)
│   │   ├── friends/        # 友情链接展示页
│   │   ├── login/          # 用户登录
│   │   ├── register/       # 用户注册
│   │   └── api/            # API 路由 (auth, posts, comments, likes, upload, account, admin, friendlinks, chat, init, user)
│   │
│   ├── components/         # 共享组件
│   │   ├── Header.tsx      # 顶部导航栏 (响应式)
│   │   ├── Footer.tsx      # 底部 (GitHub/Email/Bilibili 链接)
│   │   ├── PostCard.tsx    # 文章卡片 (封面、标题、摘要、统计数据)
│   │   ├── Comment.tsx     # 评论区组件
│   │   ├── CommentForm.tsx # 评论表单
│   │   ├── LikeButton.tsx  # 点赞按钮 (支持登录/未登录状态)
│   │   ├── Clock.tsx       # 实时时钟组件
│   │   ├── Quote.tsx       # 首页名言组件
│   │   ├── Icons.tsx       # SVG 图标集 (GitHub, Email, Bilibili)
│   │   ├── ImageUploader.tsx   # 图片上传 (imgbb)
│   │   ├── FriendLinkAvatar.tsx # 友链头像
│   │   └── SessionProvider.tsx  # NextAuth Session 上下文
│   │
│   ├── lib/
│   │   ├── prisma.ts       # Prisma 客户端单例 (全局缓存)
│   │   ├── auth.ts         # NextAuth 配置 (Credentials 登录、速率限制、JWT 回调)
│   │   └── r2.ts           # imgbb 文件上传封装
│   │
│   ├── types/
│   │   └── index.ts        # 类型声明 (next-auth 扩展、Post, Product, Comment)
│   │
│   └── middleware.ts       # CSRF 保护 + 管理后台鉴权中间件
│
├── public/
│   ├── favicon.png
│   └── avatars/            # 本地头像资源
│
├── Dockerfile              # 多阶段 Docker 构建 (node:20-alpine)
├── next.config.js          # Next.js 配置 (图片域名、安全头、CSP、跨域隔离)
├── tailwind.config.ts      # Tailwind 主题扩展 (颜色、字体、动画)
├── tsconfig.json           # TypeScript 配置 (路径别名 @/ → ./src/)
├── postcss.config.js       # PostCSS 配置
└── .env.example            # 环境变量模板
```

---

## 数据库模型

### User (用户)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| email | String (unique) | 邮箱 / 登录名 |
| password | String | bcrypt 哈希密码 |
| name | String? | 昵称 |
| role | String (default: "user") | 角色 (admin/user) |
| avatar | String? | 头像 URL |
| bio | String? | 个人简介 |
| github | String? | GitHub 链接 |
| twitter | String? | Twitter 链接 |
| bilibili | String? | Bilibili 链接 |
| isVerified | Boolean | 是否验证 |
| createdAt | DateTime | 创建时间 |

### Post (文章)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| title | String | 标题 |
| content | String | Markdown 正文 |
| summary | String? | 摘要 |
| coverImage | String? | 封面图 |
| published | Boolean (default: true) | 发布状态 |
| viewCount | Int (default: 0) | 阅读量 |
| authorId | String → User | 作者外键 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Comment (评论)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| content | String | 评论内容 |
| nickname | String? | 游客昵称 |
| postId | String? → Post | 所属文章 |
| userId | String? → User | 登录用户 |
| createdAt | DateTime | 创建时间 |

### Like (点赞)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| postId | String? → Post | 文章 |
| userId | String? → User | 用户 |
| createdAt | DateTime | 创建时间 |

唯一约束: `[postId, userId]` — 每用户每篇文章只能点赞一次

### RateLimit (速率限制)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| identifier | String (unique) | 标识 (邮箱/IP) |
| count | Int | 尝试次数 |
| firstAttempt | BigInt | 首次尝试时间戳 |
| expiresAt | DateTime | 锁定过期时间 |

### FriendLink (友情链接)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String | 网站名称 |
| url | String | 网站 URL |
| description | String? | 描述 |
| avatar | String? | 头像 |
| order | Int (default: 0) | 排序权重 |
| isActive | Boolean | 是否启用 |
| createdAt | DateTime | 创建时间 |

---

## 核心功能

### 1. 文章系统
- Markdown 编写 (支持 GFM 语法扩展)
- 封面图、摘要、阅读量统计
- 点赞 + 评论互动
- 管理后台 CRUD (新建/编辑/删除/发布/草稿)
- imgbb 图片上传集成 (支持拖拽上传)

### 2. 用户认证
- Credentials 登录 (邮箱 + 密码)
- JWT Session 策略 (30 天有效期)
- bcrypt 密码加密存储
- 速率限制: 5 次尝试 / 15 分钟窗口, 超限封禁 30 分钟
- 管理员种子脚本 (`prisma/seed.ts`)

### 3. 安全防护
- **CSP 内容安全策略**: 限制脚本/样式/图片/字体来源
- **HSTS**: 强制 HTTPS (1 年, 包含子域名)
- **CSRF 保护**: 中间件验证 Origin/Referer 头, 支持 ALLOWED_ORIGINS 白名单
- **安全头**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Permissions-Policy
- **跨域隔离**: Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy
- **API body 限制**: 10MB (Server Actions)

### 4. 友情链接
- 后台添加/排序/管理
- 前端展示 (网格布局, 头像 + 描述)

### 5. 响应式设计
- 移动端自适应 (汉堡菜单)
- Tailwind CSS 响应式断点
- 卡片网格 1/2/3 列自适应

---

## 环境变量

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:密码@ep-xxx.aws.neon.tech:5432/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="运行 node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" 生成"
NEXTAUTH_URL="https://你的vercel域名.vercel.app"

# imgbb (免费图床)
IMGBB_API_KEY="从 https://imgbb.com 获取"

# Init Secret
INIT_SECRET="运行 node -e \"console.log(require('crypto').randomBytes(16).toString('hex'))\" 生成"

# Admin Account
ADMIN_EMAIL="你的邮箱"
ADMIN_PASSWORD="你的密码"
```

---

## 运行方式

```bash
# 开发
npm run dev                # 启动开发服务器 (localhost:3000)

# 数据库
npm run db:push            # 推送 schema 到数据库
npm run db:studio          # 打开 Prisma Studio 数据管理
npm run db:seed            # 初始化管理员账号

# 构建 & 部署
npm run build              # 生产构建
npm start                  # 启动生产服务器

# Docker
docker build -t blog .     # 构建镜像
docker run -p 3000:3000 blog
```

---

## API 路由一览

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/...` | POST | NextAuth 认证 (登录/登出/会话) |
| `/api/register` | POST | 用户注册 |
| `/api/posts` | GET/POST | 文章列表 / 新建 |
| `/api/posts/[id]` | GET/PUT/DELETE | 文章详情 / 更新 / 删除 |
| `/api/comments` | GET/POST | 评论列表 / 发表 |
| `/api/likes` | POST/DELETE | 点赞 / 取消 |
| `/api/upload` | POST | 图片上传 (imgbb) |
| `/api/account` | GET/PUT | 用户信息 / 更新 |
| `/api/admin` | GET | 管理后台统计 |
| `/api/friendlinks` | GET/POST | 友情链接列表 / 添加 |
| `/api/init` | POST | 系统初始化 |
| `/api/user` | GET | 用户信息 |

---

## 设计风格

- **配色**: Amber 暖色调渐变背景 (`#fffbeb → #f3e8ff → #ffedd5`)
- **主色**: Sky Blue (`primary-500: #0ea5e9`)
- **字体**: Inter (无衬线), CSS 变量 `--font-inter`
- **卡片**: 毛玻璃效果 (`bg-white/70 backdrop-blur-sm`), 圆角 + 阴影
- **动画**: `gradientBreath` 呼吸渐变, `fadeInUp` 入场
- **排版**: 自定义 prose 样式 (代码块暗色主题、引用块、图片圆角)
