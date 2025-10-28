const db = require("../../database/index");
const { sendAdminNotification, sendCustomerConfirmation } = require("../../services/emailService");

exports.contact = async (req, res) => {
  try {
    const { name, email, message, subject, type } = req.body;

    // 1. 保存到数据库 (使用callback方式)
    const sql = `INSERT INTO contact (name, email, message, subject, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;

    db.query(sql, [name, email, message, subject, type], async (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).send({ success: false, message: '提交失败，请稍后重试。' });
      }

      // 2. 发送管理员通知邮件到 han@rwadealmaker.com
      try {
        await sendAdminNotification({ name, email, message, subject, type });
        console.log(`✅ 管理员通知邮件已发送: ${name} (${email})`);
      } catch (emailError) {
        console.error('❌ 管理员邮件发送失败:', emailError.message);
        // 不阻止响应，记录错误即可
      }

      // 3. 发送客户确认邮件
      try {
        await sendCustomerConfirmation(email, name);
        console.log(`✅ 客户确认邮件已发送: ${email}`);
      } catch (emailError) {
        console.error('❌ 客户确认邮件发送失败:', emailError.message);
        // 不阻止响应，记录错误即可
      }

      res.send({ success: true, message: '您的信息已提交，我们会尽快处理！' });
    });

  } catch (err) {
    console.error("ContactUs Error:", err);
    res.status(500).send({ success: false, message: '提交失败，请稍后重试。' });
  }
};
