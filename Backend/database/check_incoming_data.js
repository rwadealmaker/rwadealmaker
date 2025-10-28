/**
 * 检查project_incoming表的数据
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

async function checkIncomingData() {
  let connection;

  try {
    console.log('🔍 检查 project_incoming 表数据...\n');

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.query(
      `SELECT project_code, project_name, property_type, borrower, collateral
       FROM project_incoming
       ORDER BY project_code`
    );

    console.log(`📊 共 ${rows.length} 条记录:\n`);

    // 统计所有唯一值
    const propertyTypes = new Set();
    const borrowers = new Set();
    const collaterals = new Set();

    rows.forEach(row => {
      console.log(`${row.project_code}: ${row.project_name}`);
      console.log(`  property_type: ${row.property_type || 'NULL'}`);
      console.log(`  borrower: ${row.borrower || 'NULL'}`);
      console.log(`  collateral: ${row.collateral || 'NULL'}`);
      console.log('');

      if (row.property_type) propertyTypes.add(row.property_type);
      if (row.borrower) borrowers.add(row.borrower);
      if (row.collateral) collaterals.add(row.collateral);
    });

    console.log('\n📋 唯一值统计:');
    console.log('\nproperty_type 值:');
    propertyTypes.forEach(v => console.log(`  - ${v}`));

    console.log('\nborrower 值:');
    borrowers.forEach(v => console.log(`  - ${v}`));

    console.log('\ncollateral 值:');
    collaterals.forEach(v => console.log(`  - ${v}`));

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkIncomingData();
