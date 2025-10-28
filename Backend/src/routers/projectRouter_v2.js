const express = require('express')
const projectRouter = express.Router()

// 导入新的项目路由处理函数
const projectRouterHandler = require('./route_handler/projectRouter_Handler_v2')

// =====================================================
// Project Active (已代币化RWA) 路由
// =====================================================

// 添加已代币化项目
projectRouter.post('/active', projectRouterHandler.insertProjectActive)

// 查询所有已代币化项目
projectRouter.get('/active', projectRouterHandler.selectProjectActive)

// 根据code查询已代币化项目
projectRouter.get('/active/:code', projectRouterHandler.selectProjectActiveByCode)

// 更新已代币化项目
projectRouter.put('/active/:code', projectRouterHandler.updateProjectActive)


// =====================================================
// Project Incoming (待代币化RWA) 路由
// =====================================================

// 添加待代币化项目
projectRouter.post('/incoming', projectRouterHandler.insertProjectIncoming)

// 查询所有待代币化项目
projectRouter.get('/incoming', projectRouterHandler.selectProjectIncoming)

// 根据code查询待代币化项目
projectRouter.get('/incoming/:code', projectRouterHandler.selectProjectIncomingByCode)

// 更新待代币化项目
projectRouter.put('/incoming/:code', projectRouterHandler.updateProjectIncoming)

// 审批待代币化项目
projectRouter.post('/incoming/:code/approve', projectRouterHandler.approveProjectIncoming)

// 拒绝待代币化项目
projectRouter.post('/incoming/:code/reject', projectRouterHandler.rejectProjectIncoming)


// =====================================================
// 兼容旧路由 (向后兼容)
// =====================================================

// 旧路由: POST /project/insert -> 根据数据判断插入到哪个表
projectRouter.post('/insert', (req, res) => {
  const { loan_status, status } = req.body
  const projectStatus = status || loan_status

  // 根据状态判断插入到哪个表
  if (projectStatus === 'INCOMING' || projectStatus === 'UNDER_REVIEW') {
    return projectRouterHandler.insertProjectIncoming(req, res)
  } else {
    return projectRouterHandler.insertProjectActive(req, res)
  }
})

// 旧路由: GET /project/select -> 查询所有项目（合并两个表）
projectRouter.get('/select', (req, res) => {
  const db = require('../database/index')

  const sql = `
    SELECT
      project_code, project_name, property_summary, status,
      'ACTIVE' as project_category,
      total_offering_token, subscribe_token,
      loan_amount, interest_rate, loan_term_months,
      property_location, property_type, property_value,
      created_at, updated_at
    FROM project_active
    UNION ALL
    SELECT
      project_code, project_name, property_summary, status,
      'INCOMING' as project_category,
      estimated_total_token as total_offering_token, 0 as subscribe_token,
      loan_amount, interest_rate, loan_term_months,
      property_location, property_type, property_value,
      created_at, updated_at
    FROM project_incoming
    ORDER BY created_at DESC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error("查询所有项目失败:", err)
      return res.cc("查询所有项目失败")
    }
    console.log("查询所有项目成功, 共", results.length, "个")
    res.send({ status: 0, message: "查询项目成功", data: results })
  })
})

// 旧路由: GET /project/select/:code -> 根据code前缀判断查询哪个表
projectRouter.get('/select/:code', (req, res) => {
  const { code } = req.params

  if (!code) {
    return res.cc("缺少参数 code")
  }

  // 判断是RWAT开头（active）还是RWA开头（incoming）
  if (code.startsWith('RWAT')) {
    return projectRouterHandler.selectProjectActiveByCode(req, res)
  } else if (code.startsWith('RWA')) {
    return projectRouterHandler.selectProjectIncomingByCode(req, res)
  } else {
    // 兼容旧代码，同时查询两个表
    const db = require('../database/index')
    const sql1 = `SELECT * FROM project_active WHERE project_code = ?`
    const sql2 = `SELECT * FROM project_incoming WHERE project_code = ?`

    db.query(sql1, [code], (err1, results1) => {
      if (!err1 && results1.length > 0) {
        return res.send({ status: 0, message: "查询项目成功", data: results1[0] })
      }

      db.query(sql2, [code], (err2, results2) => {
        if (!err2 && results2.length > 0) {
          return res.send({ status: 0, message: "查询项目成功", data: results2[0] })
        }

        return res.cc("未找到对应项目")
      })
    })
  }
})

module.exports = projectRouter
