require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkMortgageField() {
  const connection = await mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
    charset: 'utf8mb4'
  });

  try {
    console.log('🔍 检查 mortgage 字段名...\n');

    // 检查 project_incoming 表
    console.log('📋 project_incoming 表的所有字段:');
    const [cols] = await connection.query(`SHOW COLUMNS FROM project_incoming`);
    const mortgageFields = cols.filter(c => c.Field.toLowerCase().includes('mortg'));
    console.log('包含"mortg"的字段:', mortgageFields.map(c => c.Field));

    // 查询实际数据
    console.log('\n📊 project_incoming 表的 mortgage 相关数据:');
    const [data] = await connection.query(`
      SELECT project_code, mortgage_type, mortage_type
      FROM project_incoming
      LIMIT 3
    `);
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkMortgageField();
