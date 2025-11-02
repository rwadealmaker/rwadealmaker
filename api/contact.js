// api/contact.js - 联系我们 API
const { query } = require('./_utils/db')
const { success, error, setCORS } = require('./_utils/response')
const { sendAdminNotification, sendCustomerConfirmation } = require('./_utils/email')

module.exports = async (req, res) => {
  setCORS(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return error(res, 'Method not allowed', 405)
  }

  try {
    const { name, email, message, subject, type } = req.body

    if (!name || !email || !message) {
      return error(res, 'Missing required fields', 400)
    }

    // 保存到数据库 (Supabase PostgreSQL)
    const sql = `INSERT INTO contact (name, email, message, subject, type, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`
    await query(sql, [name, email, message, subject || '', type || 'general'])

    // 发送邮件
    try {
      await sendAdminNotification({ name, email, message, subject, type })
      await sendCustomerConfirmation(email, name)
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message)
    }

    return success(res, null, 'Your message has been submitted successfully!')
  } catch (err) {
    console.error('ContactUs Error:', err)
    return error(res, 'Failed to submit message', 500)
  }
}
