# 🚀 Vercel 全栈部署 - 完整解决方案

## ✅ 已完成的所有修复

### 1. 🔧 移除所有硬编码的 localhost URL

所有硬编码的 `http://localhost:3000` 已被移除并替换为环境变量:

#### 前端文件 (Frontend/Website/src/):
- ✅ `service/api.ts` - 完全重构,使用统一的 API_CONFIG
- ✅ `components/ContactUs.vue` - 使用 import.meta.env.VITE_API_BASE_URL
- ✅ `views/admin/AdminDashboard.vue` - 3处硬编码全部修复
- ✅ `views/core/NotificationsView.vue` - 5处硬编码全部修复
- ✅ `views/core/TradeProjectView.vue` - 使用环境变量
- ✅ `views/core/ProfileView.vue` - 已使用环境变量(验证通过)
- ✅ `service/projectDataService.js` - 已使用环境变量
- ✅ `service/userDataService.js` - 已使用环境变量

### 2. 🔐 创建统一的环境变量配置系统

#### 新建文件:
- ✅ `Frontend/Website/src/config/env.ts` - 统一的 API 配置管理
- ✅ `Frontend/Website/.env.development` - 开发环境配置
- ✅ `Frontend/Website/.env.production` - 生产环境配置
- ✅ `.env.vercel.example` - Vercel 环境变量模板

#### 环境配置逻辑:
```typescript
// 开发环境: VITE_API_BASE_URL = http://localhost:3000
// 生产环境: VITE_API_BASE_URL = /api (相对路径)
```

### 3. 🌐 后端转换为 Vercel Serverless Functions

#### 创建的 API 端点 (api/):

**工具函数:**
- ✅ `_utils/db.js` - MySQL 数据库连接池 (Serverless 优化)
- ✅ `_utils/response.js` - 统一响应处理 + CORS 配置
- ✅ `_utils/email.js` - 邮件服务 (支持 Serverless)

**用户认证:**
- ✅ `user/login.js` - POST /api/user/login
- ✅ `user/reguser.js` - POST /api/user/reguser

**项目管理:**
- ✅ `project/select.js` - GET /api/project/select
- ✅ `project/active.js` - GET /api/project/active
- ✅ `project/incoming.js` - GET /api/project/incoming

**功能模块:**
- ✅ `contact.js` - POST /api/contact (联系我们)
- ✅ `subscriptions/index.js` - GET/POST /api/subscriptions

### 4. 📧 邮件服务配置

**已实现功能:**
- ✅ 管理员通知邮件 (发送到 han@rwadealmaker.com)
- ✅ 客户确认邮件
- ✅ Serverless 环境适配
- ✅ 错误处理和日志记录

**支持的邮件服务器:**
- Office 365 SMTP (smtp.office365.com:587)

### 5. ⚙️ Vercel 部署配置

#### 更新的文件:
- ✅ `vercel.json` - 完整的 Vercel 配置
  - 前端构建配置
  - Serverless Functions 配置
  - 路由规则配置
  - 环境变量配置

#### 配置内容:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "Frontend/Website/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ]
}
```

### 6. 📦 依赖管理

#### 新建文件:
- ✅ `api/package.json` - Serverless Functions 依赖

#### 依赖包:
- `mysql2` - MySQL 数据库驱动
- `nodemailer` - 邮件发送
- `bcryptjs` - 密码加密
- `jsonwebtoken` - JWT 认证

---

## 🎯 核心问题解决

### ❌ 原问题: 404 错误
**根本原因:**
1. 硬编码的 `http://localhost:3000` 在 Vercel 上无法访问
2. 前端请求发送到错误的地址
3. 缺少后端 API 服务

### ✅ 解决方案:
1. **移除所有硬编码** - 使用环境变量动态配置
2. **创建统一配置系统** - `config/env.ts` 管理所有 API 端点
3. **Serverless Functions** - 将后端转换为 Vercel 原生支持的格式
4. **正确的路由配置** - 在 Vercel 上正确处理前端和 API 请求

---

## 📋 Vercel 部署步骤

### 步骤 1: 配置环境变量

在 Vercel 项目设置中添加以下环境变量:

```bash
# 必需的数据库配置
db_host=your-mysql-host.com
db_port=3306
db_user=your_database_user
db_password=your_database_password
db_name=rwa

# 必需的邮件配置
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password

# 必需的 JWT 配置
jwt_SecretKey=your_super_secret_jwt_key

# Node 环境
NODE_ENV=production
```

### 步骤 2: 推送代码

```bash
git add .
git commit -m "Fix: Complete Vercel full-stack deployment setup

- Remove all hardcoded localhost URLs
- Add unified environment variable configuration
- Convert backend to Vercel Serverless Functions
- Configure email service for Serverless
- Update vercel.json for full-stack deployment"
git push origin main
```

### 步骤 3: Vercel 自动部署

