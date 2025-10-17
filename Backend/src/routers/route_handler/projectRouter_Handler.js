const db = require("../../database/index");
// 新增项目
async function insertProject(req, res) {
  // 接收传入数据
  const project = req.body;

  // 定义允许写入的字段（防止前端传多余字段）
  const fields = [
    "code", "name", "subtitle",
    "type", "region", "risk", "target_yield", "status", "summary",
    "total_token", "current_subscribed_token",
    "loan_amount", "annual_interest_rate", "loan_term", "LTV", "drawdown_date", "early_repayment", "repayment_arrangement",
    "issuer", "pw_shareholders", "lender", "borrower", "guarantor",
    "disbursement_method", "interest", "early_repayment_details", "maturity_date",
    "property_address", "valuation", "security_rank", "lvr",
    "default_interest_rate", "default_triggers", "default_process",
    "issuer_token", "loan_token", "valuation_report", "mortgage_deed"
  ];

  // 自动拼接字段和占位符,最终生成类似 INSERT INTO project (field1, field2) VALUES (?, ?) 的SQL语句
  const columns = fields.join(", ");
  const placeholders = fields.map(() => "?").join(", ");
  const sql = `INSERT INTO project (${columns}) VALUES (${placeholders})`;

  // 根据字段顺序提取 values
  const values = fields.map(field => project[field] || null);

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("新增项目失败:", err);
      return res.cc("新增项目失败");
    }
    console.log("新增项目成功:", project.name);
    res.send({ status: 0, message: `新增项目 ${project.name} 成功`, code: `${project.code}` });
  });
};

//查询全部项目
async function selectProject(req, res) {
  const sql = `select * from project`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("查询项目失败:", err);
      return res.cc("查询项目失败");
    }
    console.log("查询项目成功");
    res.send({ status: 0, message: "查询项目成功", data: results });
  });
};

// 根据code精确查询
async function selectProjectByCode(req, res) {
  // 从路径参数获取 code，例如 /project/select/RWA004
  const { code } = req.params;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  const sql = `SELECT * FROM project WHERE project_code = ?`;
  db.query(sql, [code], (err, results) => {
    if (err) {
      console.error("查询项目失败:", err);
      return res.cc("查询项目失败");
    }
    if (results.length === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("根据 code 查询项目成功:", code);
    res.send({ status: 0, message: "查询项目成功", data: results[0] });
  });
}

module.exports = { insertProject, selectProject, selectProjectByCode };