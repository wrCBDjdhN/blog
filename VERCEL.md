# 部署指南

## 方式一：Vercel 部署（推荐免费方案）

### 1. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/blog.git
git push -u origin main
```

### 2. 在 Vercel 部署
1. 访问 https://vercel.com 注册登录
2. 点击 "New Project" → 导入 GitHub 仓库
3. 配置：
   - Framework Preset: Next.js
   - Build Command: npm run build
   - Output Directory: .next
4. 添加环境变量：
   - `DATABASE_URL` = 文件路径（在 Vercel 需使用 Vercel Postgres 或其他数据库）
   - `NEXTAUTH_SECRET` = 随机字符串
   - `NEXTAUTH_URL` = 你的 Vercel 域名
   - `IMGBB_API_KEY` = 你之前申请的 key
5. 点击 Deploy

### 3. 数据库问题
Vercel 免费版不带数据库，需要：
- 方案A：使用 Vercel Postgres（免费）
- 方案B：使用 Railway 托管 SQLite

---

## 方式二：VPS 部署（推荐国内访问）

### 服务器要求
- 系统：Ubuntu 20.04+
- 内存：512MB+
- 香港/新加坡 VPS

### 1. 上传代码到服务器
```bash
# 在本地执行
rsync -av --delete ./ user@你的服务器IP:/var/www/blog/
```

### 2. 在服务器安装依赖
```bash
ssh user@服务器IP
cd /var/www/blog
npm install
npx prisma generate
npm run build
```

### 3. 使用 PM2 运行
```bash
npm install -g pm2
pm2 start npm --name blog -- start
pm2 save
```

### 4. 常用命令
```bash
pm2 logs blog      # 查看日志
pm2 restart blog # 重启
pm2 stop blog    # 停止
```

---

## 方式三：Cloudflare Pages + Railway（免费组合）

### 1. 前端：Cloudflare Pages
1. 推送代码到 GitHub
2. 访问 https://pages.cloudflare.com
3. 连接 GitHub 仓库
4. 设置：
   - Build command: npm run build
   - Build output: /.next
5. 添加环境变量

### 2. 后端：Railway
1. 访问 https://railway.app
2. 创建 Node.js 项目
3. 连接 GitHub 仓库
4. 添加环境变量

---

## 环境变量清单

部署时需要设置：
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="随机字符串"
NEXTAUTH_URL="https://你的域名"
IMGBB_API_KEY="34e7caf46c845fb4617ff35b319d1834"
```