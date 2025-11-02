// Vercel Serverless Function Entry Point
// 将Backend的Express应用导出为Serverless函数

require('dotenv').config();
const express = require('express');
const mysql2 = require('mysql2');
const path = require('path');

// 设置Backend目录为基础路径
const backendPath = path.join(__dirname, '..', 'Backend');
const dbconfig = require(path.join(backendPath, 'src/database/dbConfig'));
const responseHandler = require(path.join(backendPath, 'src/middleware/responseHandler'));

// 创建数据库连接
const mysql = mysql2.createPool(dbconfig.mysql);

// 创建express服务器实例
const cors = require('cors');
const app = express();

// 引入joi模块
const joi = require('joi');

// 在路由之前封装res.cc函数(中间件)
app.use(responseHandler());

// 导入并配置cors中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// 配置解析表单数据的中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 导入路由模块
const userRouter = require(path.join(backendPath, 'src/routers/userRouter'));
const transactionRouter = require(path.join(backendPath, 'src/routers/transactionRouter'));
const projectRouter = require(path.join(backendPath, 'src/routers/projectRouter_v2'));
const subscriptionRouter = require(path.join(backendPath, 'src/routers/subscriptionRouter'));
const contactRouter = require(path.join(backendPath, 'src/routers/ContactUs'));

// 使用路由模块
app.use('/user', userRouter);
app.use('/transaction', transactionRouter);
app.use('/project', projectRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api', contactRouter);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API is running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// 环境变量检查端点（仅用于测试，生产环境应删除）
app.get('/api/env-check', (req, res) => {
  res.json({
    database: {
      host: process.env.db_host ? '✅ Configured' : '❌ Missing',
      port: process.env.db_port ? '✅ Configured' : '❌ Missing',
      user: process.env.db_user ? '✅ Configured' : '❌ Missing',
      password: process.env.db_password ? '✅ Configured' : '❌ Missing',
      name: process.env.db_name ? '✅ Configured' : '❌ Missing'
    },
    email: {
      host: process.env.EMAIL_HOST ? '✅ Configured' : '❌ Missing',
      port: process.env.EMAIL_PORT ? '✅ Configured' : '❌ Missing',
      user: process.env.EMAIL_USER ? '✅ Configured' : '❌ Missing',
      password: process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ Missing'
    },
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// 定义全局错误级别中间件
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) {
    console.log('错误信息:' + err);
    return res.cc(err);
  }
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') {
    console.log('错误信息:' + err);
    return res.cc('身份认证失败！');
  }
  // 未知错误
  res.cc(err + "未知错误");
});

// 导出为Vercel Serverless函数
module.exports = app;
