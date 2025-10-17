//导入定义验证规则的包
const joi = require('joi');

//定义用户名,密码和身份证的验证规则
//const user_name = joi.string().alphanum().min(4).max(10).required();
const user_email = joi.string().trim().email({ tlds: { allow: false } }).required();
const user_password = joi.string().pattern(/^[\S]{6,54}$/).required();
//const user_id = joi.string().length(18).pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/).required();

//定义验证注册和登录表单数据的规则对象
exports.reg_login_schema = {
  body: {
    //user_name,
    user_email,
    user_password,
    //user_id
  }
}