# Vercel 部署指南 - 国内 Cloudflare 加速

## 部署架构

```
用户请求 → Cloudflare CDN (国内) → Vercel 服务器
```

---

## 第一步：准备代码

### 1.1 创建 GitHub 仓库

1. 访问 https://github.com/new
2. Repository name: `blog`
3. 选择 Public
4. 点击 Create repository

### 1.2 推送代码

在博客目录下执行：

```bash
# 初始化 git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 连接仓库（把 URL 换成你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/blog.git

# 推送
git branch -M main
git push -u origin main
```

---

## 第二步：Vercel 部署

### 2.1 创建 Vercel 账户

1. 访问 https://vercel.com
2. 点击 "Start Deploying"
3. 用 GitHub 账户登录
4. 授权 Vercel 访问你的仓库

### 2.2 导入项目

1. 点击 "New Project"
2. 找到并选择 `blog` 仓库
3. 点击 "Import"

### 2.3 配置部署

1. Project Name: `blog`（或自定义）
2. Framework Preset: Next.js（自动检测）
3. Build Command: `npm run build`（自动）
4. Output Directory: `.next`（自动）

### 2.4 添加环境变量

在 Environment Variables 部分添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `file:./dev.db` | SQLite 数据库文件 |
| `NEXTAUTH_SECRET` | `随机字符串` | 生成方法见下方 |
| `NEXTAUTH_URL` | `https://你的域名.vercel.app` | 部署后填写 |
| `IMGBB_API_KEY` | `34e7caf46c845fb4617ff35b319d1834` | 图片上传 API |

**生成 NEXTAUTH_SECRET**：

在终端执行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串作为 NEXTAUTH_SECRET。

### 2.5 部署

1. 点击 "Deploy"
2. 等待 2-3 分钟
3. 部署完成后获得 URL（如：`https://blog-xxx.vercel.app`）

### 2.6 更新 NEXTAUTH_URL

1. 部署完成后，进入 Project Settings → Environment Variables
2. 修改 `NEXTAUTH_URL` 为你的实际域名
3. 重新部署（Redeploy）

---

## 第三步：配置 Cloudflare 加速

### 3.1 添加域名 DNS

如果你有自己的域名：

1. 登录 Cloudflare（https://dash.cloudflare.com）
2. 添加你的域名
3. 修改 DNS 指向 Vercel：

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

### 3.2 启用中国加速

1. 在 Cloudflare 进入你的域名
2. 访问 **Speed** → **Optimization**
3. 找到 **Argo Smart Routing**（可选，开启后国内访问更快）
4. 启用 **Polish** 和 **Brotli** 压缩

### 3.3 配置页面规则（可选）

如果要用自定义域名：

1. 进入 **Traffic** → **Page Rules**
2. 创建规则：
   - URL: `yourdomain.com/*`
   - 设置：
     - SSL: Flexible
     - Performance: Auto
     - Cache Level: Cache Everything

---

## 第四步：数据库初始化

### 4.1 首次部署后

由于 Vercel 无状态，需要在部署时初始化数据库：

在 Vercel 项目的 **Deployments** 标签：
1. 查看最新的 deployment
2. 点击 **Redeploy**

或者通过 Git 提交触发：
```bash
git commit --allow-empty -m "trigger deploy"
git push
```

### 4.2 创建管理员账户

部署后需要重新创建管理员：

1. 进入 Vercel 项目 → Functions → 查看函数日志
2. 或者在本地修改 `.env` 确保密码正确
3. 提交并部署

---

## 第五步：验证

### 5.1 检查项目

1. 访问你的域名
2. 应该能看到博客首页
3. 访问 `/admin/login` 应该能登录

### 5.2 测试功能

- [ ] 首页加载
- [ ] 文章列表
- [ ] 登录后台
- [ ] 创建文章/商品
- [ ] 图片上传
- [ ] 评论功能

---

## 常见问题

### Q: 部署后图片上传失败
A: 确保 `IMGBB_API_KEY` 环境变量已正确设置

### Q: 登录后跳转到 localhost
A: 修改 `NEXTAUTH_URL` 为你的实际域名，然后重新部署

### Q: 数据库数据丢失
A: Vercel 免费版无持久化存储，建议使用付费版或使用 D1 数据库

### Q: 国内访问慢
A: 使用自定义域名，在 Cloudflare 启用 Argo Smart Routing

---

## 域名购买（可选）

如果还没有域名，可以购买：
- Namesilo: https://namesilo.com（便宜，有中文）
- Godaddy: https://godaddy.com
- 阿里云: https://aliyun.com

购买后将域名 DNS 指向 Vercel。

---

## 完成时间

整个过程约 15-30 分钟。