const express = require('express')
const userRouter = express.Router()

//导入用户路由处理函数
const userRouterHandler = require('./route_handler/userRouter_Handler')

//导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
//导入需要验证的规则对象
const { reg_login_schema } = require('../middleware/mw_userRoute')

//注册用户(加上用于验证的中间件，并传入验证规则reg_login_schema)
userRouter.post('/reguser', expressJoi(reg_login_schema), userRouterHandler.regUser)

//登录用户
userRouter.post('/login', expressJoi(reg_login_schema), userRouterHandler.login)

// 邮箱验证
userRouter.get('/verify-email', userRouterHandler.verifyEmail)

module.exports = userRouter