/**
 * 更新project_incoming表：将中英文混合改为纯英文
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

// 映射关系
const PROPERTY_TYPE_MAP = {
  '澳洲商业地产/Australian Commercial Property': 'Commercial Property',
  '澳洲土地开发/Australian Land Development': 'Land Development',
  '澳洲住宅建设/Australian Residential Construction': 'Residential Construction',
  '澳洲联排别墅/Australian Townhouse': 'Townhouse',
  '澳洲独立住宅/Australian Residential House': 'Residential House',
  '澳洲工业地产/Australian Industrial Property': 'Industrial Property'
};

const BORROWER_MAP = {
  '个人': 'Individual',
  'Company': 'Company'
};

const COLLATERAL_MAP = {
  'Metro Commercial': 'Metro Commercial',
  'Metro Development': 'Metro Development',
  'Metro Residential': 'Metro Residential'
};

async function updateIncomingToEnglish() {
  let connection;

  try {
    console.log('🚀 更新 project_incoming 表为纯英文...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 1. 更新 property_type
    console.log('📊 更新 property_type...');
    for (const [chinese, english] of Object.entries(PROPERTY_TYPE_MAP)) {
      const [result] = await connection.query(
        `UPDATE project_incoming SET property_type = ? WHERE property_type = ?`,
        [english, chinese]
      );
      if (result.affectedRows > 0) {
        console.log(`  ✅ ${chinese} -> ${english} (${result.affectedRows} 条)`);
      }
    }

    // 2. 更新 borrower
    console.log('\n📊 更新 borrower...');
    for (const [chinese, english] of Object.entries(BORROWER_MAP)) {
      const [result] = await connection.query(
        `UPDATE project_incoming SET borrower = ? WHERE borrower = ?`,
        [english, chinese]
      );
      if (result.affectedRows > 0) {
        console.log(`  ✅ ${chinese} -> ${english} (${result.affectedRows} 条)`);
      }
    }

    // 3. collateral 已经是英文，保持不变
    console.log('\n📊 collateral 字段已经是英文，无需更新');

    // 验证结果
    console.log('\n🔍 验证更新结果...');
    const [rows] = await connection.query(
      `SELECT project_code, property_type, borrower, collateral
       FROM project_incoming
       ORDER BY project_code
       LIMIT 5`
    );

    console.log('\n  📋 前5条记录:');
    rows.forEach(row => {
      console.log(`     ${row.project_code}:`);
      console.log(`       property_type: ${row.property_type}`);
      console.log(`       borrower: ${row.borrower}`);
      console.log(`       collateral: ${row.collateral}`);
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

updateIncomingToEnglish();
