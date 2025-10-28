require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateRWAT001() {
  console.log('🔄 开始更新 RWAT001 完整数据...');

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

    // 更新 RWAT001 的完整数据
    console.log('📊 更新 project_active 表 RWAT001 项目...');

    const updateQuery = `
      UPDATE project_active
      SET
        site_area = 373,
        gross_floor_area = 241,
        mortgage_type = 'First Mortgage',
        collateral = 'Australian Residential Security',
        property_type = 'Single House',
        lender = 'CA Capital',
        issuer = 'PW Holding Ltd',
        valuer = 'PEK Valuation',
        lawyer = 'Parsons & Partner',
        default_interest_rate = 18,
        trustee = 'TBC',
        sponsor = 'TBC'
      WHERE project_code = 'RWAT001'
    `;

    await connection.query(updateQuery);
    console.log('✅ RWAT001 更新完成');

    // 验证更新结果
    console.log('\n🔍 验证更新结果:');
    const [result] = await connection.query(
      `SELECT
        project_code,
        site_area,
        gross_floor_area,
        mortgage_type,
        collateral,
        property_type,
        lender,
        issuer,
        valuer,
        lawyer,
        trustee,
        sponsor,
        default_interest_rate
       FROM project_active
       WHERE project_code = 'RWAT001'`
    );

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

updateRWAT001()
  .then(() => {
    console.log('\n✅ 更新完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 更新失败:', error);
    process.exit(1);
  });
