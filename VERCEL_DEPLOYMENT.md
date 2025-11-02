# Vercel 全栈部署指南

## 已完成的修复

### 1. ✅ 移除所有硬编码的 localhost URL
所有前端代码现在使用环境变量 `VITE_API_BASE_URL`:
- ✅ `src/service/api.ts` - 统一使用 API_CONFIG
- ✅ `src/components/ContactUs.vue`
- ✅ `src/views/admin/AdminDashboard.vue`
- ✅ `src/views/core/NotificationsView.vue`
- ✅ `src/views/core/TradeProjectView.vue`
- ✅ `src/service/*.js`

### 2. ✅ 创建统一的环境配置系统
- ✅ `Frontend/Website/src/config/env.ts` - 统一的 API 配置
- ✅ `Frontend/Website/.env.development` - 开发环境
- ✅ `Frontend/Website/.env.production` - 生产环境

### 3. ✅ 将后端转换为 Serverless Functions
创建了以下 API 端点:
- ✅ `/api/contact.js` - 联系我们
- ✅ `/api/user/login.js` - 用户登录
- ✅ `/api/user/reguser.js` - 用户注册
- ✅ `/api/project/select.js` - 获取所有项目
- ✅ `/api/project/active.js` - 获取已代币化项目
- ✅ `/api/project/incoming.js` - 获取待代币化项目
- ✅ `/api/subscriptions/index.js` - 认购管理

### 4. ✅ 配置邮件服务
- ✅ `api/_utils/email.js` - 支持 Serverless 环境的邮件服务
- ✅ 管理员通知邮件
- ✅ 客户确认邮件

## 部署步骤

### 步骤 1: 在 Vercel 中添加环境变量

在 Vercel 项目的 Settings → Environment Variables 中添加以下变量:

```bash
# 数据库配置
db_host=your-mysql-host.com
db_port=3306
db_user=your_database_user
db_password=your_database_password
db_name=rwa

# Email 配置
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password

# JWT Secret
jwt_SecretKey=your_super_secret_jwt_key

# (可选) SumSub KYC
SUMSUB_APP_TOKEN=your_token
SUMSUB_SECRET_KEY=your_secret
SUMSUB_API_URL=https://api.sumsub.com

# (可选) Blockchain
SEPOLIA_PRIVATE_KEY=your_key_1
SEPOLIA_PRIVATE_KEY2=your_key_2
SEPOLIA_PRIVATE_KEY3=your_key_3

# Node Environment
NODE_ENV=production
```

### 步骤 2: 推送代码到 GitHub

```bash
git add .
git commit -m "Fix: Remove hardcoded localhost URLs and add Vercel serverless functions"
git push origin main
```

### 步骤 3: 部署到 Vercel

Vercel 会自动:
1. 构建前端 (Frontend/Website)
2. 部署 Serverless Functions (api/*)
3. 配置路由规则

### 步骤 4: 验证部署

部署完成后,访问你的 Vercel 域名并测试:

1. **前端页面**: `https://your-project.vercel.app/`
2. **API 端点**: `https://your-project.vercel.app/api/project/select`
3. **联系表单**: 测试发送邮件功能

## API 路由说明

### 前端路由
- `/` - 主页
- `/about` - 关于我们
- `/listedprojects` - 已代币化项目
- `/to-be-listed` - 待代币化项目
- 所有其他前端路由

### API 路由 (Serverless Functions)
- `POST /api/contact` - 联系我们
- `POST /api/user/login` - 用户登录
- `POST /api/user/reguser` - 用户注册
- `GET /api/project/select` - 获取所有项目
- `GET /api/project/active` - 获取已代币化项目
- `GET /api/project/incoming` - 获取待代币化项目
- `GET /api/subscriptions` - 获取所有认购
- `POST /api/subscriptions` - 创建认购

## 数据库要求

确保你的 MySQL 数据库包含以下表:
- `user` - 用户表
- `project_active` - 已代币化项目
- `project_incoming` - 待代币化项目
- `subscriptions` - 认购记录
- `contact` - 联系表单

## 环境变量说明

### 必需的环境变量
1. **数据库**: `db_host`, `db_user`, `db_password`, `db_name`
2. **邮件**: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`
3. **JWT**: `jwt_SecretKey`

### 可选的环境变量
1. **KYC**: `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`
2. **区块链**: `SEPOLIA_PRIVATE_KEY*`

## 故障排查

### 如果出现 404 错误:
1. 检查 Vercel 环境变量是否正确配置
2. 查看 Vercel 部署日志
3. 检查 API 路由是否正确

### 如果邮件发送失败:
1. 验证 EMAIL_USER 和 EMAIL_PASSWORD
2. 检查 Office 365 SMTP 设置
3. 查看 Vercel Functions 日志

### 如果数据库连接失败:
1. 确保数据库允许来自 Vercel 的连接
2. 检查数据库凭据
3. 验证数据库表是否存在

## 开发环境 vs 生产环境

### 开发环境 (localhost)
- 前端: `http://localhost:5173`
- 后端: `http://localhost:3000`
- 使用 `.env.development`

### 生产环境 (Vercel)
- 前端: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/*`
- 使用 Vercel 环境变量

## 下一步

部署成功后,你可以:
1. 配置自定义域名
2. 设置 CI/CD 自动部署
3. 添加更多 API 端点
4. 监控应用性能

## 支持

如果遇到问题,请检查:
- Vercel 部署日志
- 浏览器开发者工具控制台
- Vercel Functions 日志
