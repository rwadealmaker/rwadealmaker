require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateTBAtoTBC() {
  console.log('🔄 开始将所有 TBA 更新为 TBC...');

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

    // 更新 project_incoming 表中的所有 TBA
    console.log('📊 更新 project_incoming 表...');

    // 更新 trustee 字段
    const [result1] = await connection.query(`
      UPDATE project_incoming
      SET trustee = 'TBC'
      WHERE trustee = 'TBA'
    `);
    console.log(`✅ 更新 trustee: ${result1.affectedRows} 条记录`);

    // 更新 sponsor 字段
    const [result2] = await connection.query(`
      UPDATE project_incoming
      SET sponsor = 'TBC'
      WHERE sponsor = 'TBA'
    `);
    console.log(`✅ 更新 sponsor: ${result2.affectedRows} 条记录`);

    // 更新 project_active 表中的所有 TBA（如果有）
    console.log('\n📊 更新 project_active 表...');

    const [result3] = await connection.query(`
      UPDATE project_active
      SET trustee = 'TBC'
      WHERE trustee = 'TBA'
    `);
    console.log(`✅ 更新 trustee: ${result3.affectedRows} 条记录`);

    const [result4] = await connection.query(`
      UPDATE project_active
      SET sponsor = 'TBC'
      WHERE sponsor = 'TBA'
    `);
    console.log(`✅ 更新 sponsor: ${result4.affectedRows} 条记录`);

    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const [incoming] = await connection.query(`
      SELECT project_code, trustee, sponsor
      FROM project_incoming
      LIMIT 5
    `);
    console.log('project_incoming 前5条记录:');
    console.log(JSON.stringify(incoming, null, 2));

    const [active] = await connection.query(`
      SELECT project_code, trustee, sponsor
      FROM project_active
    `);
    console.log('\nproject_active 所有记录:');
    console.log(JSON.stringify(active, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

updateTBAtoTBC()
  .then(() => {
    console.log('\n✅ 更新完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 更新失败:', error);
    process.exit(1);
  });
