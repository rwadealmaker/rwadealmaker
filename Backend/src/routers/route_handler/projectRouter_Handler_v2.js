const db = require("../../database/index");

// =====================================================
// Project Active (已代币化RWA项目) API
// =====================================================

/**
 * 新增已代币化项目
 * POST /project/active
 */
async function insertProjectActive(req, res) {
  const project = req.body;

  // 定义允许写入的字段
  const fields = [
    "project_code", "project_name", "property_summary", "status",
    "total_offering_token", "subscribe_token", "token_price",
    "loan_amount", "interest_rate", "loan_term_months", "lvr",
    "property_location", "property_state", "property_type", "property_value",
    "loan_type", "loan_product", "loan_purpose", "mortgage_type",
    "borrower", "lender", "issuer", "guarantor",
    "collateral", "security_rank",
    "commencement_date", "expiry_date", "drawdown_date", "expected_recovery_date",
    "repayment_arrangement", "early_repayment", "early_repayment_details",
    "default_interest_rate", "default_triggers", "default_process",
    "valuation_report", "mortgage_deed", "issuer_token", "loan_token",
    "principal_token_address", "interest_token_address", "loan_issuer_address",
    "created_by"
  ];

  const columns = fields.join(", ");
  const placeholders = fields.map(() => "?").join(", ");
  const sql = `INSERT INTO project_active (${columns}) VALUES (${placeholders})`;

  const values = fields.map(field => project[field] || null);

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("新增已代币化项目失败:", err);
      return res.cc("新增已代币化项目失败: " + err.message);
    }
    console.log("新增已代币化项目成功:", project.project_name);
    res.send({
      status: 0,
      message: `新增已代币化项目 ${project.project_name} 成功`,
      code: project.project_code || results.insertId
    });
  });
}

/**
 * 查询所有已代币化项目
 * GET /project/active
 */
async function selectProjectActive(req, res) {
  const sql = `SELECT * FROM project_active ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("查询已代币化项目失败:", err);
      return res.cc("查询已代币化项目失败");
    }
    console.log("查询已代币化项目成功, 共", results.length, "个");
    res.send({ status: 0, message: "查询已代币化项目成功", data: results });
  });
}

/**
 * 根据code查询已代币化项目
 * GET /project/active/:code
 */
async function selectProjectActiveByCode(req, res) {
  const { code } = req.params;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  const sql = `SELECT * FROM project_active WHERE project_code = ?`;
  db.query(sql, [code], (err, results) => {
    if (err) {
      console.error("查询已代币化项目失败:", err);
      return res.cc("查询已代币化项目失败");
    }
    if (results.length === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("根据 code 查询已代币化项目成功:", code);
    res.send({ status: 0, message: "查询项目成功", data: results[0] });
  });
}

/**
 * 更新已代币化项目
 * PUT /project/active/:code
 */
async function updateProjectActive(req, res) {
  const { code } = req.params;
  const updates = req.body;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  // 允许更新的字段
  const allowedFields = [
    "project_name", "property_summary", "status",
    "subscribe_token", "token_price",
    "property_value", "interest_rate",
    "principal_token_address", "interest_token_address", "loan_issuer_address",
    "updated_by"
  ];

  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(updates[field]);
    }
  });

  if (updateFields.length === 0) {
    return res.cc("没有提供需要更新的字段");
  }

  updateValues.push(code);
  const sql = `UPDATE project_active SET ${updateFields.join(", ")} WHERE project_code = ?`;

  db.query(sql, updateValues, (err, results) => {
    if (err) {
      console.error("更新已代币化项目失败:", err);
      return res.cc("更新已代币化项目失败");
    }
    if (results.affectedRows === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("更新已代币化项目成功:", code);
    res.send({ status: 0, message: "更新项目成功" });
  });
}

// =====================================================
// Project Incoming (待代币化RWA项目) API
// =====================================================

/**
 * 新增待代币化项目
 * POST /project/incoming
 */
async function insertProjectIncoming(req, res) {
  const project = req.body;

  const fields = [
    "project_code", "project_name", "property_summary", "status",
    "estimated_total_token", "estimated_token_price",
    "loan_amount", "interest_rate", "loan_term_months", "lvr",
    "property_location", "property_state", "property_type", "property_value",
    "loan_type", "loan_product", "loan_purpose", "mortgage_type",
    "borrower", "lender", "issuer", "guarantor",
    "collateral", "security_rank",
    "expected_commencement_date", "expected_expiry_date", "expected_drawdown_date",
    "repayment_arrangement", "early_repayment", "early_repayment_details",
    "default_interest_rate", "default_triggers", "default_process",
    "valuation_report", "mortgage_deed",
    "review_notes", "created_by"
  ];

  const columns = fields.join(", ");
  const placeholders = fields.map(() => "?").join(", ");
  const sql = `INSERT INTO project_incoming (${columns}) VALUES (${placeholders})`;

  const values = fields.map(field => project[field] || null);

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("新增待代币化项目失败:", err);
      return res.cc("新增待代币化项目失败: " + err.message);
    }
    console.log("新增待代币化项目成功:", project.project_name);
    res.send({
      status: 0,
      message: `新增待代币化项目 ${project.project_name} 成功`,
      code: project.project_code || results.insertId
    });
  });
}

/**
 * 查询所有待代币化项目
 * GET /project/incoming
 */
async function selectProjectIncoming(req, res) {
  const sql = `SELECT * FROM project_incoming ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("查询待代币化项目失败:", err);
      return res.cc("查询待代币化项目失败");
    }
    console.log("查询待代币化项目成功, 共", results.length, "个");
    res.send({ status: 0, message: "查询待代币化项目成功", data: results });
  });
}

