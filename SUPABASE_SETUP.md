# 🗄️ Supabase 数据库配置指南

## 📋 需要的 Supabase 信息

请从 Supabase 项目中获取以下信息:

### 方式 1: 使用连接字符串 (推荐)

1. 登录 Supabase Dashboard
2. 选择你的项目
3. 导航到 **Settings** → **Database**
4. 找到 **Connection String** → **URI**
5. 复制连接字符串 (类似):

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### 方式 2: 使用单独配置

从 Supabase Dashboard → Settings → Database 获取:

- **Host**: `db.xxxxxxxxxxxxx.supabase.co`
- **Port**: `5432`
- **Database name**: `postgres`
- **User**: `postgres`
- **Password**: `[Your-Database-Password]`

---

## ⚙️ Vercel 环境变量配置

在 Vercel 项目设置中添加以下环境变量:

### 使用连接字符串 (推荐)

```env
# Supabase 数据库 (使用连接字符串)
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# 邮件配置
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password

# JWT 配置
jwt_SecretKey=your_super_secret_jwt_key_min_32_chars

# Node 环境
NODE_ENV=production
```

### 或使用单独配置

```env
# Supabase 数据库 (使用单独配置)
SUPABASE_DB_HOST=db.xxxxxxxxxxxxx.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_database_password
SUPABASE_DB_NAME=postgres

# 其他配置同上...
```

---

## 📊 数据库表结构

确保 Supabase 数据库中有以下表:

### 1. `user` 表 (用户表)

```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. `project_active` 表 (已代币化项目)

```sql
CREATE TABLE project_active (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  -- 添加其他字段...
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. `project_incoming` 表 (待代币化项目)

```sql
CREATE TABLE project_incoming (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  -- 添加其他字段...
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. `subscriptions` 表 (认购记录)

```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  project_code VARCHAR(50) NOT NULL,
  user_wallet_address VARCHAR(255),
  user_email VARCHAR(255),
  subscribe_token DECIMAL(20, 2),
  payment_method VARCHAR(50),
  payment_currency VARCHAR(50),
  payment_amount DECIMAL(20, 2),
  latest_tx_hash VARCHAR(255),
  user_id INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  status_reason TEXT,
  approved_by VARCHAR(255),
  payment_confirmed BOOLEAN DEFAULT FALSE,
  block_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. `contact` 表 (联系表单)

```sql
CREATE TABLE contact (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  subject VARCHAR(255),
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Supabase 安全设置

### 1. 启用 Row Level Security (RLS)

对于生产环境,建议启用 RLS:

```sql
-- 对每个表启用 RLS
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_active ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_incoming ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
```

### 2. 创建服务角色策略

由于我们使用服务端 API (Serverless Functions),需要创建允许服务角色访问的策略:

```sql
-- 示例: 允许服务角色访问所有数据
CREATE POLICY "Allow service role access" ON "user"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 对其他表重复相同操作
```

---

## 🚀 快速测试连接

### 测试 API 端点:

部署后访问:

```
https://your-project.vercel.app/api/project/select
```

应该返回:

```json
{
  "status": 0,
  "message": "Projects retrieved successfully",
  "data": [...]
}
```

---

## 📝 Supabase vs MySQL 的区别

| 特性 | MySQL | PostgreSQL (Supabase) |
|---|---|---|
| 占位符 | `?` | `$1, $2, $3` |
| 返回值 | `result.rows` | `result.rows` |
| 自增 ID | `AUTO_INCREMENT` | `SERIAL` |
| 布尔值 | `TINYINT(1)` | `BOOLEAN` |
| 字符串 | `VARCHAR` | `VARCHAR` or `TEXT` |

**已自动处理:** 所有 API 已更新为 PostgreSQL 语法!

---

## ❓ 常见问题

### Q: 如何找到 Supabase 连接字符串?

A: Supabase Dashboard → Settings → Database → Connection String → URI

### Q: 需要启用 SSL 吗?

A: 是的,Supabase 要求 SSL 连接 (已在代码中配置)

### Q: 可以使用 Supabase 的 REST API 吗?

A: 可以,但我们使用直连数据库以获得更好的性能和灵活性

### Q: 如何迁移现有 MySQL 数据到 Supabase?

A: 使用 Supabase 的数据导入工具或 `pg_dump`/`pg_restore`

---

## ✅ 检查清单

部署前确认:

- [ ] 已从 Supabase 获取连接信息
- [ ] 已在 Vercel 中配置环境变量
- [ ] Supabase 数据库中已创建所有必需的表
- [ ] 已测试数据库连接
- [ ] 已配置邮件服务环境变量

---

## 🔗 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Vercel 环境变量](https://vercel.com/docs/environment-variables)

