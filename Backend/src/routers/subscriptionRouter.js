const express = require('express')
const subscriptionRouter = express.Router()

// 导入订阅路由处理函数
const subscriptionRouter_Handler = require('./route_handler/subscriptionRouter_Handler')

// 创建新的认购记录
subscriptionRouter.post('/', subscriptionRouter_Handler.createSubscription)

// 获取用户的所有认购记录
subscriptionRouter.get('/user/:userId', subscriptionRouter_Handler.getUserSubscriptions)

// 获取特定认购记录的详情
subscriptionRouter.get('/:id', subscriptionRouter_Handler.getSubscriptionById)

// 更新认购状态
subscriptionRouter.put('/:id/status', subscriptionRouter_Handler.updateSubscriptionStatus)

// 获取所有认购记录（管理员用）
subscriptionRouter.get('/', subscriptionRouter_Handler.getAllSubscriptions)

// 通知相关路由
subscriptionRouter.get('/notifications/list', subscriptionRouter_Handler.getNotifications)
subscriptionRouter.patch('/notifications/:id/read', subscriptionRouter_Handler.markNotificationAsRead)
subscriptionRouter.post('/notifications/clear', subscriptionRouter_Handler.clearNotifications)

module.exports = subscriptionRouter
