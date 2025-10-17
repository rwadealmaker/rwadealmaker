// 简易 Node.js Express 后端API，处理邮箱验证码发送与校验
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendVerificationCode, verifyCode } = require('./src/service/emailService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 发送验证码邮件
app.post('/api/send-email-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required.' });
  try {
    const code = await sendVerificationCode(email);
    // 实际生产环境不返回code，仅用于前端演示
    res.json({ success: true, code });
  } catch (e) {
    res.json({ success: false, message: 'Failed to send email.' });
  }
});

// 校验验证码
app.post('/api/verify-email-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.json({ success: false, message: 'Email and code required.' });
  try {
    const ok = await verifyCode(email, code);
    res.json({ success: ok });
  } catch (e) {
    res.json({ success: false, message: 'Verification failed.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email verification server running on port ${PORT}`);
});
