const mysql = require('mysql2');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建数据库连接
const connection = mysql.createConnection({
  host: process.env.db_host || process.env.VITE_DB_HOST || 'localhost',
  user: process.env.db_user || process.env.VITE_DB_USER || 'root',
  password: process.env.db_password || process.env.VITE_DB_PASSWORD || '123456',
  database: process.env.db_name || process.env.VITE_DB_NAME || 'rwa',
  port: process.env.db_port || process.env.VITE_DB_PORT || 3306,
});

console.log('🔗 正在连接到MySQL数据库...');
console.log(`📊 数据库: ${process.env.db_name || process.env.VITE_DB_NAME || 'rwa'}`);
console.log(`🏠 主机: ${process.env.db_host || process.env.VITE_DB_HOST || 'localhost'}`);
console.log(`👤 用户: ${process.env.db_user || process.env.VITE_DB_USER || 'root'}`);
console.log('');

// 测试数据库连接
connection.connect((err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }
  
  console.log('✅ 数据库连接成功!');
  console.log('📋 开始测试project表操作...');
  console.log('');
  
  // 执行所有测试
  runAllTests();
});

// 执行所有测试函数
async function runAllTests() {
  try {
    await testTableStructure();
    await testSelectAllProjects();
    await testSelectProjectByCode('RWA001');
    await testSelectProjectByCode('RWA002');
    await testSelectProjectByCode('RWA007');
    await testProjectCount();
    await testProjectStatus();
    await testProjectMetrics();
    await testRecentProjects();
    
    console.log('🎉 所有测试完成!');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    // 关闭数据库连接
    connection.end((err) => {
      if (err) {
        console.error('❌ 关闭数据库连接失败:', err.message);
      } else {
        console.log('🔒 数据库连接已关闭');
      }
    });
  }
}

// 1. 测试表结构
async function testTableStructure() {
  return new Promise((resolve, reject) => {
    console.log('📋 1. 检查project表结构...');
    
    const sql = 'DESCRIBE project';
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('❌ 获取表结构失败:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ project表结构:');
      console.table(results);
      console.log('');
      resolve();
    });
  });
}

// 2. 查询所有项目
async function testSelectAllProjects() {
  return new Promise((resolve, reject) => {
    console.log('📋 2. 查询所有项目...');
    
    const sql = `
      SELECT 
        id, project_code, project_name, loan_status, created_at,
        subscribe_token, total_offering_token,
        property_location, property_type, property_value,
        loan_product, loan_amount, interest_rate, loan_term_months
      FROM project 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('❌ 查询所有项目失败:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ 找到 ${results.length} 个项目:`);
      console.table(results);
      console.log('');
      resolve();
    });
  });
}

// 3. 根据代码查询特定项目
async function testSelectProjectByCode(code) {
  return new Promise((resolve, reject) => {
    console.log(`📋 3. 查询项目 ${code}...`);
    
    const sql = `
      SELECT 
        id, project_code, project_name, loan_status, created_at,
        subscribe_token, total_offering_token,
        property_location, property_state, property_type, property_value, property_summary,
        loan_type, loan_product, loan_amount, loan_purpose,
        loan_term_months, lvr, interest_rate, default_rate,
        commencement_date, expiry_date, expected_recovery_date
      FROM project 
      WHERE project_code = ?
    `;
    
    connection.query(sql, [code], (err, results) => {
      if (err) {
        console.error(`❌ 查询项目 ${code} 失败:`, err.message);
        reject(err);
        return;
      }
      
      if (results.length === 0) {
        console.log(`⚠️ 项目 ${code} 不存在`);
      } else {
        console.log(`✅ 项目 ${code} 详情:`);
        console.log(JSON.stringify(results[0], null, 2));
        
        // 计算认购进度
        const project = results[0];
        if (project.total_offering_token && project.subscribe_token) {
          const progress = (project.subscribe_token / project.total_offering_token * 100).toFixed(2);
          console.log(`📊 认购进度: ${progress}% (${project.subscribe_token}/${project.total_offering_token})`);
        }
      }
      console.log('');
      resolve();
    });
  });
}

// 4. 统计项目数量
async function testProjectCount() {
  return new Promise((resolve, reject) => {
    console.log('📋 4. 统计项目数量...');
    
    const sql = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN loan_status = 'ACTIVE' THEN 1 END) as active_projects,
        COUNT(CASE WHEN loan_status = 'INCOMING' THEN 1 END) as incoming_projects,
        COUNT(CASE WHEN loan_status = 'COMPLETED' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN loan_status = 'COMPLETE' THEN 1 END) as complete_projects,
        COUNT(CASE WHEN loan_status = 'DEFAULT' THEN 1 END) as default_projects
      FROM project
    `;
    
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('❌ 统计项目数量失败:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ 项目统计:');
      console.table(results[0]);
      console.log('');
      resolve();
    });
  });
}

// 5. 按状态分组查询
async function testProjectStatus() {
  return new Promise((resolve, reject) => {
    console.log('📋 5. 按状态分组查询项目...');
    
    const sql = `
      SELECT 
        loan_status,
        COUNT(*) as count,
        AVG(interest_rate) as avg_interest_rate,
        SUM(loan_amount) as total_loan_amount,
        SUM(subscribe_token) as total_subscribed,
        SUM(total_offering_token) as total_offering
      FROM project 
      GROUP BY loan_status
      ORDER BY count DESC
    `;
    
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('❌ 按状态分组查询失败:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ 按状态分组的项目统计:');
      console.table(results);
      console.log('');
      resolve();
    });
  });
}

// 6. 项目指标统计
async function testProjectMetrics() {
  return new Promise((resolve, reject) => {
    console.log('📋 6. 项目指标统计...');
    
    const sql = `
      SELECT 
        MIN(interest_rate) as min_interest_rate,
        MAX(interest_rate) as max_interest_rate,
        AVG(interest_rate) as avg_interest_rate,
        MIN(loan_amount) as min_loan_amount,
        MAX(loan_amount) as max_loan_amount,
        AVG(loan_amount) as avg_loan_amount,
        MIN(loan_term_months) as min_loan_term,
        MAX(loan_term_months) as max_loan_term,
        AVG(loan_term_months) as avg_loan_term,
        SUM(subscribe_token) as total_subscribed,
        SUM(total_offering_token) as total_offering,
        ROUND(SUM(subscribe_token) / SUM(total_offering_token) * 100, 2) as overall_progress
      FROM project
    `;
    
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('❌ 项目指标统计失败:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ 项目指标统计:');
      console.table(results[0]);
      console.log('');
      resolve();
    });
  });
}

// 7. 查询最近的项目
async function testRecentProjects() {
  return new Promise((resolve, reject) => {
    console.log('📋 7. 查询最近创建的项目...');
    
    const sql = `
      SELECT 
        project_code,
        project_name,
        loan_status,
        property_type,
        property_location,
        loan_amount,
        interest_rate,
        created_at
      FROM project 
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('❌ 查询最近项目失败:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ 最近创建的项目:');
      console.table(results);
      console.log('');
      resolve();
    });
  });
}

// 错误处理
process.on('unhandledRejection', (err) => {
  console.error('❌ 未处理的Promise拒绝:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获的异常:', err);
  process.exit(1);
});

console.log('🚀 project表测试脚本启动...');
console.log('⏰ 开始时间:', new Date().toLocaleString());
console.log('');
