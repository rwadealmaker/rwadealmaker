# RWA Deal Maker

一个基于区块链的房地产代币化（Real World Assets Tokenization）平台，支持智能合约部署、代币交易和投资组合管理。

## 项目概述

RWA Deal Maker 是一个完整的Web3应用，旨在将现实世界的房地产资产代币化，使投资者能够通过区块链技术进行投资和交易。

## 功能特性

### 🏠 项目展示
- **已上市项目**：查看已完成的房地产代币化项目
- **待上市项目**：浏览即将推出的投资项目
- **项目详情**：详细的项目信息、投资条款和收益预期

### 💼 投资管理
- **认购系统**：支持用户认购房地产代币
- **投资组合**：实时查看投资组合和收益情况
- **交易历史**：完整的交易记录和状态跟踪

### 🔐 身份验证
- **KYC认证**：集成SumSub进行身份验证
- **合规检查**：确保投资者符合监管要求
- **白名单管理**：支持投资者白名单功能

### 💰 钱包集成
- **MetaMask支持**：无缝连接MetaMask钱包
- **多网络支持**：支持Sepolia测试网和以太坊主网
- **代币管理**：实时监控钱包中的代币余额
- **实时同步**：自动同步钱包状态和代币信息

### 🔔 通知系统
- **认购通知**：认购申请成功/失败通知
- **状态更新**：投资状态变更通知
- **一键清除**：支持批量清除历史通知

### 👨‍💼 管理面板
- **认购管理**：管理员可以审核和批准认购申请
- **用户管理**：查看和管理用户信息
- **数据统计**：投资数据和收益统计

### 🌐 多语言支持
- **中英文切换**：支持中文和英文界面
- **国际化**：完整的i18n支持

## 技术栈

### 前端
- **Vue.js 3**：现代化的前端框架
- **Vite**：快速的构建工具
- **Ethers.js**：以太坊区块链交互
- **Vue Router**：路由管理
- **Composables**：组合式API

### 后端
- **Node.js**：服务器运行环境
- **Express.js**：Web应用框架
- **MySQL**：关系型数据库
- **MySQL2**：数据库连接库

### 区块链
- **Solidity**：智能合约开发语言
- **Hardhat**：智能合约开发框架
- **OpenZeppelin**：安全的智能合约库

### 智能合约
- **CertificateToken**：证书代币合约
- **CompliantERC20**：合规ERC20代币
- **KYCRegistry**：KYC注册表
- **LoanIssuer**：贷款发行者合约

## 项目结构

```
RWA_Project/
├── Backend/                 # 后端服务
│   ├── contracts/          # 智能合约
│   ├── scripts/            # 部署脚本
│   ├── src/                # 源代码
│   │   ├── api/           # API集成
│   │   ├── database/      # 数据库配置
│   │   ├── routers/       # 路由处理
│   │   └── utils/         # 工具函数
│   └── test/              # 测试文件
├── Frontend/               # 前端应用
│   └── Website/           # Vue.js网站
│       ├── src/           # 源代码
│       │   ├── components/ # Vue组件
│       │   ├── views/     # 页面视图
│       │   ├── services/  # 服务层
│       │   └── utils/     # 工具函数
│       ├── public/        # 静态资源
│       └── dist/          # 构建输出
└── README.md              # 项目说明
```

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- MetaMask钱包

### 后端设置
```bash
cd Backend
npm install
npm start
```

### 前端设置
```bash
cd Frontend/Website
npm install
npm run dev
```

### 数据库设置
1. 创建MySQL数据库
2. 导入数据库表结构
3. 配置数据库连接

### 智能合约部署
```bash
cd Backend
npx hardhat compile
npx hardhat run scripts/rwa_deploy.js --network sepolia
```

## 主要功能

### 1. 钱包连接
- 支持MetaMask钱包连接
- 自动检测网络切换
- 实时余额监控

### 2. 代币交易
- 认购房地产代币
- 查看代币余额
- 交易历史记录

### 3. 项目管理
- 项目信息展示
- 投资条款说明
- 收益计算

### 4. 用户认证
- KYC身份验证
- 合规性检查
- 白名单管理

## API接口

### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息

### 项目相关
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `POST /api/projects` - 创建新项目

### 认购相关
- `POST /api/subscriptions` - 创建认购申请
- `GET /api/subscriptions` - 获取认购列表
- `PATCH /api/subscriptions/:id` - 更新认购状态

### 通知相关
- `GET /api/subscriptions/notifications/list` - 获取通知列表
- `PATCH /api/subscriptions/notifications/:id/read` - 标记通知为已读
- `POST /api/subscriptions/notifications/clear` - 清除通知

## 部署指南

### 生产环境部署
1. 配置生产环境变量
2. 构建前端应用
3. 部署后端服务
4. 配置数据库
5. 部署智能合约

### 环境变量
```env
# 数据库配置
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=rwa

# 区块链配置
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key

# API配置
PORT=3000
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目链接：[https://github.com/JYceeee/rwadealmaker](https://github.com/JYceeee/rwadealmaker)
- 问题反馈：[Issues](https://github.com/JYceeee/rwadealmaker/issues)

## 更新日志

### v1.0.0 (2025-10-16)
- 🎉 初始版本发布
- ✨ 完整的房地产代币化平台
- 🔐 KYC认证集成
- 💰 MetaMask钱包集成
- 🔔 通知系统
- 👨‍💼 管理面板
- 🌐 中英文支持
