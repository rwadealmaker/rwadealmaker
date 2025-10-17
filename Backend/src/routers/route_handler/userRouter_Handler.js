// const db = require("../../database/index");
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// //注册新用户处理函数
// exports.regUser = (req, res) => {
//   //获取用户提交数据
//   const userinfo = req.body;

//   //定义SQL语句,查询用户邮箱
//   console.log('用户:' + userinfo.user_email)
//   const sqlStr = 'select * from user where user_email=?'
//   db.query(sqlStr, [userinfo.user_email], (err, results) => {

//     // 执行SQL语句失败
//     if (err) return res.cc(err)

//     //判断邮箱是否被占用
//     if (results.length > 0) { return res.cc('该邮箱已被注册!') }

//     // 调用bcrypt.hashSync()对密码进行加密(不能解密，只能验证)
//     console.log('注册用户未加密密码:' + userinfo.user_password)
//     userinfo.user_password = bcrypt.hashSync(userinfo.user_password, 10)
//     console.log('注册用户加密密码' + userinfo.user_password)

//     // 定义插入用户数据的SQL语句
//     const sql = 'insert into user set ?'
//     db.query(sql, { user_name: userinfo.user_name, user_password: userinfo.user_password, user_id: userinfo.user_id, user_email: userinfo.user_email, user_phone: userinfo.user_phone }, (err, results) => {

//       // 执行SQL语句失败
//       if (err) return res.cc(err)
//       // 执行SQL语句成功，但影响行数不为1
//       if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！')

//       // 注册用户成功
//       console.log('注册用户成功!')
//       res.send({ status: 0, message: '注册成功!!' });
//     })
//   })
// }

// //登录处理函数
// exports.login = (req, res) => {
//   //获取用户提交数据
//   const userinfo = req.body

//   const sql = 'select * from user where user_email=?'
//   db.query(sql, [userinfo.user_email], (err, results) => {
//     // 执行SQL语句失败
//     if (err) return res.cc(err)
//     // 执行SQL语句成功，但是查询到数据条数不等于1
//     if (results.length !== 1) return res.cc('用户未注册,登录失败！')

//     // 拿着用户输入的密码，和数据库中存储的密码进行对比
//     const compareResult = bcrypt.compareSync(userinfo.user_password, results[0].user_password)
//     if (!compareResult) return res.cc('密码错误,登录失败！')

//     //在服务器端生成token字符串并擦除密码及id等敏感信息
//     const user = { ...results[0], user_password: '', user_email: '' }

//     //对用户信息进行加密，生成token字符串
//     const tokenStr = jwt.sign(user, process.env.jwt_SecretKey, { expiresIn: process.env.expiresIn })

//     console.log('用户: ' + userinfo.user_email + ' 登录成功！')

//     res.send({
//       status: 0,
//       message: '登录成功！',
//       token: 'Bearer ' + tokenStr,
//     })
//   })
// }

const db = require("../../database/index");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require("../../utils/mailer"); // 引入发邮件工具

// 注册新用户处理函数
exports.regUser = (req, res) => {
  const userinfo = req.body;

  const sqlStr = 'select * from user where user_email=?';
  db.query(sqlStr, [userinfo.user_email], (err, results) => {
    if (err) return res.cc(err);
    if (results.length > 0) return res.cc('该邮箱已被注册!');

    // 加密密码
    userinfo.user_password = bcrypt.hashSync(userinfo.user_password, 10);

    // 插入用户，email_verified 默认 0
    const sql = 'insert into user set ?';
    db.query(sql, {
      user_name: userinfo.user_name,
      user_password: userinfo.user_password,
      user_id: userinfo.user_id,
      user_email: userinfo.user_email,
      user_phone: userinfo.user_phone,
      email_verified: 0
    }, async (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！');

      // 生成邮箱验证 token
      const token = jwt.sign(
        { userId: results.insertId },
        process.env.jwt_SecretKey,
        { expiresIn: "1d" }
      );

      // 发送验证邮件
      await sendVerificationEmail(userinfo.user_email, token);
      console.log("请前往邮箱进行验证")

      res.send({ status: 0, message: '注册成功，请前往邮箱完成验证！' });
    });
  });
};

// 邮箱验证处理函数
exports.verifyEmail = (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.jwt_SecretKey);

    const sql = 'UPDATE user SET email_verified = 1 WHERE id = ?';
    db.query(sql, [decoded.userId], (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows !== 1) return res.cc('邮箱验证失败！');
      res.send({ status: 0, message: '邮箱验证成功，现在可以进行登录' });
    });
    console.log("邮箱验证成功！");
  } catch (e) {
    return res.cc('验证失败或链接已过期！');
  }
};

// 登录处理函数
exports.login = (req, res) => {
  const userinfo = req.body;
  const sql = 'select * from user where user_email=?';

  db.query(sql, [userinfo.user_email], (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc('用户未注册,登录失败！');

    // 检查邮箱是否验证
    if (results[0].email_verified !== 1) {
      return res.cc('邮箱未验证，请先到邮箱完成验证！');
    }

    // 校验密码
    const compareResult = bcrypt.compareSync(userinfo.user_password, results[0].user_password);
    if (!compareResult) return res.cc('密码错误,登录失败！');

    // 生成 token
    const user = { ...results[0], user_password: '', user_email: '' };
    const tokenStr = jwt.sign(user, process.env.jwt_SecretKey, { expiresIn: process.env.expiresIn });

    res.send({
      status: 0,
      message: '登录成功！',
      token: 'Bearer ' + tokenStr,
    });
  });
};
