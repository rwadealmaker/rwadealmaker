// api/_utils/auth.js - JWT 认证工具

const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.jwt_SecretKey || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// 生成 JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// 验证 JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

// 从请求头提取 token
function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 认证中间件
function authenticate(req, res, next) {
  const token = extractToken(req)

  if (!token) {
    return res.status(401).json({
      status: 1,
      message: '未提供认证令牌'
    })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      status: 1,
      message: '认证失败或令牌已过期'
    })
  }
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  authenticate
}
