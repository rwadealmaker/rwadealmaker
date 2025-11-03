# RWA Deal Maker

一个基于区块链的实物资产代币化平台，提供认购、赎回和资产管理功能。

## 🏗️ 系统架构

### 架构概览

本项目采用现代化的 **Serverless 全栈架构**，实现前后端完全分离，通过以下方式部署：

```
GitHub (代码仓库)
    ↓ Push
Vercel (自动部署)
    ├── Frontend (Vue 3 SPA)        → CDN 分发
    └── Serverless API Functions    → 按需执行
         ↓ 连接
Supabase (PostgreSQL)              → 托管数据库
         ↓ 管理
用户数据 + 项目信息 + 认购记录

最终通过 GoDaddy 域名映射到生产环境
```

### 完整部署流程

1. **代码管理**: 本地开发 → Git Push → GitHub 仓库
2. **自动构建**: Vercel 检测到 Push → 自动触发构建
3. **前端部署**: Vue 3 应用构建为静态资源 → 部署到 Vercel CDN
4. **后端部署**: Node.js API 转换为 Serverless Functions
5. **数据库**: Supabase PostgreSQL 云数据库（独立部署）
6. **域名映射**: GoDaddy DNS → rwadealmaker.com → Vercel

### 核心技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Vue 3 + Vite | 现代化响应式 SPA |
| **后端** | Node.js Serverless | Vercel Functions (按需执行) |
| **数据库** | Supabase PostgreSQL | 托管 PostgreSQL + REST API |
| **区块链** | Ethereum + Solidity | 智能合约 (Sepolia 测试网) |
| **认证** | JWT | 无状态身份验证 |
| **邮件** | Nodemailer | Office 365 SMTP |
| **部署** | Vercel | 自动化 CI/CD |
| **域名** | GoDaddy | DNS 管理 |

## 📂 项目结构

```
rwadealmaker/
├── api/                          # Vercel Serverless Functions (后端)
│   ├── _utils/                   # 共享工具库
│   │   ├── db.js                # Supabase 数据库连接池
│   │   ├── auth.js              # JWT 认证中间件
│   │   ├── email.js             # 邮件发送服务
│   │   └── response.js          # 统一响应格式
│   ├── user.js                  # 用户 API (注册/登录/验证)
│   ├── project.js               # 项目 API (查询项目/合约)
│   ├── subscription.js          # 认购 API (申请/查询/管理)
│   └── contact.js               # 联系表单 API
│
├── Backend/                      # 区块链开发环境
│   ├── contracts/               # Solidity 智能合约
│   │   ├── CertificateToken.sol # ERC20 代币合约
│   │   ├── CompliantERC20.sol   # 合规代币基类
│   │   ├── KYCRegistry.sol      # KYC 注册表
│   │   └── LoanIssuer.sol       # 认购发行控制器
│   ├── scripts/                 # Hardhat 部署脚本
│   ├── test/                    # 合约测试
│   └── hardhat.config.js        # Hardhat 配置
│
├── Frontend/Website/             # Vue 3 前端应用
│   ├── src/
│   │   ├── components/          # Vue 组件
│   │   ├── views/               # 页面视图
│   │   ├── service/             # 业务逻辑层
│   │   │   ├── userDataService.js      # 用户状态管理
│   │   │   ├── projectDataService.js   # 项目数据管理
│   │   │   ├── walletService.js        # 钱包连接服务
│   │   │   ├── contractService.js      # 智能合约交互
│   │   │   └── dataSyncService.js      # 数据同步服务
│   │   ├── config/              # 配置文件
│   │   │   ├── env.ts           # API 端点配置
│   │   │   └── contractConfig.js # 智能合约配置
│   │   ├── router/              # Vue Router
│   │   └── assets/              # 静态资源
│   ├── public/                  # 公共资源
│   ├── vite.config.js           # Vite 配置
│   └── package.json
│
├── vercel.json                   # Vercel 部署配置
├── .env.vercel.example          # 环境变量模板
└── package.json                 # 根项目配置
```

## 🔧 底层架构详解

### 1. 前端架构 (Vue 3 SPA)

