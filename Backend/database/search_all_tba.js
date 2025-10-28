require('dotenv').config();
const mysql = require('mysql2/promise');

async function searchAllTBA() {
  console.log('🔍 搜索数据库中所有包含 TBA 的数据...');

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

    // 获取 project_incoming 表的所有字段
    const [columns] = await connection.query(`SHOW COLUMNS FROM project_incoming`);
    const textFields = columns
      .filter(c => c.Type.includes('varchar') || c.Type.includes('text'))
      .map(c => c.Field);

    console.log('📊 检查 project_incoming 表的所有文本字段...');

    for (const field of textFields) {
      const [result] = await connection.query(`
        SELECT project_code, ${field}
        FROM project_incoming
        WHERE ${field} LIKE '%TBA%'
      `);

      if (result.length > 0) {
        console.log(`\n❌ 发现 TBA 在字段 "${field}":`);
        console.log(JSON.stringify(result, null, 2));
      }
    }

    // 检查 project_active 表
    console.log('\n📊 检查 project_active 表的所有文本字段...');
    const [activeColumns] = await connection.query(`SHOW COLUMNS FROM project_active`);
    const activeTextFields = activeColumns
      .filter(c => c.Type.includes('varchar') || c.Type.includes('text'))
      .map(c => c.Field);

    for (const field of activeTextFields) {
      const [result] = await connection.query(`
        SELECT project_code, ${field}
        FROM project_active
        WHERE ${field} LIKE '%TBA%'
      `);

      if (result.length > 0) {
        console.log(`\n❌ 发现 TBA 在字段 "${field}":`);
        console.log(JSON.stringify(result, null, 2));
      }
    }

    console.log('\n✅ 检查完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
  }
}

searchAllTBA();
