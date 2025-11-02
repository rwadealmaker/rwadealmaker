// api/_utils/db.js - Supabase 数据库连接 (Serverless 优化)

const { Pool } = require('pg')

let pool = null

function getPool() {
  if (!pool) {
    const connectionString = process.env.SUPABASE_DB_URL

    if (!connectionString) {
      throw new Error('Missing SUPABASE_DB_URL environment variable')
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1, // Serverless 环境使用单连接
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err)
      pool = null
    })

    console.log('✅ Supabase connection initialized')
  }
  return pool
}

// 统一查询接口 (兼容 MySQL 风格)
async function query(sql, params = []) {
  const client = await getPool().connect()
  try {
    const result = await client.query(sql, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  } finally {
    client.release()
  }
}

// 关闭连接池 (Serverless 中不常用,但保留以防需要)
async function end() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

module.exports = {
  query,
  getPool,
  end
}
