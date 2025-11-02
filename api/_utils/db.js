// api/_utils/db.js - 数据库连接工具 (Supabase - 支持多种连接方式)

// 方式1: 数据库直连 (推荐 - 性能最好)
// 方式2: REST API (备选 - 更简单但性能较低)

const USE_REST_API = !process.env.SUPABASE_DB_URL && process.env.SUPABASE_URL

if (USE_REST_API) {
  console.log('⚠️ 使用 Supabase REST API 模式 (建议升级到数据库直连)')
  const supabaseClient = require('./supabase-client')

  // 将 REST API 查询转换为类似 SQL 的接口
  async function query(sql, params = []) {
    // 简单的 SQL 解析 (仅支持基本查询)
    const selectMatch = sql.match(/SELECT \* FROM "?(\w+)"?(?: WHERE (.+))?/i)
    const insertMatch = sql.match(/INSERT INTO "?(\w+)"? \((.*?)\) VALUES \((.*?)\)/i)

    if (selectMatch) {
      const table = selectMatch[1]
      const filters = {}

      // 解析 WHERE 条件
      if (selectMatch[2] && params.length > 0) {
        const condition = selectMatch[2]
        const fieldMatch = condition.match(/(\w+)\s*=\s*\$1/i)
        if (fieldMatch) {
          filters[fieldMatch[1]] = params[0]
        }
      }

      return await supabaseClient.select(table, { filters })
    }

    if (insertMatch) {
      const table = insertMatch[1]
      const fields = insertMatch[2].split(',').map(f => f.trim())
      const values = params

      const data = {}
      fields.forEach((field, i) => {
        data[field] = values[i]
      })

      return await supabaseClient.insert(table, data)
    }

    throw new Error('不支持的 SQL 查询类型,请使用数据库直连模式')
  }

  module.exports = {
    query,
    getPool: () => null
  }

} else {
  // 数据库直连模式
  const { Pool } = require('pg')
  let pool = null

  function getPool() {
    if (!pool) {
      if (process.env.SUPABASE_DB_URL) {
        pool = new Pool({
          connectionString: process.env.SUPABASE_DB_URL,
          ssl: {
            rejectUnauthorized: false
          },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        })
        console.log('✅ Supabase 数据库直连已建立 (推荐模式)')
      } else {
        pool = new Pool({
          host: process.env.SUPABASE_DB_HOST,
          port: process.env.SUPABASE_DB_PORT || 5432,
          user: process.env.SUPABASE_DB_USER || 'postgres',
          password: process.env.SUPABASE_DB_PASSWORD,
          database: process.env.SUPABASE_DB_NAME || 'postgres',
          ssl: {
            rejectUnauthorized: false
          },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        })
        console.log('✅ Supabase 数据库直连已建立 (配置参数模式)')
      }
    }
    return pool
  }

  async function query(sql, params = []) {
    const client = await getPool().connect()
    try {
      const result = await client.query(sql, params)
      return result.rows
    } finally {
      client.release()
    }
  }

  module.exports = {
    query,
    getPool
  }
}
