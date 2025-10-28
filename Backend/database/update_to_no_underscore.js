/**
 * 更新数据库字段值：去掉下划线，使用空格
 */
const mysql = require('mysql2/promise');
const dbConfigModule = require('../src/database/dbConfig');

const dbConfig = {
  host: dbConfigModule.mysql.host,
  port: dbConfigModule.mysql.port,
  user: dbConfigModule.mysql.user,
  password: dbConfigModule.mysql.password,
  database: dbConfigModule.mysql.database
};

async function updateToNoUnderscore() {
  let connection;

  try {
    console.log('🚀 更新数据库字段值为无下划线格式...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    console.log('📊 更新 project_active 表...');

    // property_type: Single_House -> Single House
    await connection.query(
      `UPDATE project_active SET property_type = 'Single House' WHERE property_type = 'Single_House'`
    );
    console.log('  ✅ property_type: Single_House -> Single House');

    // mortgage_type: First_Mortgage -> First Mortgage
    await connection.query(
      `UPDATE project_active SET mortgage_type = 'First Mortgage' WHERE mortgage_type = 'First_Mortgage'`
    );
    console.log('  ✅ mortgage_type: First_Mortgage -> First Mortgage');

    // collateral: Australian_Residential_Security -> Australian Residential Security
    await connection.query(
      `UPDATE project_active SET collateral = 'Australian Residential Security' WHERE collateral = 'Australian_Residential_Security'`
    );
    console.log('  ✅ collateral: Australian_Residential_Security -> Australian Residential Security');

    console.log('\n📊 更新 project_incoming 表...');

    await connection.query(
      `UPDATE project_incoming SET property_type = REPLACE(property_type, '_', ' ')`
    );

    await connection.query(
      `UPDATE project_incoming SET mortgage_type = REPLACE(mortgage_type, '_', ' ')`
    );

    await connection.query(
      `UPDATE project_incoming SET collateral = REPLACE(collateral, '_', ' ')`
    );

    await connection.query(
      `UPDATE project_incoming SET loan_type = REPLACE(loan_type, '_', ' ')`
    );

    await connection.query(
      `UPDATE project_incoming SET loan_purpose = REPLACE(loan_purpose, '_', ' ')`
    );

    await connection.query(
      `UPDATE project_incoming SET repayment_arrangement = REPLACE(repayment_arrangement, '_', ' ')`
    );

    await connection.query(
      `UPDATE project_incoming SET early_repayment = REPLACE(early_repayment, '_', ' ')`
    );

    console.log('  ✅ 所有下划线已替换为空格');

    // 验证结果
    console.log('\n🔍 验证更新结果...');
    const [activeResult] = await connection.query(
      `SELECT project_code, property_type, mortgage_type, collateral FROM project_active`
    );

    console.log('\n  📋 project_active 当前值:');
    activeResult.forEach(row => {
      console.log(`     ${row.project_code}:`);
      console.log(`       property_type: ${row.property_type || 'NULL'}`);
      console.log(`       mortgage_type: ${row.mortgage_type || 'NULL'}`);
      console.log(`       collateral: ${row.collateral || 'NULL'}`);
    });

    console.log('\n✨ 更新完成！\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateToNoUnderscore();
