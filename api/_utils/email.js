// api/_utils/email.js - 邮件服务 (Serverless 优化)
const nodemailer = require('nodemailer')

// 创建邮件传输器 (每次调用都创建新实例,适合 Serverless)
function createTransporter() {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  }

  if (!config.auth.user || !config.auth.pass) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD must be configured')
  }

  return nodemailer.createTransport(config)
}

// 发送验证邮件
async function sendVerificationEmail(email, token) {
  const transporter = createTransporter()
  const verifyUrl = `${process.env.FRONTEND_URL || 'https://rwadealmaker.vercel.app'}/verify?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'RWA Deal Maker - 邮箱验证',
    html: `
      <h2>欢迎使用 RWA Deal Maker!</h2>
      <p>请点击下面的链接完成邮箱验证：</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#0070f3;color:#fff;text-decoration:none;border-radius:5px;">验证邮箱</a>
      <p style="margin-top:20px;color:#666;">或复制此链接: ${verifyUrl}</p>
      <p style="color:#999;">此链接将在24小时后失效。</p>
    `
  })
  console.log(`✅ 验证邮件已发送: ${email}`)
}

// 发送联系表单管理员通知
async function sendAdminNotification({ name, email, message, subject, type }) {
  const transporter = createTransporter()
  const adminEmail = process.env.ADMIN_EMAIL || 'han@rwadealmaker.com'

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `新的联系表单: ${subject || type}`,
    html: `
      <h2>新的联系表单提交</h2>
      <p><strong>姓名:</strong> ${name}</p>
      <p><strong>邮箱:</strong> ${email}</p>
      <p><strong>类型:</strong> ${type || '未指定'}</p>
      <p><strong>主题:</strong> ${subject || '无'}</p>
      <p><strong>消息:</strong></p>
      <p>${message}</p>
    `
  })
  console.log(`✅ 管理员通知邮件已发送: ${name} (${email})`)
}

// 发送客户确认邮件
async function sendCustomerConfirmation(email, name) {
  const transporter = createTransporter()

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '感谢您联系 RWA Deal Maker',
    html: `
      <h2>感谢您的留言!</h2>
      <p>尊敬的 ${name},</p>
      <p>我们已收到您的消息,我们的团队将在24小时内与您联系。</p>
      <p>最诚挚的问候,<br/>RWA Deal Maker 团队</p>
    `
  })
  console.log(`✅ 客户确认邮件已发送: ${email}`)
}

module.exports = {
  sendVerificationEmail,
  sendAdminNotification,
  sendCustomerConfirmation
}
