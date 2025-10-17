const express = require('express')
const projectRouter = express.Router()

//导入添加项目路由处理函数
const projectRouterHandler = require('./route_handler/projectRouter_Handler')

//添加项目
projectRouter.post('/insert', projectRouterHandler.insertProject)

//查询项目
projectRouter.get('/select', projectRouterHandler.selectProject)

//根据code查询项目
projectRouter.get('/select/:code', projectRouterHandler.selectProjectByCode)

module.exports = projectRouter