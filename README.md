# 个人博客 (Personal Blog)

一个使用 Next.js 14、React 18、Tailwind CSS 构建的现代化个人博客系统，支持文章管理、商品展示和用户认证。

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)

## ✨ 功能特性

- **文章系统** - 发布和管理博客文章，支持 Markdown 渲染
- **商品展示** - 商品列表和详情页，支持图片展示
- **用户认证** - NextAuth.js 集成，支持邮箱/密码和 GitHub 登录
- **点赞评论** - 用户可以对文章和商品点赞、评论
- **响应式设计** - 完美支持移动端和桌面端
- **箴言横幅** - 顶部展示经典中文箴言，带日出渐变动画
- **玻璃拟态** - 现代 UI 设计，半透明卡片效果

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 14 | React 框架 |
| React 18 | UI 库 |
| TypeScript | 类型安全 |
| Tailwind CSS | 样式框架 |
| NextAuth.js | 认证系统 |
| Prisma | ORM |
| PostgreSQL (Neon) | 数据库 |
| Vercel | 部署平台 |

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# GitHub OAuth (可选)
GITHUB_ID=""
GITHUB_SECRET=""

# imgbb (图片上传)
IMGBB_API_KEY=""

# 管理员账号
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"
```

### 初始化数据库

```bash
npm run db:push
npm run db:seed
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
blog/
├── prisma/
│   └── schema.prisma     # 数据库模型
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── admin/       # 管理后台
│   │   ├── api/        # API 路由
│   │   ├── articles/   # 文章页面
│   │   ├── products/   # 商品页面
│   │   └── layout.tsx  # 根布局
│   ├── components/     # React 组件
│   │   ├── Header.tsx  # 导航栏
│   │   ├── Footer.tsx  # 页脚
│   │   ├── PostCard.tsx    # 文章卡片
│   │   ├── ProductCard.tsx  # 商品卡片
│   │   ├── Quote.tsx   # 箴言横幅
│   │   ├── CommentForm.tsx # 评论表单
│   │   ├── Comment.tsx # 评论组件
│   │   └── LikeButton.tsx # 点赞按钮
│   └── lib/          # 工具库
│       ├── auth.ts     # NextAuth 配置
│       └── prisma.ts # Prisma 客户端
├── deploy.sh         # Unix 部署脚本
├── deploy.bat       # Windows 部署脚本
└── DEPLOY.md     # 部署文档
```

## 📱 页面路由

| 路径 | 描述 |
|------|------|
| `/` | 首页 |
| `/articles` | 文章列表 |
| `/articles/[id]` | 文章详情 |
| `/products` | 商品列表 |
| `/products/[id]` | 商品详情 |
| `/admin` | 管理后台 (需登录) |
| `/admin/login` | 登录页面 |
| `/api/auth/*` | NextAuth API |

## 🎨 设计亮点

### 箴言横幅
- 16 条经典中文箴言
- 日出渐变背景 (淡紫 → 柔黄 → 暖橙)
- 呼吸动画效果
- 每 30 秒自动切换

### 视觉设计
- 温暖渐变背景
- 玻璃拟态卡片
- 响应式布局
- 流畅过渡动画

## 🔧 部署

### Vercel (推荐)

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### 一键部署脚本

```bash
# Windows
deploy.bat

# Unix
chmod +x deploy.sh
./deploy.sh
```

## 🔐 管理员

首次使用需要创建管理员账号：

1. 在 `.env` 中设置 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`
2. 访问 `/admin/login`
3. 使用设置的邮箱和密码登录

## 📝 API

### 认证

使用 NextAuth.js，支持：
- 邮箱/密码登录
- GitHub OAuth

### 评论 API

```typescript
// 创建评论
POST /api/comment
{ content, postId?, productId?, nickname? }

// 获取评论
GET /api/comment?postId=xxx
```

### 点赞 API

```typescript
// 点赞/取消点赞
POST /api/like
{ postId?, productId? }
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License