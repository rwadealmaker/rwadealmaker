// api/user.js - 统一的用户管理 API (登录、注册、验证)
const { query } = require('./_utils/db')
const { success, error, setCORS } = require('./_utils/response')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  setCORS(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  try {
    // POST /api/user/login - 用户登录
    if (pathname === '/api/user/login' && method === 'POST') {
      const { email, password } = req.body

      if (!email || !password) {
        return error(res, 'Email and password are required', 400)
      }

      const sql = 'SELECT * FROM "user" WHERE email = $1'
      const results = await query(sql, [email])

      if (results.length === 0) {
        return error(res, 'User not found', 404)
      }

      const user = results[0]
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return error(res, 'Invalid password', 401)
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.jwt_SecretKey || 'default-secret-key',
        { expiresIn: '7d' }
      )

      const { password: _, ...userInfo } = user
      return success(res, { user: userInfo, token }, 'Login successful')
    }

    // POST /api/user/reguser - 用户注册
    if (pathname === '/api/user/reguser' && method === 'POST') {
      const { email, password } = req.body

      if (!email || !password) {
        return error(res, 'Email and password are required', 400)
      }

      const checkSql = 'SELECT * FROM "user" WHERE email = $1'
      const existing = await query(checkSql, [email])

      if (existing.length > 0) {
        return error(res, 'User already exists', 400)
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const insertSql = 'INSERT INTO "user" (email, password, created_at) VALUES ($1, $2, NOW()) RETURNING id, email'
      const result = await query(insertSql, [email, hashedPassword])

      const newUser = result[0]
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.jwt_SecretKey || 'default-secret-key',
        { expiresIn: '7d' }
      )

      return success(res, { user: newUser, token }, 'Registration successful')
    }

    // GET /api/user - 获取用户信息 (需要认证)
    if (pathname === '/api/user' && method === 'GET') {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return error(res, 'No authorization token', 401)
      }

      try {
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.jwt_SecretKey || 'default-secret-key')
        const sql = 'SELECT id, email, created_at FROM "user" WHERE id = $1'
        const results = await query(sql, [decoded.id])

        if (results.length === 0) {
          return error(res, 'User not found', 404)
        }

        return success(res, results[0], 'User retrieved successfully')
      } catch (jwtError) {
        return error(res, 'Invalid token', 401)
      }
    }

    return error(res, 'Route not found', 404)

  } catch (err) {
    console.error('User API Error:', err)
    return error(res, err.message || 'Internal server error', 500)
  }
}
