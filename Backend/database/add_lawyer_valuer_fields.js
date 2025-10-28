/**
 * 在project_incoming表中添加lawyer和valuer字段并更新数据
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

async function addLawyerValuerFields() {
  let connection;

  try {
    console.log('🚀 添加lawyer和valuer字段到project_incoming表...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 1. 检查字段是否已存在
    console.log('📊 检查字段是否存在...');
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM project_incoming LIKE 'lawyer'`
    );

    if (columns.length === 0) {
      // 2. 添加lawyer字段
      console.log('  📝 添加lawyer字段...');
      await connection.query(
        `ALTER TABLE project_incoming
         ADD COLUMN lawyer VARCHAR(255) COMMENT '律师事务所' AFTER issuer`
      );
      console.log('  ✅ lawyer字段添加成功');
    } else {
      console.log('  ℹ️  lawyer字段已存在');
    }

    const [valuerColumns] = await connection.query(
      `SHOW COLUMNS FROM project_incoming LIKE 'valuer'`
    );

    if (valuerColumns.length === 0) {
      // 3. 添加valuer字段
      console.log('  📝 添加valuer字段...');
      await connection.query(
        `ALTER TABLE project_incoming
         ADD COLUMN valuer VARCHAR(255) COMMENT '评估师' AFTER lawyer`
      );
      console.log('  ✅ valuer字段添加成功');
    } else {
      console.log('  ℹ️  valuer字段已存在');
    }

    // 4. 更新所有记录
    console.log('\n📊 更新所有记录...');
    const [updateResult] = await connection.query(
      `UPDATE project_incoming
       SET lawyer = 'Parsons & Partner',
           valuer = 'PEK Valuation'`
    );
    console.log(`  ✅ 已更新 ${updateResult.affectedRows} 条记录`);

    // 5. 验证结果
    console.log('\n🔍 验证结果...');
    const [rows] = await connection.query(
      `SELECT project_code, project_name, lawyer, valuer
       FROM project_incoming
       ORDER BY project_code
       LIMIT 5`
    );

    console.log('\n  📋 前5条记录:');
    rows.forEach(row => {
      console.log(`     ${row.project_code}: ${row.project_name}`);
      console.log(`       lawyer: ${row.lawyer}`);
      console.log(`       valuer: ${row.valuer}`);
    });

    console.log('\n✨ 完成！\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addLawyerValuerFields();
