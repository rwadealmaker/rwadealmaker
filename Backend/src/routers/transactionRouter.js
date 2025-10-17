const express = require('express')
const transactionRouter = express.Router()

//导入用户路由处理函数
const transactionRouter_Handler = require('./route_handler/transactionRouter_Handler')

//导入交易数据
transactionRouter.post('/import', transactionRouter_Handler.importBlockTransactions)

module.exports = transactionRouter