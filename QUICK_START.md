# 🚀 快速开始 - Vercel 部署

## 立即部署到 Vercel

### 1️⃣ 配置环境变量 (5分钟)

登录 Vercel → 项目设置 → Environment Variables → 添加以下变量:

```env
# 数据库 (必需)
db_host=your-mysql-host.com
db_user=your_user
db_password=your_password
db_name=rwa

# 邮件 (必需)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_password

# JWT (必需)
jwt_SecretKey=your_secret_key_min_32_chars

# Node 环境
NODE_ENV=production
```

### 2️⃣ 推送代码 (1分钟)

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 3️⃣ 等待部署 (2-3分钟)

Vercel 会自动:
- ✅ 构建前端
- ✅ 部署 API
- ✅ 配置路由

### 4️⃣ 验证部署 (1分钟)

访问: https://your-project.vercel.app

测试 API: https://your-project.vercel.app/api/project/select

---

## ✅ 完成!

你的全栈应用已成功部署到 Vercel!

**遇到问题?** 查看 DEPLOYMENT_SUMMARY.md

**详细指南?** 查看 VERCEL_DEPLOYMENT.md