/**
 * 根据code查询待代币化项目
 * GET /project/incoming/:code
 */
async function selectProjectIncomingByCode(req, res) {
  const { code } = req.params;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  const sql = `SELECT * FROM project_incoming WHERE project_code = ?`;
  db.query(sql, [code], (err, results) => {
    if (err) {
      console.error("查询待代币化项目失败:", err);
      return res.cc("查询待代币化项目失败");
    }
    if (results.length === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("根据 code 查询待代币化项目成功:", code);
    res.send({ status: 0, message: "查询项目成功", data: results[0] });
  });
}

/**
 * 更新待代币化项目
 * PUT /project/incoming/:code
 */
async function updateProjectIncoming(req, res) {
  const { code } = req.params;
  const updates = req.body;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  const allowedFields = [
    "project_name", "property_summary", "status",
    "estimated_total_token", "estimated_token_price",
    "property_value", "interest_rate",
    "review_notes", "approved_by", "approved_at",
    "updated_by"
  ];

  const updateFields = [];
  const updateValues = [];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(updates[field]);
    }
  });

  if (updateFields.length === 0) {
    return res.cc("没有提供需要更新的字段");
  }

  updateValues.push(code);
  const sql = `UPDATE project_incoming SET ${updateFields.join(", ")} WHERE project_code = ?`;

  db.query(sql, updateValues, (err, results) => {
    if (err) {
      console.error("更新待代币化项目失败:", err);
      return res.cc("更新待代币化项目失败");
    }
    if (results.affectedRows === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("更新待代币化项目成功:", code);
    res.send({ status: 0, message: "更新项目成功" });
  });
}

/**
 * 审批待代币化项目
 * POST /project/incoming/:code/approve
 */
async function approveProjectIncoming(req, res) {
  const { code } = req.params;
  const { approved_by, review_notes } = req.body;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  if (!approved_by) {
    return res.cc("缺少审批人信息");
  }

  const sql = `
    UPDATE project_incoming
    SET status = 'APPROVED',
        approved_by = ?,
        approved_at = NOW(),
        review_notes = ?
    WHERE project_code = ?
  `;

  db.query(sql, [approved_by, review_notes || null, code], (err, results) => {
    if (err) {
      console.error("审批项目失败:", err);
      return res.cc("审批项目失败");
    }
    if (results.affectedRows === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("审批项目成功:", code);
    res.send({ status: 0, message: "项目审批通过" });
  });
}

/**
 * 拒绝待代币化项目
 * POST /project/incoming/:code/reject
 */
async function rejectProjectIncoming(req, res) {
  const { code } = req.params;
  const { approved_by, review_notes } = req.body;

  if (!code) {
    return res.cc("缺少参数 code");
  }

  if (!review_notes) {
    return res.cc("拒绝项目需要提供原因");
  }

  const sql = `
    UPDATE project_incoming
    SET status = 'REJECTED',
        approved_by = ?,
        approved_at = NOW(),
        review_notes = ?
    WHERE project_code = ?
  `;

  db.query(sql, [approved_by || 'system', review_notes, code], (err, results) => {
    if (err) {
      console.error("拒绝项目失败:", err);
      return res.cc("拒绝项目失败");
    }
    if (results.affectedRows === 0) {
      return res.cc("未找到对应项目");
    }
    console.log("拒绝项目成功:", code);
    res.send({ status: 0, message: "项目已拒绝" });
  });
}

// =====================================================
// 导出所有函数
// =====================================================
module.exports = {
  // Active项目相关
  insertProjectActive,
  selectProjectActive,
  selectProjectActiveByCode,
  updateProjectActive,

  // Incoming项目相关
  insertProjectIncoming,
  selectProjectIncoming,
  selectProjectIncomingByCode,
  updateProjectIncoming,
  approveProjectIncoming,
  rejectProjectIncoming
};
