require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTrusteeData() {
  const connection = await mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
    charset: 'utf8mb4'
  });

  try {
    console.log('🔍 检查 trustee 数据...\n');

    // 检查 project_active 表
    console.log('📊 project_active 表的 trustee 数据:');
    const [active] = await connection.query(`
      SELECT project_code, trustee, sponsor, valuer, lawyer
      FROM project_active
    `);
    console.log(JSON.stringify(active, null, 2));

    // 检查 project_incoming 表
    console.log('\n📊 project_incoming 表的 trustee 数据:');
    const [incoming] = await connection.query(`
      SELECT project_code, trustee, sponsor, valuer, lawyer
      FROM project_incoming
      LIMIT 5
    `);
    console.log(JSON.stringify(incoming, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkTrusteeData();
