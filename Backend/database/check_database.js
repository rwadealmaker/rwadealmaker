require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  console.log('🔍 检查数据库字段和数据...');

  const connection = await mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
    charset: 'utf8mb4'
  });

  try {
    console.log('✅ 数据库连接成功\n');

    // 1. 检查 project_active 表的 RWAT001 数据
    console.log('📊 检查 project_active 表 RWAT001 项目:');
    const [rwat001] = await connection.query(
      `SELECT project_code, site_area, gross_floor_area, mortgage_type, collateral, property_type, lender, issuer, valuer, lawyer
       FROM project_active
       WHERE project_code = 'RWAT001'`
    );
    console.log(JSON.stringify(rwat001, null, 2));

    // 2. 检查所有字段名
    console.log('\n📋 project_active 表的所有字段:');
    const [columns] = await connection.query(`SHOW COLUMNS FROM project_active`);
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✅ 检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 检查失败:', error);
    process.exit(1);
  });
