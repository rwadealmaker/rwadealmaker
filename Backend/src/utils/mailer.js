const nodemailer = require("nodemailer");

const QQtransporter = nodemailer.createTransport({
  service: "QQ",
  auth: {
    user: process.env.EMAIL_QQ_ACCOUNT,
    pass: process.env.EMAIL_QQ_PASSWORD,
  },
});

const Microsofttransporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // 微软SMTP服务器地址（固定）
  port: 587,                  // 端口（587对应TLS，465对应SSL，推荐587）
  secure: false,              // 是否启用SSL（587端口设为false，465设为true）
  auth: {
    user: 'han@rwadealmaker.com',
    pass: '你的应用专用密码'
  }
});


async function sendVerificationEmail(email, token) {
  const url = `${process.env.FRONTEND_URL}/user/verify-email?token=${token}`;
  await QQtransporter.sendMail({
    from: process.env.EMAIL_ACCOUNT,
    to: email,
    subject: "请验证您的邮箱",
    html: `<p>点击下面的链接完成邮箱验证：</p><a href="${url}">${url}</a>`,
  });
}

async function ContactUs(email) {
  await Microsofttransporter.sendMail({
    from: process.env.EMAIL_ACCOUNT,
    to: email,
    subject: "回应邮件",
    html: `<p>我们已经收到您的请求，请稍等管理员处理。</p>`,
  });
}

module.exports = { sendVerificationEmail, ContactUs };
