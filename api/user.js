// api/user.js - 用户管理 Serverless Function (注册、登录、邮箱验证)
const { query } = require('./_utils/db')
const { success, error, setCORS } = require('./_utils/response')
const { generateToken, verifyToken } = require('./_utils/auth')
const { sendVerificationEmail } = require('./_utils/email')
const bcrypt = require('bcryptjs')

module.exports = async (req, res) => {
  setCORS(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  try {
    // POST /api/user/reguser - 用户注册
    if (pathname === '/api/user/reguser' && method === 'POST') {
      const { user_email, user_password, user_name, user_id, user_phone } = req.body

      if (!user_email || !user_password) {
        return error(res, '邮箱和密码不能为空', 400)
      }

      // 检查邮箱是否已注册
      const checkSql = 'SELECT * FROM "user" WHERE user_email = $1'
      const existing = await query(checkSql, [user_email])

      if (existing.length > 0) {
        return error(res, '该邮箱已被注册!', 400)
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(user_password, 10)

      // 插入新用户
      const insertSql = `
        INSERT INTO "user" (user_name, user_password, user_id, user_email, user_phone, email_verified, created_at)
        VALUES ($1, $2, $3, $4, $5, 0, NOW())
        RETURNING id, user_email
      `
      const result = await query(insertSql, [
        user_name || null,
        hashedPassword,
        user_id || null,
        user_email,
        user_phone || null
      ])

      const newUser = result[0]

      // 生成邮箱验证 token
      const verifyToken = generateToken({ userId: newUser.id })

      // 发送验证邮件
      try {
        await sendVerificationEmail(user_email, verifyToken)
      } catch (emailError) {
        console.error('发送验证邮件失败:', emailError)
        // 不阻断注册流程
      }

      return success(res, null, '注册成功，请前往邮箱完成验证！')
    }

    // GET /api/user/verify-email - 邮箱验证
    if (pathname === '/api/user/verify-email' && method === 'GET') {
      const { token } = req.query || {}

      if (!token) {
        return error(res, '缺少验证令牌', 400)
      }

      try {
        const decoded = verifyToken(token)
        const updateSql = 'UPDATE "user" SET email_verified = 1 WHERE id = $1'
        const result = await query(updateSql, [decoded.userId])

        if (result.affectedRows === 0) {
          return error(res, '邮箱验证失败！', 400)
        }

        return success(res, null, '邮箱验证成功，现在可以进行登录')
      } catch (err) {
        return error(res, '验证失败或链接已过期！', 400)
      }
    }

    // POST /api/user/login - 用户登录
    if (pathname === '/api/user/login' && method === 'POST') {
      const { user_email, user_password } = req.body

      if (!user_email || !user_password) {
        return error(res, '邮箱和密码不能为空', 400)
      }

      const sql = 'SELECT * FROM "user" WHERE user_email = $1'
      const results = await query(sql, [user_email])

      if (results.length === 0) {
        return error(res, '用户未注册,登录失败！', 404)
      }

      const user = results[0]

      // 检查邮箱是否验证
      if (user.email_verified !== 1) {
        return error(res, '邮箱未验证，请先到邮箱完成验证！', 403)
      }

      // 验证密码
      const isMatch = await bcrypt.compare(user_password, user.user_password)
      if (!isMatch) {
        return error(res, '密码错误,登录失败！', 401)
      }

      // 生成登录 token
      const token = generateToken({
        id: user.id,
        user_email: user.user_email,
        user_name: user.user_name
      })

      // 移除敏感信息
      const { user_password: _, ...userInfo } = user

      return success(res, {
        user: userInfo,
        token: 'Bearer ' + token
      }, '登录成功！')
    }

    // GET /api/user - 获取当前用户信息 (需要认证)
    if (pathname === '/api/user' && method === 'GET') {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, '未提供认证令牌', 401)
      }

      try {
        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        const sql = 'SELECT id, user_name, user_email, user_phone, email_verified, created_at FROM "user" WHERE id = $1'
        const results = await query(sql, [decoded.id])

        if (results.length === 0) {
          return error(res, '用户不存在', 404)
        }

        return success(res, results[0], '获取用户信息成功')
      } catch (err) {
        return error(res, '认证失败或令牌已过期', 401)
      }
    }

    return error(res, '路由不存在', 404)

  } catch (err) {
    console.error('User API Error:', err)
    return error(res, err.message || '服务器内部错误', 500)
  }
}
