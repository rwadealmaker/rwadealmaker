/**
 * 自动执行数据库迁移脚本
 * 包括创建表、触发器、视图和数据迁移
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 数据库配置 - 从dbConfig.js读取
const dbConfigModule = require('../src/database/dbConfig');
const dbConfig = {
  host: dbConfigModule.mysql.host,
  port: dbConfigModule.mysql.port,
  user: dbConfigModule.mysql.user,
  password: dbConfigModule.mysql.password,
  database: dbConfigModule.mysql.database,
  multipleStatements: true
};

async function executeSQLFile(connection, filePath) {
  console.log(`📄 正在执行SQL文件: ${path.basename(filePath)}`);

  try {
    const sqlContent = await fs.readFile(filePath, 'utf8');

    // 移除注释和空行
    const sqlStatements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n');

    // 分割SQL语句 (处理DELIMITER)
    const statements = [];
    let currentStatement = '';
    let inDelimiter = false;
    let customDelimiter = ';';

    const lines = sqlStatements.split('\n');
    for (let line of lines) {
      const trimmedLine = line.trim();

      // 检测DELIMITER变更
      if (trimmedLine.startsWith('DELIMITER')) {
        const parts = trimmedLine.split(/\s+/);
        if (parts.length > 1) {
          customDelimiter = parts[1];
          inDelimiter = customDelimiter !== ';';
        }
        continue;
      }

      currentStatement += line + '\n';

      // 检测语句结束
      if (trimmedLine.endsWith(customDelimiter)) {
        if (customDelimiter === '$$') {
          currentStatement = currentStatement.replace(/\$\$\s*$/, '');
          inDelimiter = false;
          customDelimiter = ';';
        }

        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      }
    }

    // 添加最后一个语句
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    // 执行每个语句
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;

      try {
        await connection.query(stmt);
        console.log(`  ✅ 语句 ${i + 1}/${statements.length} 执行成功`);
      } catch (err) {
        // 忽略"已存在"错误
        if (err.code === 'ER_TABLE_EXISTS_ERROR' ||
            err.code === 'ER_TRG_ALREADY_EXISTS' ||
            err.message.includes('already exists')) {
          console.log(`  ⚠️  语句 ${i + 1} 跳过 (对象已存在)`);
        } else {
          throw err;
        }
      }
    }

    console.log(`✅ SQL文件执行完成\n`);
    return true;
  } catch (error) {
    console.error(`❌ 执行SQL文件失败:`, error.message);
    throw error;
  }
}

async function checkOldProjectTable(connection) {
  console.log('🔍 检查旧project表...');

  try {
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'project'"
    );

    if (tables.length > 0) {
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM project');
      console.log(`  ✅ 发现旧project表，包含 ${rows[0].count} 条记录\n`);
      return true;
    } else {
      console.log(`  ℹ️  未发现旧project表，跳过数据迁移\n`);
      return false;
    }
  } catch (error) {
    console.log(`  ℹ️  未发现旧project表，跳过数据迁移\n`);
    return false;
  }
}

async function migrateData(connection) {
  console.log('📦 开始迁移数据...');

  try {
    // 检查旧表是否存在
    const hasOldTable = await checkOldProjectTable(connection);
    if (!hasOldTable) {
      console.log('⏭️  跳过数据迁移（无旧数据）\n');
      return;
    }

    // 迁移已代币化项目
    console.log('  📊 迁移已代币化项目到 project_active...');
    const migrateActiveSql = `
      INSERT IGNORE INTO project_active (
        project_code, project_name, property_summary, status,
        total_offering_token, subscribe_token, token_price,
        loan_amount, interest_rate, loan_term_months, lvr,
        property_location, property_state, property_type, property_value,
        loan_type, loan_product, loan_purpose, mortgage_type,
        borrower, lender, issuer, guarantor,
        collateral, security_rank,
        commencement_date, expiry_date, drawdown_date, expected_recovery_date,
        repayment_arrangement, early_repayment, early_repayment_details,
        default_interest_rate, default_triggers, default_process,
        valuation_report, mortgage_deed, issuer_token, loan_token,
        created_at, updated_at, created_by, updated_by
      )
      SELECT
        CONCAT('RWAT', LPAD(id, 3, '0')) as project_code,
        project_name, property_summary,
        CASE
          WHEN loan_status = 'ACTIVE' THEN 'ACTIVE'
          WHEN loan_status = 'COMPLETED' THEN 'COMPLETED'
          WHEN loan_status = 'DEFAULT' THEN 'DEFAULT'
          ELSE 'ACTIVE'
        END as status,
        total_offering_token, subscribe_token, 1 as token_price,
        loan_amount, interest_rate, loan_term_months, lvr,
        property_location, property_state, property_type, property_value,
        loan_type, loan_product, loan_purpose, mortgage_type,
        borrower, lender, issuer, guarantor,
        collateral, security_rank,
        commencement_date, expiry_date, drawdown_date, expected_recovery_date,
        repayment_arrangement, early_repayment, early_repayment_details,
        default_interest_rate, default_triggers, default_process,
        valuation_report, mortgage_deed, issuer_token, loan_token,
        created_at, updated_at, created_by, updated_by
      FROM project
      WHERE loan_status IN ('ACTIVE', 'COMPLETED', 'DEFAULT')
    `;

    const [activeResult] = await connection.query(migrateActiveSql);
    console.log(`    ✅ 迁移了 ${activeResult.affectedRows} 条已代币化项目记录`);

    // 迁移待代币化项目
    console.log('  📊 迁移待代币化项目到 project_incoming...');
    const migrateIncomingSql = `
      INSERT IGNORE INTO project_incoming (
        project_code, project_name, property_summary, status,
        estimated_total_token, estimated_token_price,
        loan_amount, interest_rate, loan_term_months, lvr,
        property_location, property_state, property_type, property_value,
        loan_type, loan_product, loan_purpose, mortgage_type,
        borrower, lender, issuer, guarantor,
        collateral, security_rank,
        expected_commencement_date, expected_expiry_date, expected_drawdown_date,
        repayment_arrangement, early_repayment, early_repayment_details,
        default_interest_rate, default_triggers, default_process,
        valuation_report, mortgage_deed,
        created_at, updated_at, created_by, updated_by
      )
      SELECT
        CONCAT('RWA', LPAD(id, 3, '0')) as project_code,
        project_name, property_summary, 'INCOMING' as status,
        total_offering_token as estimated_total_token, 1 as estimated_token_price,
        loan_amount, interest_rate, loan_term_months, lvr,
        property_location, property_state, property_type, property_value,
        loan_type, loan_product, loan_purpose, mortgage_type,
        borrower, lender, issuer, guarantor,
        collateral, security_rank,
        commencement_date as expected_commencement_date,
        expiry_date as expected_expiry_date,
        drawdown_date as expected_drawdown_date,
        repayment_arrangement, early_repayment, early_repayment_details,
        default_interest_rate, default_triggers, default_process,
        valuation_report, mortgage_deed,
        created_at, updated_at, created_by, updated_by
      FROM project
      WHERE loan_status = 'INCOMING'
    `;

    const [incomingResult] = await connection.query(migrateIncomingSql);
    console.log(`    ✅ 迁移了 ${incomingResult.affectedRows} 条待代币化项目记录`);

    console.log(`✅ 数据迁移完成\n`);

  } catch (error) {
    console.error(`❌ 数据迁移失败:`, error.message);
    throw error;
  }
}

async function verifyMigration(connection) {
  console.log('🔍 验证迁移结果...');

  try {
    // 检查表
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'project_%'"
    );
    console.log(`  ✅ 创建了 ${tables.length} 个表`);

    // 检查project_active数据
    const [activeRows] = await connection.query(
      'SELECT COUNT(*) as count FROM project_active'
    );
    console.log(`  📊 project_active: ${activeRows[0].count} 条记录`);

    // 检查project_incoming数据
    const [incomingRows] = await connection.query(
      'SELECT COUNT(*) as count FROM project_incoming'
    );
    console.log(`  📊 project_incoming: ${incomingRows[0].count} 条记录`);

    // 检查触发器
    const [triggers] = await connection.query(
      "SHOW TRIGGERS WHERE `Trigger` LIKE 'trg_project%'"
    );
    console.log(`  ✅ 创建了 ${triggers.length} 个触发器`);

    // 检查视图
    const [views] = await connection.query(
      "SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW' AND Tables_in_rwa_dealmaker LIKE 'v_all_projects'"
    );
    console.log(`  ✅ 创建了 ${views.length} 个视图`);

    // 显示示例数据
    console.log('\n  📋 project_active 示例数据:');
    const [activeSample] = await connection.query(
      'SELECT project_code, project_name, status, property_type FROM project_active LIMIT 3'
    );
    activeSample.forEach(row => {
      console.log(`    - ${row.project_code}: ${row.project_name} [${row.status}]`);
    });

    console.log('\n  📋 project_incoming 示例数据:');
    const [incomingSample] = await connection.query(
      'SELECT project_code, project_name, status, property_type FROM project_incoming LIMIT 3'
    );
    incomingSample.forEach(row => {
      console.log(`    - ${row.project_code}: ${row.project_name} [${row.status}]`);
    });

    console.log(`\n✅ 验证完成\n`);

  } catch (error) {
    console.error(`❌ 验证失败:`, error.message);
    throw error;
  }
}

async function main() {
  let connection;

  try {
    console.log('🚀 开始执行数据库迁移...\n');
    console.log(`📡 连接数据库: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}\n`);

    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 1. 执行表结构创建
    const sqlFilePath = path.join(__dirname, 'create_project_tables.sql');
    await executeSQLFile(connection, sqlFilePath);

    // 2. 迁移数据
    await migrateData(connection);

    // 3. 验证结果
    await verifyMigration(connection);

    console.log('✨ 所有迁移任务完成！\n');

  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:');
    console.error(error);
    process.exit(1);

  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行主函数
main();
