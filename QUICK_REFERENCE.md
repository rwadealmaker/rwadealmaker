# 🚀 快速参考 - Supabase + Vercel 部署

## 需要的 Supabase 信息

```env
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**获取方式:** Supabase Dashboard → Settings → Database → Connection String

---

## Vercel 环境变量 (必需)

```env
# 数据库
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# 邮件
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_password

# JWT
jwt_SecretKey=your_secret_key_min_32_chars

# 环境
NODE_ENV=production
```

---

## 5个 API 端点

1. **contact.js** - POST /api/contact
2. **user.js** - /api/user/{login,reguser}
3. **project.js** - /api/project/{select,active,incoming}
4. **subscription.js** - /api/subscriptions/*
5. **_utils/** - 工具函数 (db, email, response)

---

## 部署命令

```bash
git add .
git commit -m "Deploy: Supabase + 5 APIs"
git push origin main
```

---

## 测试

- 前端: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/project/select`

---

## 需要帮助?

- 详细配置: `SUPABASE_SETUP.md`
- 完整指南: `DEPLOYMENT_FINAL.md`