#### 技术选型
- **Vue 3**: 使用 Composition API 实现响应式状态管理
- **Vite**: 基于 ESM 的极速构建工具，开发环境秒级启动
- **Ethers.js 6.x**: 与以太坊区块链交互，支持 MetaMask 钱包
- **Pinia**: Vue 官方状态管理库
- **Vue Router 4**: SPA 路由管理

#### 服务层设计
前端采用 **Service-Oriented Architecture**，将业务逻辑抽离到独立服务：

```javascript
service/
├── userDataService.js      // 用户状态管理 (登录/注册/KYC)
├── projectDataService.js   // 项目数据管理 (项目列表/详情)
├── walletService.js        // Web3 钱包连接 (MetaMask)
├── contractService.js      // 智能合约调用 (读写链上数据)
└── dataSyncService.js      // 链上链下数据同步
```

#### 数据流
```
用户操作 → Vue Components
         → Service Layer (业务逻辑)
         → API Calls (Axios) / Contract Calls (Ethers.js)
         → Backend API / Blockchain
```

### 2. 后端架构 (Serverless Functions)

#### Vercel Serverless Functions
每个 API 端点对应一个独立的无服务器函数，自动扩展，按调用计费：

```javascript
api/
├── user.js           // 导出 module.exports = async (req, res) => {}
├── project.js        // 每次请求触发一个新的 Function 实例
├── subscription.js   // 冷启动约 100-200ms，热启动 < 50ms
└── contact.js
```

#### 统一工具层 (_utils/)
```javascript
_utils/
├── db.js          // PostgreSQL 连接池管理 (pg)
├── auth.js        // JWT 验证中间件
├── email.js       // Nodemailer SMTP 发送
└── response.js    // 统一 JSON 响应格式
```

#### API 请求流程
```
Vercel Edge Network → API Function 实例化
                   → JWT 验证 (auth.js)
                   → 数据库查询 (db.js)
                   → 返回 JSON (response.js)
```

### 3. 数据库架构 (Supabase PostgreSQL)

#### 为什么选择 Supabase？
- ✅ 托管 PostgreSQL，无需运维
- ✅ 自动备份 + 高可用
- ✅ 内置 REST API (可选)
- ✅ Connection Pooler (解决 Serverless 连接限制)

#### 数据库连接策略
```javascript
// api/_utils/db.js
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,  // Serverless 单连接模式
})
```

使用 **Transaction Pooler** (端口 6543) 而非直连 (端口 5432)，避免 Serverless 环境连接数耗尽。

#### 核心数据表
```sql
-- 用户表
users (
  user_id, username, email, password_hash,
  email_verified, kyc_status, wallet_address
)

-- 项目表 (已代币化)
project_active (
  code, title, contract_address_token,
  contract_address_kyc, total_supply
)

-- 项目表 (待代币化)
project_incoming (
  code, title, property_type, location, status
)

-- 认购记录
subscriptions (
  id, user_id, project_code, amount,
  status, wallet_address, created_at
)
```

### 4. 区块链架构 (Ethereum Sepolia)

#### 智能合约设计

```
KYCRegistry (合规注册表)
    ↓ 依赖
CompliantERC20 (合规 ERC20 基类)
    ↓ 继承
CertificateToken (本金代币 / 利息代币)
    ↓ 控制
LoanIssuer (认购发行控制器)
```

#### 合约功能
1. **KYCRegistry.sol**: 白名单管理，只有 KYC 通过的地址才能交易
2. **CompliantERC20.sol**: ERC20 + 转账前 KYC 检查
3. **CertificateToken.sol**: 代币铸造/销毁，受 LoanIssuer 控制
4. **LoanIssuer.sol**: 认购/赎回逻辑，管理本金币和利息币

#### 合约交互流程
```javascript
// Frontend (Ethers.js)
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
const contract = new ethers.Contract(address, ABI, signer)

// 调用合约方法
const tx = await contract.subscribe(amount)
await tx.wait()  // 等待交易确认
```

### 5. 部署架构 (Vercel + GitHub)

