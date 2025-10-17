const db = require("../../database/index");
const { ContactUs } = require("../../utils/mailer");

exports.contact = async (req, res) => {
  try {
    const { name, email, message, subject, type } = req.body;

    const sql = `INSERT INTO contact (name, email, message, subject, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
    await db.query(sql, [name, email, message, subject, type]);

    await ContactUs(email);

    res.send({ status: 0, message: '您的信息已提交，我们会尽快处理！' });

  } catch (err) {
    console.error("ContactUs Error:", err);
    res.status(500).send({ status: 1, message: '提交失败，请稍后重试。' });
  }
};
