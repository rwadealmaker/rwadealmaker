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
      console.log('🔍 [API] 查询所有项目')

      try {
        // 分别查询两个表，然后合并
        const activeSql = `SELECT *, 'active' as source FROM project_active ORDER BY created_at DESC`
        const incomingSql = `SELECT *, 'incoming' as source FROM project_incoming ORDER BY created_at DESC`

        const activeResults = await query(activeSql, [])
        const incomingResults = await query(incomingSql, [])

        // 合并结果
        const results = [...activeResults, ...incomingResults]

        console.log(`✅ [API] 返回 ${activeResults.length} 个 active 项目, ${incomingResults.length} 个 incoming 项目`)
        return success(res, results, 'Projects retrieved successfully')

      } catch (err) {
        console.error('❌ [API] 查询所有项目失败:', err.message)
        throw err
      }
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
      console.log(`🔍 [API] 查询项目: ${code}`)

      try {
        // 先尝试在 active 表中查找
        const activeSql = `
          SELECT *, 'active' as source
          FROM project_active
          WHERE project_code = $1
          LIMIT 1
        `
        let results = await query(activeSql, [code])

        // 如果没找到，再尝试 incoming 表
        if (results.length === 0) {
          console.log(`⚠️  [API] 在 project_active 中未找到 ${code}，尝试 project_incoming`)
          const incomingSql = `
            SELECT *, 'incoming' as source
            FROM project_incoming
            WHERE project_code = $1
            LIMIT 1
          `
          results = await query(incomingSql, [code])
        } else {
          console.log(`✅ [API] 在 project_active 中找到 ${code}`)
        }

        if (results.length === 0) {
          console.log(`❌ [API] 项目不存在: ${code}`)
          return error(res, 'Project not found', 404)
        }

        console.log(`✅ [API] 成功返回项目 ${code}`)
        return success(res, results[0], 'Project retrieved successfully')

      } catch (err) {
        console.error(`❌ [API] 查询项目 ${code} 失败:`, err.message)
        throw err
      }
    }

    // GET /api/project/:code/contracts - 获取项目合约地址
    const contractsMatch = pathname.match(/^\/api\/project\/([^\/]+)\/contracts$/)
    if (contractsMatch && method === 'GET') {
      const code = contractsMatch[1]
      console.log(`🔍 [API] 查询项目合约: ${code}`)

      const sql = `
        SELECT
          principal_token_address,
          interest_token_address,
          loan_issuer_address,
          kyc_registry_address
        FROM project_active
        WHERE project_code = $1
      `
      const results = await query(sql, [code])

      if (results.length === 0) {
        console.log(`❌ [API] 项目合约不存在: ${code}`)
        return error(res, 'Project contracts not found', 404)
      }

      console.log(`✅ [API] 成功返回项目合约 ${code}`)
      return success(res, results[0], 'Contracts retrieved successfully')
    }

    return error(res, 'Route not found', 404)

  } catch (err) {
    console.error('Project API Error:', err)
    return error(res, err.message || 'Internal server error', 500)
  }
}
