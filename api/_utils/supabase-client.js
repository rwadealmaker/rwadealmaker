// api/_utils/supabase-client.js - Supabase REST API 客户端 (备选方案)
// 如果无法使用数据库直连,可以使用此方案

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY

/**
 * 执行 Supabase REST API 查询
 * @param {string} table - 表名
 * @param {object} options - 查询选项
 */
async function query(table, options = {}) {
  const { method = 'GET', body = null, select = '*', filters = {}, limit = null } = options

  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`

  // 添加过滤条件
  Object.entries(filters).forEach(([key, value]) => {
    url += `&${key}=eq.${value}`
  })

  // 添加限制
  if (limit) {
    url += `&limit=${limit}`
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }

  const config = {
    method,
    headers
  }

  if (body && (method === 'POST' || method === 'PATCH')) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Supabase error: ${error}`)
  }

  return await response.json()
}

/**
 * 插入数据
 */
async function insert(table, data) {
  return query(table, { method: 'POST', body: data })
}

/**
 * 查询数据
 */
async function select(table, options = {}) {
  return query(table, { method: 'GET', ...options })
}

/**
 * 更新数据
 */
async function update(table, filters, data) {
  return query(table, { method: 'PATCH', filters, body: data })
}

/**
 * 删除数据
 */
async function remove(table, filters) {
  return query(table, { method: 'DELETE', filters })
}

module.exports = {
  query,
  insert,
  select,
  update,
  remove
}
