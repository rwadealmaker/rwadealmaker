/**
 * 更新数据库字段值：将中文改为英文
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

async function updateFieldValues() {
  let connection;

  try {
    console.log('🚀 开始更新数据库字段值...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 更新 project_active 表
    console.log('📊 更新 project_active 表...');

    // 1. property_type: 独栋别墅 -> Single_House
    await connection.query(
      `UPDATE project_active SET property_type = 'Single_House' WHERE property_type = '独栋别墅'`
    );
    console.log('  ✅ property_type: 独栋别墅 -> Single_House');

    // 2. mortgage_type: 第一抵押权人 -> First_Mortgage
    await connection.query(
      `UPDATE project_active SET mortgage_type = 'First_Mortgage' WHERE mortgage_type = '第一抵押权人'`
    );
    console.log('  ✅ mortgage_type: 第一抵押权人 -> First_Mortgage');

    // 3. collateral: 澳洲住宅抵押贷款 -> Australian_Residential_Security
    await connection.query(
      `UPDATE project_active SET collateral = 'Australian_Residential_Security' WHERE collateral = '澳洲住宅抵押贷款'`
    );
    console.log('  ✅ collateral: 澳洲住宅抵押贷款 -> Australian_Residential_Security');

    // 4. borrower: 机构 -> Company
    await connection.query(
      `UPDATE project_active SET borrower = 'Company' WHERE borrower = '机构'`
    );
    console.log('  ✅ borrower: 机构 -> Company');

    console.log('\n📊 更新 project_incoming 表...');

    // 更新 project_incoming 表（如果有相同的中文值）
    await connection.query(
      `UPDATE project_incoming SET property_type = 'Single_House' WHERE property_type = '独栋别墅'`
    );

    await connection.query(
      `UPDATE project_incoming SET mortgage_type = 'First_Mortgage' WHERE mortgage_type = '第一抵押权人'`
    );

    await connection.query(
      `UPDATE project_incoming SET collateral = 'Australian_Residential_Security' WHERE collateral = '澳洲住宅抵押贷款'`
    );

    await connection.query(
      `UPDATE project_incoming SET borrower = 'Company' WHERE borrower = '机构'`
    );
    console.log('  ✅ 所有相关字段已更新');

    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const [activeResult] = await connection.query(
      `SELECT project_code, property_type, mortgage_type, collateral, borrower FROM project_active`
    );

    console.log('\n  📋 project_active 当前值:');
    activeResult.forEach(row => {
      console.log(`     ${row.project_code}:`);
      console.log(`       property_type: ${row.property_type || 'NULL'}`);
      console.log(`       mortgage_type: ${row.mortgage_type || 'NULL'}`);
      console.log(`       collateral: ${row.collateral || 'NULL'}`);
      console.log(`       borrower: ${row.borrower || 'NULL'}`);
    });

    console.log('\n✨ 字段值更新完成！\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateFieldValues();
