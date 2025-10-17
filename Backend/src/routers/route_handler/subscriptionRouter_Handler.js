const mysql = require('mysql2/promise')

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'rwa',
  port: 3306
}

/**
 * 创建新的认购记录
 */
async function createSubscription(req, res) {
  try {
    console.log('📝 收到认购创建请求:', req.body)
    
    const {
      user_id,
      user_name,
      user_email,
      user_wallet_address,
      project_code,
      project_name,
      trade_type,
      token_amount,
      interest_rate,
      expected_return,
      token_address_native,
      token_address_interest,
      loan_issuer_address,
      subscription_date,
      status = 'PENDING'
    } = req.body

    // 验证必需字段
    if (!user_id || !project_code || !token_amount || !user_wallet_address) {
      return res.status(400).json({
        status: 1,
        message: '缺少必需字段: user_id, project_code, token_amount, user_wallet_address'
      })
    }

    // 创建数据库连接
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // 插入认购记录（匹配用户提供的完整表结构）
      const query = `
        INSERT INTO subscriptions (
          user_id, user_wallet_address, project_code, project_name,
          trade_type, token_address, loan_issuer_address, network,
          token_amount, interest_rate, expected_return, status,
          status_reason, admin_notes, latest_tx_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const values = [
        user_id ? parseInt(user_id) : null, // 用户ID可以为NULL
        user_wallet_address,
        project_code,
        project_name,
        trade_type,
        token_address_native, // 使用token_address字段
        loan_issuer_address,
        'SEPOLIA', // 默认网络
        parseFloat(token_amount),
        interest_rate ? parseFloat(interest_rate) : null,
        expected_return,
        'APPLIED', // 默认状态为已申请
        null, // status_reason
        null, // admin_notes
        null  // latest_tx_hash
      ]

      const [result] = await connection.execute(query, values)
      
      console.log('✅ 认购记录创建成功:', result.insertId)
      
      // 创建认购成功通知
      try {
        await createSubscriptionSuccessNotification(connection, {
          user_id: user_id,
          user_wallet_address: user_wallet_address,
          subscription_id: result.insertId,
          project_code: project_code,
          project_name: project_name,
          token_amount: token_amount
        })
        console.log('✅ 认购成功通知已创建')
      } catch (notificationError) {
        console.error('⚠️ 创建通知失败，但不影响认购:', notificationError.message)
      }
      
      // 返回成功响应
      res.status(201).json({
        status: 0,
        message: '认购记录创建成功',
        data: {
          id: result.insertId,
          subscription_id: result.insertId
        }
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 创建认购记录失败:', error)
    res.status(500).json({
      status: 1,
      message: '创建认购记录失败: ' + error.message
    })
  }
}

/**
 * 获取用户的所有认购记录
 */
async function getUserSubscriptions(req, res) {
  try {
    const { userId } = req.params
    console.log('📋 获取用户认购记录:', userId)
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      const query = `
        SELECT * FROM subscriptions 
        WHERE user_id = ? 
        ORDER BY subscription_date DESC
      `
      
      const [rows] = await connection.execute(query, [userId])
      
      res.json({
        status: 0,
        message: '获取用户认购记录成功',
        data: rows
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 获取用户认购记录失败:', error)
    res.status(500).json({
      status: 1,
      message: '获取用户认购记录失败: ' + error.message
    })
  }
}

/**
 * 获取特定认购记录的详情
 */
async function getSubscriptionById(req, res) {
  try {
    const { id } = req.params
    console.log('📄 获取认购记录详情:', id)
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      const query = `
        SELECT * FROM subscriptions 
        WHERE id = ?
      `
      
      const [rows] = await connection.execute(query, [id])
      
      if (rows.length === 0) {
        return res.status(404).json({
          status: 1,
          message: '认购记录不存在'
        })
      }
      
      res.json({
        status: 0,
        message: '获取认购记录详情成功',
        data: rows[0]
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 获取认购记录详情失败:', error)
    res.status(500).json({
      status: 1,
      message: '获取认购记录详情失败: ' + error.message
    })
  }
}

/**
 * 更新认购状态
 */
async function updateSubscriptionStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body
    
    console.log('🔄 更新认购状态:', { id, status })
    
    if (!status) {
      return res.status(400).json({
        status: 1,
        message: '缺少status字段'
      })
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      const query = `
        UPDATE subscriptions 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `
      
      const [result] = await connection.execute(query, [status, id])
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 1,
          message: '认购记录不存在'
        })
      }
      
      res.json({
        status: 0,
        message: '认购状态更新成功',
        data: { id, status }
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 更新认购状态失败:', error)
    res.status(500).json({
      status: 1,
      message: '更新认购状态失败: ' + error.message
    })
  }
}

/**
 * 获取所有认购记录（管理员用）
 */
async function getAllSubscriptions(req, res) {
  try {
    console.log('📊 获取所有认购记录')
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      const query = `
        SELECT * FROM subscriptions 
        ORDER BY created_at DESC
      `
      
      const [rows] = await connection.execute(query)
      
      res.json({
        status: 0,
        message: '获取所有认购记录成功',
        data: {
          subscriptions: rows
        }
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 获取所有认购记录失败:', error)
    res.status(500).json({
      status: 1,
      message: '获取所有认购记录失败: ' + error.message
    })
  }
}

/**
 * 创建认购成功通知
 */
async function createSubscriptionSuccessNotification(connection, notificationData) {
  try {
    const {
      user_id,
      user_wallet_address,
      subscription_id,
      project_code,
      project_name,
      token_amount
    } = notificationData

    // 创建通知记录
    const notificationQuery = `
      INSERT INTO notifications (
        user_id, user_wallet_address, subscription_id, type, title, body, 
        payload, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `
    
    const notificationValues = [
      user_id,
      user_wallet_address,
      subscription_id,
      'SUBSCRIPTION_APPLIED', // 通知类型
      '认购申请成功', // 通知标题
      `您的 ${project_name} (${project_code}) 认购申请已成功提交，认购数量：${token_amount} 代币。我们将在1-3个工作日内完成审核，请耐心等待。`, // 通知内容
      JSON.stringify({
        project_code: project_code,
        project_name: project_name,
        token_amount: token_amount,
        subscription_id: subscription_id
      }), // 额外数据
      0 // 未读状态
    ]
    
    await connection.execute(notificationQuery, notificationValues)
    console.log('✅ 认购成功通知创建完成')
    
  } catch (error) {
    console.error('❌ 创建认购成功通知失败:', error.message)
    throw error
  }
}

/**
 * 获取用户通知列表
 */
async function getNotifications(req, res) {
  try {
    const { user_id, user_wallet_address } = req.query
    console.log('📋 获取用户通知列表:', { user_id, user_wallet_address })
    
    if (!user_id && !user_wallet_address) {
      return res.status(400).json({
        status: 1,
        message: '缺少用户标识参数'
      })
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // 首先获取用户的清除时间戳
      let clearTimestamp = null
      const clearQuery = `
        SELECT clear_timestamp FROM user_notification_clear 
        WHERE 1=1
      `
      const clearParams = []
      
      if (user_id) {
        clearQuery += ` AND user_id = ?`
        clearParams.push(user_id)
      }
      
      if (user_wallet_address) {
        clearQuery += ` AND user_wallet_address = ?`
        clearParams.push(user_wallet_address)
      }
      
      const [clearRows] = await connection.execute(clearQuery, clearParams)
      if (clearRows.length > 0) {
        clearTimestamp = clearRows[0].clear_timestamp
        console.log('📅 找到用户清除时间戳:', clearTimestamp)
      }
      
      // 构建通知查询
      let query = `
        SELECT * FROM notifications 
        WHERE 1=1
      `
      const params = []
      
      if (user_id) {
        query += ` AND user_id = ?`
        params.push(user_id)
      }
      
      if (user_wallet_address) {
        query += ` AND user_wallet_address = ?`
        params.push(user_wallet_address)
      }
      
      // 如果有清除时间戳，过滤掉该时间戳之前的通知
      if (clearTimestamp) {
        query += ` AND created_at > ?`
        params.push(clearTimestamp)
      }
      
      query += ` ORDER BY created_at DESC`
      
      const [rows] = await connection.execute(query, params)
      
      res.json({
        status: 0,
        message: '获取通知列表成功',
        data: {
          notifications: rows,
          total: rows.length
        }
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 获取通知列表失败:', error)
    res.status(500).json({
      status: 1,
      message: '获取通知列表失败: ' + error.message
    })
  }
}

/**
 * 标记通知为已读
 */
async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params
    console.log('✅ 标记通知为已读:', id)
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      const query = `
        UPDATE notifications 
        SET is_read = 1, updated_at = NOW()
        WHERE id = ?
      `
      
      const [result] = await connection.execute(query, [id])
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 1,
          message: '通知不存在'
        })
      }
      
      res.json({
        status: 0,
        message: '通知已标记为已读',
        data: { id }
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 标记通知为已读失败:', error)
    res.status(500).json({
      status: 1,
      message: '标记通知为已读失败: ' + error.message
    })
  }
}

/**
 * 清除用户通知（通过时间戳）
 */
async function clearNotifications(req, res) {
  try {
    const { user_id, user_wallet_address } = req.query
    const { clear_timestamp } = req.body
    
    console.log('🗑️ 清除用户通知:', { user_id, user_wallet_address, clear_timestamp })
    
    if (!clear_timestamp) {
      return res.status(400).json({
        status: 1,
        message: '缺少clear_timestamp参数'
      })
    }
    
    if (!user_id && !user_wallet_address) {
      return res.status(400).json({
        status: 1,
        message: '缺少用户标识参数'
      })
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // 这里我们创建一个用户清除记录表来记录清除时间戳
      // 首先检查是否需要创建表
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_notification_clear (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NULL,
          user_wallet_address VARCHAR(42) NULL,
          clear_timestamp DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_user_wallet (user_wallet_address)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户通知清除记录表'
      `)
      
      // 插入或更新清除时间戳记录
      const upsertQuery = `
        INSERT INTO user_notification_clear (user_id, user_wallet_address, clear_timestamp)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        clear_timestamp = VALUES(clear_timestamp),
        created_at = CURRENT_TIMESTAMP
      `
      
      const values = [
        user_id || null,
        user_wallet_address || null,
        clear_timestamp
      ]
      
      await connection.execute(upsertQuery, values)
      
      res.json({
        status: 0,
        message: '通知清除时间戳已记录',
        data: {
          clear_timestamp: clear_timestamp
        }
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error('❌ 清除通知失败:', error)
    res.status(500).json({
      status: 1,
      message: '清除通知失败: ' + error.message
    })
  }
}

module.exports = {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus,
  getAllSubscriptions,
  createSubscriptionSuccessNotification,
  getNotifications,
  markNotificationAsRead,
  clearNotifications
}
