// api/_utils/email.js - 邮件服务 (Serverless)
const nodemailer = require('nodemailer')

// 创建邮件传输器
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  })
}

// 发送管理员通知邮件
async function sendAdminNotification({ name, email, message, subject, type }) {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'han@rwadealmaker.com',
    subject: `New Contact Form: ${subject || type}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  }

  await transporter.sendMail(mailOptions)
  console.log(`✅ 管理员通知邮件已发送: ${name} (${email})`)
}

// 发送客户确认邮件
async function sendCustomerConfirmation(email, name) {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank you for contacting RWA Deal Maker',
    html: `
      <h2>Thank you for your message!</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you within 24 hours.</p>
      <p>Best regards,<br/>RWA Deal Maker Team</p>
    `
  }

  await transporter.sendMail(mailOptions)
  console.log(`✅ 客户确认邮件已发送: ${email}`)
}

module.exports = {
  sendAdminNotification,
  sendCustomerConfirmation
}
