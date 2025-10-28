require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateAreaFields() {
  console.log('🔄 开始更新 site_area 和 gross_floor_area 字段值...');

  const connection = await mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
    charset: 'utf8mb4'
  });

  try {
    console.log('✅ 数据库连接成功');

    // 更新 project_active 表的 RWAT001 项目
    console.log('\n📊 更新 project_active 表...');
    await connection.query(
      `UPDATE project_active
       SET site_area = 373, gross_floor_area = 241
       WHERE project_code = 'RWAT001'`
    );
    console.log('✅ RWAT001 项目的面积字段已更新');

    // 验证更新
    const [result] = await connection.query(
      `SELECT project_code, site_area, gross_floor_area
       FROM project_active
       WHERE project_code = 'RWAT001'`
    );
    console.log('\n🔍 验证更新结果:');
    console.log(result);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 执行脚本
updateAreaFields()
  .then(() => {
    console.log('\n✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
