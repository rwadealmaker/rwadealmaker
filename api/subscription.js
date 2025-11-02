// api/subscription.js - 统一的认购管理 API
const { query } = require('./_utils/db')
const { success, error, setCORS } = require('./_utils/response')

module.exports = async (req, res) => {
  setCORS(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  try {
    // GET /api/subscriptions - 获取所有认购
    if (pathname === '/api/subscriptions' && method === 'GET') {
      const sql = 'SELECT * FROM subscriptions ORDER BY created_at DESC'
      const results = await query(sql, [])
      return success(res, results, 'Subscriptions retrieved successfully')
    }

    // POST /api/subscriptions - 创建新认购
    if (pathname === '/api/subscriptions' && method === 'POST') {
      const {
        project_code,
        user_wallet_address,
        user_email,
        subscribe_token,
        payment_method,
        payment_currency,
        payment_amount,
        latest_tx_hash,
        user_id
      } = req.body

      if (!project_code || !user_wallet_address || !user_email || !subscribe_token) {
        return error(res, 'Missing required fields', 400)
      }

      const sql = `
        INSERT INTO subscriptions (
          project_code, user_wallet_address, user_email,
          subscribe_token, payment_method, payment_currency,
          payment_amount, latest_tx_hash, user_id,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW(), NOW())
        RETURNING *
      `

      const result = await query(sql, [
        project_code,
        user_wallet_address,
        user_email,
        subscribe_token,
        payment_method || 'crypto',
        payment_currency || 'USDC',
        payment_amount || 0,
        latest_tx_hash || '',
        user_id || null
      ])

      return success(res, result[0], 'Subscription created successfully')
    }

    // PATCH /api/subscriptions/:id/status - 更新认购状态
    const statusMatch = pathname.match(/^\/api\/subscriptions\/(\d+)\/status$/)
    if (statusMatch && method === 'PATCH') {
      const id = statusMatch[1]
      const { status, status_reason, approved_by } = req.body

      const sql = `
        UPDATE subscriptions 
        SET status = $1, status_reason = $2, approved_by = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `
      const result = await query(sql, [status, status_reason || '', approved_by || '', id])

      if (result.length === 0) {
        return error(res, 'Subscription not found', 404)
      }

      return success(res, result[0], 'Status updated successfully')
    }

    // POST /api/subscriptions/:id/verify-payment - 验证支付
    const verifyMatch = pathname.match(/^\/api\/subscriptions\/(\d+)\/verify-payment$/)
    if (verifyMatch && method === 'POST') {
      const id = verifyMatch[1]
      const { is_confirmed, block_number } = req.body

      const sql = `
        UPDATE subscriptions 
        SET payment_confirmed = $1, block_number = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `
      const result = await query(sql, [is_confirmed || false, block_number || null, id])

      if (result.length === 0) {
        return error(res, 'Subscription not found', 404)
      }

      return success(res, result[0], 'Payment verified successfully')
    }

    // GET /api/subscriptions/notifications/list - 获取通知列表
    if (pathname === '/api/subscriptions/notifications/list' && method === 'GET') {
      const { user_wallet_address, user_id } = req.query

      let sql = 'SELECT * FROM subscriptions WHERE 1=1'
      const params = []

      if (user_wallet_address) {
        params.push(user_wallet_address)
        sql += ` AND user_wallet_address = $${params.length}`
      }

      if (user_id) {
        params.push(user_id)
        sql += ` AND user_id = $${params.length}`
      }

      sql += ' ORDER BY created_at DESC'

      const results = await query(sql, params)
      return success(res, results, 'Notifications retrieved successfully')
    }

    return error(res, 'Route not found', 404)

  } catch (err) {
    console.error('Subscription API Error:', err)
    return error(res, err.message || 'Internal server error', 500)
  }
}