#### CI/CD 流程
```
1. 本地开发
   ├── cd Frontend/Website && npm run dev
   └── vercel dev (本地测试 Serverless Functions)

2. 提交代码
   git add . && git commit -m "..." && git push

3. Vercel 自动构建
   ├── 检测到 GitHub Push
   ├── npm install (安装依赖)
   ├── npm run build (构建前端)
   ├── 部署静态资源到 CDN
   └── 部署 Serverless Functions

4. 域名映射
   GoDaddy DNS CNAME → cname.vercel-dns.com
```

#### vercel.json 配置
```json
{
  "buildCommand": "cd Frontend/Website && npm run build",
  "outputDirectory": "Frontend/Website/dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 6. 环境变量管理

所有敏感配置通过 Vercel 环境变量注入：

```bash
# Vercel Dashboard → Settings → Environment Variables
SUPABASE_DB_URL=postgresql://...  # 数据库连接
jwt_SecretKey=...                 # JWT 密钥
EMAIL_USER=han@rwadealmaker.com   # SMTP 账号
EMAIL_PASSWORD=...                # SMTP 密码
```

前端通过 `import.meta.env.VITE_*` 访问公开变量。

## 🎯 功能特性

### 前端功能
- 🔗 **Web3 钱包**: MetaMask 连接，自动检测网络
- 💰 **代币余额**: 实时读取链上 ERC20 余额
- 📊 **认购系统**: 表单验证 + 链上交易 + 数据库记录
- 🔔 **通知系统**: 认购状态变更推送
- 👤 **用户中心**: JWT 无状态认证
- 🎨 **主题切换**: 深色/浅色模式

### 后端功能
- 🗄️ **PostgreSQL**: 关系型数据存储
- 🔐 **JWT 认证**: 无状态 Token 验证
- 📝 **认购管理**: CRUD + 状态机管理
- 📧 **邮件服务**: 注册验证 + 通知邮件
- 🔒 **CORS 策略**: 跨域安全配置

### 智能合约
- 📜 **ERC20 代币**: 符合以太坊标准
- 🔐 **KYC 门控**: 只有白名单地址可交易
- 💱 **认购/赎回**: 受控铸造/销毁机制
- ✅ **合规检查**: 转账前自动验证 KYC

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Git
- MetaMask 浏览器插件
- Vercel 账号 (部署用)
- Supabase 账号 (数据库)

### 本地开发

#### 1. 克隆仓库
```bash
git clone https://github.com/JYceeee/rwadealmaker.git
cd rwadealmaker
```

#### 2. 安装依赖
```bash
# 安装前端依赖
cd Frontend/Website
npm install

# 安装 API 依赖
cd ../../api
npm install
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.vercel.example .env

