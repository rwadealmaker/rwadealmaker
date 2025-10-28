/**
 * 添加所有缺失字段到数据库表
 * 包括: sponsor, trustee, lawyer, valuer, 以及智能合约地址字段
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

async function addMissingFields() {
  let connection;

  try {
    console.log('🚀 添加缺失字段到数据库表...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // ========== PROJECT_ACTIVE 表 ==========
    console.log('📊 更新 project_active 表...\n');

    // 1. sponsor (赞助方)
    await addFieldIfNotExists(connection, 'project_active', 'sponsor',
      `ADD COLUMN sponsor VARCHAR(255) COMMENT '赞助方' AFTER guarantor`);

    // 2. trustee (受托方)
    await addFieldIfNotExists(connection, 'project_active', 'trustee',
      `ADD COLUMN trustee VARCHAR(255) COMMENT '受托方' AFTER guarantor`);

    // 3. lawyer (律师事务所)
    await addFieldIfNotExists(connection, 'project_active', 'lawyer',
      `ADD COLUMN lawyer VARCHAR(255) COMMENT '律师事务所' AFTER issuer`);

    // 4. valuer (评估师)
    await addFieldIfNotExists(connection, 'project_active', 'valuer',
      `ADD COLUMN valuer VARCHAR(255) COMMENT '评估师' AFTER lawyer`);

    // 5. kyc_registry_address (KYC注册合约地址)
    await addFieldIfNotExists(connection, 'project_active', 'kyc_registry_address',
      `ADD COLUMN kyc_registry_address VARCHAR(42) COMMENT 'KYC注册合约地址' AFTER loan_issuer_address`);

    // 6. trade_contract_address (交易合约地址)
    await addFieldIfNotExists(connection, 'project_active', 'trade_contract_address',
      `ADD COLUMN trade_contract_address VARCHAR(42) COMMENT '交易合约地址' AFTER kyc_registry_address`);

    // 7. compliance_guard_contract_address (合规守护合约地址)
    await addFieldIfNotExists(connection, 'project_active', 'compliance_guard_contract_address',
      `ADD COLUMN compliance_guard_contract_address VARCHAR(42) COMMENT '合规守护合约地址' AFTER trade_contract_address`);

    // 8. holder_registry (持有人注册表地址)
    await addFieldIfNotExists(connection, 'project_active', 'holder_registry',
      `ADD COLUMN holder_registry VARCHAR(42) COMMENT '持有人注册表地址' AFTER compliance_guard_contract_address`);

    // ========== PROJECT_INCOMING 表 ==========
    console.log('\n📊 更新 project_incoming 表...\n');

    // 1. sponsor (赞助方)
    await addFieldIfNotExists(connection, 'project_incoming', 'sponsor',
      `ADD COLUMN sponsor VARCHAR(255) COMMENT '赞助方' AFTER guarantor`);

    // 2. trustee (受托方)
    await addFieldIfNotExists(connection, 'project_incoming', 'trustee',
      `ADD COLUMN trustee VARCHAR(255) COMMENT '受托方' AFTER guarantor`);

    // ========== 更新现有数据 ==========
    console.log('\n📊 更新现有数据的默认值...\n');

    // 更新 project_active
    await connection.query(`
      UPDATE project_active
      SET lawyer = 'Parsons & Partner',
          valuer = 'PEK Valuation',
          sponsor = 'TBA',
          trustee = 'TBA'
      WHERE lawyer IS NULL OR valuer IS NULL
    `);
    console.log('  ✅ project_active 数据已更新');

    // 更新 project_incoming (lawyer和valuer已有数据)
    await connection.query(`
      UPDATE project_incoming
      SET sponsor = 'TBA',
          trustee = 'TBA'
      WHERE sponsor IS NULL OR trustee IS NULL
    `);
    console.log('  ✅ project_incoming 数据已更新');

    // ========== 验证结果 ==========
    console.log('\n🔍 验证结果...\n');

    // 检查 project_active
    const [activeFields] = await connection.query(
      `SHOW COLUMNS FROM project_active`
    );
    const activeFieldNames = activeFields.map(f => f.Field);

    console.log('📋 project_active 字段数:', activeFieldNames.length);
    const newActiveFields = ['sponsor', 'trustee', 'lawyer', 'valuer',
      'kyc_registry_address', 'trade_contract_address',
      'compliance_guard_contract_address', 'holder_registry'];

    newActiveFields.forEach(field => {
      if (activeFieldNames.includes(field)) {
        console.log(`  ✅ ${field}`);
      } else {
        console.log(`  ❌ ${field} (缺失)`);
      }
    });

    // 检查 project_incoming
    const [incomingFields] = await connection.query(
      `SHOW COLUMNS FROM project_incoming`
    );
    const incomingFieldNames = incomingFields.map(f => f.Field);

    console.log('\n📋 project_incoming 字段数:', incomingFieldNames.length);
    const newIncomingFields = ['sponsor', 'trustee', 'lawyer', 'valuer'];

    newIncomingFields.forEach(field => {
      if (incomingFieldNames.includes(field)) {
        console.log(`  ✅ ${field}`);
      } else {
        console.log(`  ❌ ${field} (缺失)`);
      }
    });

    // 显示示例数据
    console.log('\n📋 project_active 示例数据:');
    const [activeSample] = await connection.query(
      `SELECT project_code, lawyer, valuer, sponsor, trustee FROM project_active LIMIT 1`
    );
    if (activeSample.length > 0) {
      console.log(`  ${activeSample[0].project_code}:`);
      console.log(`    lawyer: ${activeSample[0].lawyer}`);
      console.log(`    valuer: ${activeSample[0].valuer}`);
      console.log(`    sponsor: ${activeSample[0].sponsor}`);
      console.log(`    trustee: ${activeSample[0].trustee}`);
    }

    console.log('\n📋 project_incoming 示例数据:');
    const [incomingSample] = await connection.query(
      `SELECT project_code, lawyer, valuer, sponsor, trustee FROM project_incoming LIMIT 1`
    );
    if (incomingSample.length > 0) {
      console.log(`  ${incomingSample[0].project_code}:`);
      console.log(`    lawyer: ${incomingSample[0].lawyer}`);
      console.log(`    valuer: ${incomingSample[0].valuer}`);
      console.log(`    sponsor: ${incomingSample[0].sponsor}`);
      console.log(`    trustee: ${incomingSample[0].trustee}`);
    }

    console.log('\n✨ 完成！所有字段已添加\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function addFieldIfNotExists(connection, tableName, fieldName, alterStatement) {
  try {
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM ${tableName} LIKE '${fieldName}'`
    );

    if (columns.length === 0) {
      await connection.query(`ALTER TABLE ${tableName} ${alterStatement}`);
      console.log(`  ✅ ${tableName}.${fieldName} 添加成功`);
    } else {
      console.log(`  ℹ️  ${tableName}.${fieldName} 已存在`);
    }
  } catch (error) {
    console.error(`  ❌ ${tableName}.${fieldName} 添加失败:`, error.message);
  }
}

addMissingFields();