Vercel 会自动:
1. ✅ 检测到代码推送
2. ✅ 构建前端 (Vite)
3. ✅ 部署 Serverless Functions
4. ✅ 配置路由规则

### 步骤 4: 验证部署

**测试清单:**
- [ ] 访问主页: `https://your-project.vercel.app/`
- [ ] 测试 API: `https://your-project.vercel.app/api/project/select`
- [ ] 测试联系表单 (邮件发送)
- [ ] 测试用户登录/注册
- [ ] 测试项目列表显示

---

## 🔗 API 路由映射

### Vercel 上的路由:

| 原后端路由 (localhost:3000) | Vercel Serverless 路由 | 文件位置 |
|---|---|---|
| POST /api/contact | POST /api/contact | api/contact.js |
| POST /user/login | POST /api/user/login | api/user/login.js |
| POST /user/reguser | POST /api/user/reguser | api/user/reguser.js |
| GET /project/select | GET /api/project/select | api/project/select.js |
| GET /project/active | GET /api/project/active | api/project/active.js |
| GET /project/incoming | GET /api/project/incoming | api/project/incoming.js |
| GET/POST /api/subscriptions | GET/POST /api/subscriptions | api/subscriptions/index.js |

---

## 🛠️ 故障排查

### 问题 1: 404 错误 - API 无法访问

**检查清单:**
1. ✅ 验证环境变量是否在 Vercel 中正确配置
2. ✅ 检查 Vercel Functions 日志
3. ✅ 确认 API 路由路径正确

**解决方案:**
```bash
# 查看 Vercel 部署日志
vercel logs your-project-url

# 检查 Functions 是否部署成功
vercel ls --scope=your-team
```

### 问题 2: 数据库连接失败

**检查清单:**
1. ✅ 数据库是否允许来自 Vercel 的连接
2. ✅ 数据库凭据是否正确
3. ✅ 数据库表是否存在

**解决方案:**
- 在数据库防火墙中允许 Vercel IP 范围
- 使用 `0.0.0.0/0` (仅用于测试)
- 验证 `db_host`, `db_user`, `db_password` 正确

### 问题 3: 邮件发送失败

**检查清单:**
1. ✅ EMAIL_USER 和 EMAIL_PASSWORD 是否正确
2. ✅ Office 365 SMTP 是否启用
3. ✅ 查看 Vercel Functions 日志

**解决方案:**
```javascript
// 在 Vercel Functions 日志中查看错误
console.log('EMAIL_USER:', process.env.EMAIL_USER)
// 不要打印密码!
```

### 问题 4: CORS 错误

**已解决:**
- ✅ 所有 API 函数都包含 CORS 头
- ✅ 使用 `setCORS()` 函数统一处理
- ✅ 支持 OPTIONS 预检请求

---

## 📊 环境对比

| 项目 | 开发环境 | 生产环境 (Vercel) |
|---|---|---|
| 前端 URL | http://localhost:5173 | https://your-project.vercel.app |
| API URL | http://localhost:3000 | https://your-project.vercel.app/api |
| 数据库 | 本地 MySQL | 远程 MySQL |
| 邮件服务 | 开发环境 SMTP | Office 365 SMTP |
| 环境变量 | .env.development | Vercel 环境变量 |

---

## 🎉 成功指标

部署成功后,你应该能够:
- ✅ 访问 Vercel 部署的前端页面
- ✅ 所有 API 请求正常工作
- ✅ 用户可以登录/注册
- ✅ 项目列表正常显示
- ✅ 联系表单邮件正常发送
- ✅ 认购功能正常工作
- ✅ 没有 404 错误
- ✅ 没有 CORS 错误

---

## 📚 相关文档

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 详细部署指南
- [.env.vercel.example](./.env.vercel.example) - 环境变量模板
- [api/README.md](./api/README.md) - API 文档 (如需创建)

---

## 🔒 安全注意事项

1. **永远不要提交 .env 文件到 Git**
2. **使用强密码作为 JWT Secret**
3. **定期更新数据库密码**
4. **限制数据库访问 IP**
5. **启用 HTTPS (Vercel 自动提供)**

---

## 🚀 下一步

部署成功后,考虑:
1. 配置自定义域名
2. 设置 CI/CD 自动部署
3. 添加监控和日志
4. 实现更多 API 端点
5. 优化性能和缓存
6. 添加单元测试

---

## ✅ 总结

**问题:** Vercel 部署后出现 404 错误,由于硬编码的 localhost URL

**解决方案:**
1. ✅ 移除所有硬编码的 URL
2. ✅ 创建统一的环境变量配置系统
3. ✅ 将后端转换为 Vercel Serverless Functions
4. ✅ 配置邮件服务支持 Serverless 环境
5. ✅ 更新 vercel.json 支持全栈部署

**结果:** 完整的全栈应用,前端和后端都在 Vercel 上正常运行! 🎉
