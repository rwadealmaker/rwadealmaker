const mysql = require('mysql2/promise')
const fetch = require('node-fetch')

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'rwa_project',
  port: 3306
}

// API配置
const API_BASE_URL = 'http://localhost:3000'

/**
 * 测试认购信息储存功能
 */
async function testSubscriptionStorage() {
  console.log('🧪 开始测试认购信息储存功能...\n')
  
  try {
    // 1. 首先测试数据库连接
    await testDatabaseConnection()
    
    // 2. 测试API服务器连接
    await testAPIConnection()
    
    // 3. 创建测试认购数据
    const testSubscriptionData = {
      user_id: 'test_user_001',
      user_name: '测试用户',
      user_email: 'test@example.com',
      user_wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      project_code: 'RWA001',
      project_name: '澳洲住房贷款项目',
      trade_type: 'BUY_TOKEN',
      token_amount: 1000.50,
      interest_rate: 7.00,
      expected_return: 'AUD70.00',
      token_address_native: '0xA41b4F0417d588a08F914Ca17b07c99783D5c3FC',
      token_address_interest: '0x9d3175E3F8c055389e070e058f717D450bB89206',
      loan_issuer_address: '0x1234567890abcdef1234567890abcdef12345678',
      subscription_date: new Date().toISOString(),
      status: 'PENDING'
    }
    
    // 4. 测试创建认购记录
    await testCreateSubscription(testSubscriptionData)
    
    // 5. 测试获取用户认购记录
    await testGetUserSubscriptions(testSubscriptionData.user_id)
    
    // 6. 测试更新认购状态
    const subscriptionId = await getLatestSubscriptionId(testSubscriptionData.user_id)
    if (subscriptionId) {
      await testUpdateSubscriptionStatus(subscriptionId)
    }
    
    console.log('\n✅ 所有测试完成！')
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
  }
}

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  console.log('📊 测试数据库连接...')
  
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    // 测试查询subscriptions表
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM subscriptions')
    console.log(`✅ 数据库连接成功，当前认购记录数: ${rows[0].count}`)
    
    await connection.end()
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    throw error
  }
}

/**
 * 测试API服务器连接
 */
async function testAPIConnection() {
  console.log('🌐 测试API服务器连接...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions`)
    
    if (response.ok) {
      console.log('✅ API服务器连接成功')
    } else {
      console.log(`⚠️ API服务器响应: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ API服务器连接失败:', error.message)
    throw error
  }
}

/**
 * 测试创建认购记录
 */
async function testCreateSubscription(subscriptionData) {
  console.log('📝 测试创建认购记录...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    })
    
    const result = await response.json()
    
    if (response.ok && result.status === 0) {
      console.log('✅ 认购记录创建成功')
      console.log(`   记录ID: ${result.data.id}`)
      console.log(`   用户ID: ${subscriptionData.user_id}`)
      console.log(`   项目代码: ${subscriptionData.project_code}`)
      console.log(`   认购金额: ${subscriptionData.token_amount}`)
    } else {
      console.error('❌ 认购记录创建失败:', result.message)
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('❌ 创建认购记录测试失败:', error.message)
    throw error
  }
}

/**
 * 测试获取用户认购记录
 */
async function testGetUserSubscriptions(userId) {
  console.log(`📋 测试获取用户认购记录 (${userId})...`)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/user/${userId}`)
    const result = await response.json()
    
    if (response.ok && result.status === 0) {
      console.log('✅ 获取用户认购记录成功')
      console.log(`   记录数量: ${result.data.length}`)
      
      if (result.data.length > 0) {
        const latestRecord = result.data[0]
        console.log(`   最新记录ID: ${latestRecord.id}`)
        console.log(`   状态: ${latestRecord.status}`)
        console.log(`   创建时间: ${latestRecord.created_at}`)
      }
    } else {
      console.error('❌ 获取用户认购记录失败:', result.message)
    }
  } catch (error) {
    console.error('❌ 获取用户认购记录测试失败:', error.message)
  }
}

/**
 * 测试更新认购状态
 */
async function testUpdateSubscriptionStatus(subscriptionId) {
  console.log(`🔄 测试更新认购状态 (ID: ${subscriptionId})...`)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    })
    
    const result = await response.json()
    
    if (response.ok && result.status === 0) {
      console.log('✅ 认购状态更新成功')
      console.log(`   新状态: ${result.data.status}`)
    } else {
      console.error('❌ 认购状态更新失败:', result.message)
    }
  } catch (error) {
    console.error('❌ 更新认购状态测试失败:', error.message)
  }
}

/**
 * 获取最新的认购记录ID
 */
async function getLatestSubscriptionId(userId) {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT id FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    )
    
    await connection.end()
    
    return rows.length > 0 ? rows[0].id : null
  } catch (error) {
    console.error('获取认购记录ID失败:', error.message)
    return null
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log('🧹 清理测试数据...')
  
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    const [result] = await connection.execute(
      'DELETE FROM subscriptions WHERE user_id = ?',
      ['test_user_001']
    )
    
    console.log(`✅ 清理完成，删除了 ${result.affectedRows} 条测试记录`)
    
    await connection.end()
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error.message)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSubscriptionStorage()
    .then(() => {
      // 询问是否清理测试数据
      console.log('\n是否清理测试数据？(y/n)')
      process.stdin.once('data', async (data) => {
        if (data.toString().trim().toLowerCase() === 'y') {
          await cleanupTestData()
        }
        process.exit(0)
      })
    })
    .catch((error) => {
      console.error('测试失败:', error)
      process.exit(1)
    })
}

module.exports = {
  testSubscriptionStorage,
  testCreateSubscription,
  testGetUserSubscriptions,
  testUpdateSubscriptionStatus,
  cleanupTestData
}
