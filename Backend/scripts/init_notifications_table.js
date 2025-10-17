const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'rwa',
  port: 3306
}

async function initNotificationsTable() {
  try {
    console.log('🚀 开始初始化通知表...')
    
    // 创建数据库连接
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // 读取SQL文件
      const sqlPath = path.join(__dirname, '../database/create_notifications_table.sql')
      const sqlContent = fs.readFileSync(sqlPath, 'utf8')
      
      // 执行SQL语句
      await connection.query(sqlContent)
      
      console.log('✅ 通知表创建成功!')
      
      // 验证表是否创建成功
      const [tables] = await connection.query("SHOW TABLES LIKE 'notifications'")
      
      if (tables.length > 0) {
        console.log('✅ 验证成功: notifications表已存在')
        
        // 显示表结构
        const [columns] = await connection.query("DESCRIBE notifications")
        console.log('\n📋 表结构:')
        columns.forEach(col => {
          console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `[${col.Key}]` : ''}`)
        })
        
        // 显示索引
        const [indexes] = await connection.query("SHOW INDEX FROM notifications")
        console.log('\n🔗 索引信息:')
        const indexMap = new Map()
        indexes.forEach(idx => {
          if (!indexMap.has(idx.Key_name)) {
            indexMap.set(idx.Key_name, {
              name: idx.Key_name,
              columns: [],
              unique: idx.Non_unique === 0
            })
          }
          indexMap.get(idx.Key_name).columns.push(idx.Column_name)
        })
        
        indexMap.forEach(idx => {
          console.log(`   ${idx.name}: (${idx.columns.join(', ')}) ${idx.unique ? '[UNIQUE]' : ''}`)
        })
        
      } else {
        console.log('❌ 验证失败: notifications表未创建')
      }
      
      console.log('\n🎉 通知表初始化完成！')
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('\n❌ 通知表初始化失败:', error.message)
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 提示: 请检查数据库连接配置')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示: 请确保MySQL服务正在运行')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 提示: 请确保数据库 "rwa" 已创建')
    }
    
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initNotificationsTable()
    .then(() => {
      console.log('\n✅ 初始化完成！')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ 初始化失败:', error.message)
      process.exit(1)
    })
}

module.exports = initNotificationsTable
