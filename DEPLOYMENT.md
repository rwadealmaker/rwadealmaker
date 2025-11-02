# Vercel Serverless 部署指南

## 🎯 架构概述

完整的 Serverless 架构,前后端分离部署:

```
├── api/                    # Serverless Functions (后端 API)
│   ├── _utils/            # 共享工具 (数据库/认证/邮件)
│   ├── user.js           # 用户 API
│   ├── project.js        # 项目 API
│   ├── contact.js        # 联系表单
│   └── subscription.js   # 认购管理
├── Frontend/Website/      # Vue 3 前端
└── vercel.json           # Vercel 配置
```

## 📋 部署前准备

### 1. Vercel 环境变量配置

在 Vercel Dashboard > Settings > Environment Variables 添加:

```bash
# 数据库 (Supabase PostgreSQL)
SUPABASE_DB_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:6543/postgres

# 邮件服务 (Office 365)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=han@rwadealmaker.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=han@rwadealmaker.com

# JWT 认证
jwt_SecretKey=your_secret_key_change_this
JWT_EXPIRES_IN=7d

# 前端 URL
FRONTEND_URL=https://rwadealmaker.vercel.app

# Node 环境
NODE_ENV=production
```

### 2. Supabase 数据库表

参考 `.env.vercel.example` 获取完整的环境变量列表。

## 🚀 部署步骤

### 方式 1: Git Push 自动部署 (推荐)

```bash
git add .
git commit -m "Serverless架构重构完成"
git push origin main
```

Vercel 会自动检测并部署。

### 方式 2: Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到生产环境
vercel --prod
```

## 🔧 本地开发测试

```bash
# 安装依赖
cd Frontend/Website && npm install
cd ../../api && npm install

# 启动 Vercel 本地开发环境
vercel dev
```

访问 `http://localhost:3000`

## 📡 API 端点

所有 API 路由:

- `POST /api/user/reguser` - 注册
- `POST /api/user/login` - 登录
- `GET /api/user/verify-email` - 邮箱验证
- `GET /api/project/active` - 已代币化项目
- `POST /api/contact` - 联系表单
- `GET /api/subscriptions` - 认购列表

## ⚠️ 常见问题

### 问题 1: Function Runtimes must have a valid version

**原因**: `vercel.json` 配置错误

**解决**: 当前配置已修复,不使用 `functions` 或 `builds` 配置

### 问题 2: 数据库连接失败

**检查**:
- `SUPABASE_DB_URL` 格式正确
- 使用 Transaction Pooler (端口 6543)
- Supabase 项目未暂停

### 问题 3: 邮件发送失败

**解决**:
- 使用 Office 365 应用专用密码
- 在 Microsoft 账户安全中心生成

## ✅ 架构优势

- ✨ 自动扩展,零运维
- 🌍 全球 CDN 加速
- 💰 按需付费,成本优化
- 🔒 原生 HTTPS 支持
- 📊 内置分析和日志

## 📚 技术栈

- **前端**: Vue 3 + Vite
- **后端**: Node.js Serverless Functions
- **数据库**: Supabase PostgreSQL
- **认证**: JWT
- **邮件**: Nodemailer
- **部署**: Vercel
