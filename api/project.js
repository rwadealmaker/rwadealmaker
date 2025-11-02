// api/project.js - 统一的项目管理 API
const { query } = require('./_utils/db')
const { success, error, setCORS } = require('./_utils/response')

module.exports = async (req, res) => {
  setCORS(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  try {
    // GET /api/project/select - 获取所有项目
    if (pathname === '/api/project/select' && method === 'GET') {
      const sql = `
        SELECT *, 'active' as source FROM project_active
        UNION ALL
        SELECT *, 'incoming' as source FROM project_incoming
        ORDER BY created_at DESC
      `
      const results = await query(sql, [])
      return success(res, results, 'Projects retrieved successfully')
    }

    // GET /api/project/active - 获取已代币化项目
    if (pathname === '/api/project/active' && method === 'GET') {
      const sql = 'SELECT * FROM project_active ORDER BY created_at DESC'
      const results = await query(sql, [])
      return success(res, results, 'Active projects retrieved successfully')
    }

    // GET /api/project/incoming - 获取待代币化项目
    if (pathname === '/api/project/incoming' && method === 'GET') {
      const sql = 'SELECT * FROM project_incoming ORDER BY created_at DESC'
      const results = await query(sql, [])
      return success(res, results, 'Incoming projects retrieved successfully')
    }

    // GET /api/project/select/:code - 根据代码获取项目
    const selectCodeMatch = pathname.match(/^\/api\/project\/select\/([^\/]+)$/)
    if (selectCodeMatch && method === 'GET') {
      const code = selectCodeMatch[1]
      const sql = `
        SELECT *, 'active' as source FROM project_active WHERE code = $1
        UNION ALL
        SELECT *, 'incoming' as source FROM project_incoming WHERE code = $1
        LIMIT 1
      `
      const results = await query(sql, [code])
      
      if (results.length === 0) {
        return error(res, 'Project not found', 404)
      }

      return success(res, results[0], 'Project retrieved successfully')
    }

    // GET /api/project/:code/contracts - 获取项目合约地址
    const contractsMatch = pathname.match(/^\/api\/project\/([^\/]+)\/contracts$/)
    if (contractsMatch && method === 'GET') {
      const code = contractsMatch[1]
      const sql = `
        SELECT 
          contract_address_token,
          contract_address_kyc,
          contract_address_loan
        FROM project_active 
        WHERE code = $1
      `
      const results = await query(sql, [code])

      if (results.length === 0) {
        return error(res, 'Project contracts not found', 404)
      }

      return success(res, results[0], 'Contracts retrieved successfully')
    }

    return error(res, 'Route not found', 404)

  } catch (err) {
    console.error('Project API Error:', err)
    return error(res, err.message || 'Internal server error', 500)
  }
}