# 编辑 .env 文件，填入实际配置：
# - SUPABASE_DB_URL (Supabase 数据库连接)
# - jwt_SecretKey (随机生成的密钥)
# - EMAIL_USER/EMAIL_PASSWORD (SMTP 邮箱)
```

#### 4. 启动开发服务器

**方式 1: Vercel Dev (推荐)**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 启动本地开发环境 (模拟 Serverless)
vercel dev
```
访问 [http://localhost:3000](http://localhost:3000)

**方式 2: 仅前端开发**
```bash
cd Frontend/Website
npm run dev
```
访问 [http://localhost:5173](http://localhost:5173)

### 生产环境部署

#### 自动部署 (推荐)

1. **Fork 仓库到你的 GitHub**

2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择 GitHub 仓库

3. **配置环境变量**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加 `.env.vercel.example` 中的所有变量

4. **自动部署**
   ```bash
   git push origin main  # 每次 Push 自动触发部署
   ```

#### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到生产环境
vercel --prod
```

### 配置 GoDaddy 域名

1. **在 Vercel 添加域名**
   - Dashboard → Domains → Add Domain
   - 输入你的域名 (如 `rwadealmaker.com`)

2. **在 GoDaddy 配置 DNS**
   - 登录 GoDaddy DNS 管理
   - 添加 CNAME 记录：
     ```
     Name: www
     Value: cname.vercel-dns.com
     TTL: 600
     ```
   - 添加 A 记录 (根域名)：
     ```
     Name: @
     Value: 76.76.21.21
     TTL: 600
     ```

3. **等待 DNS 生效** (通常 1-24 小时)

## 📡 API 端点文档

### 用户 API (`/api/user`)
| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/user/reguser` | 用户注册 | ❌ |
| POST | `/api/user/login` | 用户登录 | ❌ |
| GET | `/api/user/verify-email?token=xxx` | 邮箱验证 | ❌ |
| GET | `/api/user/profile` | 获取用户信息 | ✅ JWT |

### 项目 API (`/api/project`)
| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/project/select` | 获取所有项目 | ❌ |
| GET | `/api/project/active` | 获取已代币化项目 | ❌ |
| GET | `/api/project/incoming` | 获取待代币化项目 | ❌ |
| GET | `/api/project/select/:code` | 根据代码获取项目 | ❌ |
| GET | `/api/project/:code/contracts` | 获取项目合约地址 | ❌ |

### 认购 API (`/api/subscription`)
| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/subscription` | 创建认购申请 | ✅ JWT |
| GET | `/api/subscription/:userId` | 获取用户认购记录 | ✅ JWT |
| PATCH | `/api/subscription/:id/status` | 更新认购状态 | ✅ JWT |

### 联系表单 API
| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/contact` | 提交联系表单 | ❌ |

## 🔐 认证流程

```javascript
// 1. 用户登录
POST /api/user/login
Body: { email, password }
Response: { token: "JWT_TOKEN", user: {...} }

// 2. 携带 Token 访问受保护 API
GET /api/user/profile
Headers: { Authorization: "Bearer JWT_TOKEN" }
```

## ⚠️ 常见问题

### 前端问题

**Q: MetaMask 连接失败？**
- 确保浏览器安装了 MetaMask 插件
- 检查网络是否切换到 Sepolia Testnet
- 清除浏览器缓存重试

**Q: API 请求 CORS 错误？**
- 检查 `vercel.json` 是否配置正确
- 确认前端 API_BASE_URL 配置

### 后端问题

**Q: Supabase 数据库连接超时？**
- 确认使用 Transaction Pooler 端口 6543
- 检查 `SUPABASE_DB_URL` 格式是否正确
- 确认 Supabase 项目未暂停

**Q: 邮件发送失败？**
- 使用 Office 365 应用专用密码 (非登录密码)
- 在 Microsoft 账户安全中心生成应用密码

### 区块链问题

**Q: 智能合约调用失败？**
- 确认钱包有足够的 SepoliaETH (测试币)
- 检查合约地址是否正确
- 确认用户地址已通过 KYC

## 🛠️ 技术支持

### 开发资源
- [Vue 3 文档](https://vuejs.org/)
- [Ethers.js 文档](https://docs.ethers.org/)
- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Hardhat 文档](https://hardhat.org/docs)

### 项目相关
- **项目地址**: [https://github.com/JYceeee/rwadealmaker](https://github.com/JYceeee/rwadealmaker)
- **问题反馈**: [GitHub Issues](https://github.com/JYceeee/rwadealmaker/issues)
- **生产环境**: [https://rwadealmaker.com](https://rwadealmaker.com)

## 📝 开发者指南

### 代码提交规范
```bash
# 功能开发
git checkout -b feature/user-authentication
git commit -m "feat: 添加用户认证功能"

# Bug 修复
git checkout -b fix/login-error
git commit -m "fix: 修复登录失败问题"

# 文档更新
git commit -m "docs: 更新 API 文档"
```

### 分支管理
- `main`: 生产环境分支 (自动部署到 Vercel)
- `develop`: 开发分支
- `feature/*`: 新功能分支
- `fix/*`: Bug 修复分支

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🎉 更新日志

### v2.0.0 (2025-11-04)
- 🚀 迁移到 Serverless 架构
- 🗄️ 数据库从 MySQL 迁移到 Supabase PostgreSQL
- ☁️ 部署到 Vercel 平台
- 🌐 配置 GoDaddy 域名映射
- 📝 完善 API 文档

### v1.0.0 (2025-01-17)
- ✨ 初始版本发布
- 🔗 钱包连接功能
- 💰 代币管理和显示
- 📊 认购系统
- 🔔 通知系统
- 👨‍💼 管理面板
- 🎨 响应式 UI 设计

---

**Made with ❤️ by RWA Deal Maker Team**
