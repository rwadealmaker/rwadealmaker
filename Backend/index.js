require('dotenv').config()
const express = require('express')
const mysql2 = require('mysql2')
const dbconfig = require('./src/database/dbConfig')

// 引入自定义响应处理模块---res.cc
const responseHandler = require('./src/middleware/responseHandler')

// 创建数据库连接,应该传入dbconfig的mysql属性
const mysql = mysql2.createPool(dbconfig.mysql)

// 创建express服务器实例
const cors = require('cors')
const app = express()

// 引入joi模块
const joi = require('joi')

//在路由之前封装res.cc函数(中间件)
app.use(responseHandler())

// 导入并配置cors中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

//配置解析表单数据的中间件，注意：这个中间件，只能解析json格式的表单数据(可改为urlencoded形式)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//在路由解析之前配置解析token的中间件
const { expressjwt: expressJWT } = require('express-jwt')
//未启用令牌
//app.use(expressJWT({ secret: process.env.jwt_SecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/user\/login$/, /^\/user\/reguser$/] }))

//导入路由模块
const userRouter = require('./src/routers/userRouter')
const transactionRouter = require('./src/routers/transactionRouter')
// 使用新版本的项目路由（支持project_active和project_incoming分离）
const projectRouter = require('./src/routers/projectRouter_v2')
const subscriptionRouter = require('./src/routers/subscriptionRouter')
const contactRouter = require('./src/routers/ContactUs')

// 使用路由模块
app.use('/user', userRouter)
app.use('/transaction', transactionRouter)
app.use('/project', projectRouter)
app.use('/api/subscriptions', subscriptionRouter)
app.use('/api', contactRouter)

// 定义全局错误级别中间件
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) { console.log('错误信息:' + err); return res.cc(err) }
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') { console.log('错误信息:' + err); return res.cc('身份认证失败！') }
  //未知错误
  res.cc(err + "未知错误")
})


//启动服务器
app.listen(3000, '0.0.0.0', () => { console.log('服务器3000端口已启动成功') })

// 测试数据库连接，执行sql语句
const sqlStr = 'show databases'
mysql.query(sqlStr, (err, results) => {
  if (err) {
    console.log('数据库连接错误:' + err.message);
  } else {
    console.log('数据库连接成功!');
    console.log('数据库列表:', results);
  }
});