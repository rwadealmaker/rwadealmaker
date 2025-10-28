/**
 * 简化版数据库迁移脚本（不使用触发器）
 */
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dbConfigModule = require('../src/database/dbConfig');

const dbConfig = {
  host: dbConfigModule.mysql.host,
  port: dbConfigModule.mysql.port,
  user: dbConfigModule.mysql.user,
  password: dbConfigModule.mysql.password,
  database: dbConfigModule.mysql.database
};

async function main() {
  let connection;

  try {
    console.log('🚀 开始数据库迁移...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // Step 1: 创建新表
    console.log('📊 步骤1: 创建新表...');
    const sqlContent = await fs.readFile(
      path.join(__dirname, 'create_tables_no_triggers.sql'),
      'utf8'
    );

    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('  ⚠️  表已存在，跳过');
        } else {
          throw err;
        }
      }
    }
    console.log('✅ 表创建完成\n');

    // Step 2: 检查旧数据
    console.log('📦 步骤2: 检查旧project表...');
    const [oldData] = await connection.query('SELECT * FROM project ORDER BY id');
    console.log(`  发现 ${oldData.length} 条记录\n`);

    // Step 3: 迁移数据
    console.log('🔄 步骤3: 迁移数据...');

    let activeCount = 0;
    let incomingCount = 0;

    for (const project of oldData) {
      const status = project.loan_status;

      if (status === 'ACTIVE' || status === 'COMPLETED' || status === 'DEFAULT') {
        // 迁移到 project_active
        activeCount++;
        const projectCode = `RWAT${String(activeCount).padStart(3, '0')}`;

        await connection.query(
          `INSERT INTO project_active (
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
            principal_token_address, interest_token_address, loan_issuer_address,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [
            projectCode,
            project.project_name,
            project.property_summary,
            status === 'DEFAULT' ? 'DEFAULT' : (status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE'),
            project.total_offering_token,
            project.subscribe_token,
            1,
            project.loan_amount,
            project.interest_rate,
            project.loan_term_months,
            project.lvr,
            project.property_location,
            project.property_state,
            project.property_type,
            project.property_value,
            project.loan_type,
            project.loan_product,
            project.loan_purpose,
            project.mortage_type,
            project.Borrower,
            project.Lender,
            project.Issuer,
            project.Guarantor,
            project.Collateral,
            project.security_rank,
            project.commencement_date,
            project.expiry_date,
            project.drawdown_date,
            project.expected_recovery_date,
            project.repayment_arrangement,
            project.early_repayment,
            project.early_repayment_details,
            project.default_rate,
            project.default_triggers,
            project.default_process,
            project.valuation_report,
            project.mortgage_deed,
            project.issuer_token,
            project.loan_token,
            project.principal_token_address,
            project.interest_token_address,
            project.loan_issuer_address
          ]
        );

        console.log(`  ✅ 已代币化: ${projectCode} - ${project.project_name}`);

      } else if (status === 'INCOMING') {
        // 迁移到 project_incoming
        incomingCount++;
        const projectCode = `RWA${String(incomingCount).padStart(3, '0')}`;

        await connection.query(
          `INSERT INTO project_incoming (
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
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [
            projectCode,
            project.project_name,
            project.property_summary,
            'INCOMING',
            project.total_offering_token,
            1,
            project.loan_amount,
            project.interest_rate,
            project.loan_term_months,
            project.lvr,
            project.property_location,
            project.property_state,
            project.property_type,
            project.property_value,
            project.loan_type,
            project.loan_product,
            project.loan_purpose,
            project.mortage_type,
            project.Borrower,
            project.Lender,
            project.Issuer,
            project.Guarantor,
            project.Collateral,
            project.security_rank,
            project.commencement_date,
            project.expiry_date,
            project.drawdown_date,
            project.repayment_arrangement,
            project.early_repayment,
            project.early_repayment_details,
            project.default_rate,
            project.default_triggers,
            project.default_process,
            project.valuation_report,
            project.mortgage_deed
          ]
        );

        console.log(`  ✅ 待代币化: ${projectCode} - ${project.project_name}`);
      }
    }

    console.log(`\n✅ 数据迁移完成:`);
    console.log(`   - project_active: ${activeCount} 条`);
    console.log(`   - project_incoming: ${incomingCount} 条\n`);

    // Step 4: 验证
    console.log('🔍 步骤4: 验证结果...');
    const [activeRows] = await connection.query('SELECT COUNT(*) as count FROM project_active');
    const [incomingRows] = await connection.query('SELECT COUNT(*) as count FROM project_incoming');

    console.log(`  📊 project_active: ${activeRows[0].count} 条`);
    console.log(`  📊 project_incoming: ${incomingRows[0].count} 条`);

    const [activeSample] = await connection.query(
      'SELECT project_code, project_name, status FROM project_active LIMIT 3'
    );
    console.log('\n  📋 project_active 示例:');
    activeSample.forEach(row => {
      console.log(`     ${row.project_code}: ${row.project_name} [${row.status}]`);
    });

    const [incomingSample] = await connection.query(
      'SELECT project_code, project_name, status FROM project_incoming LIMIT 3'
    );
    console.log('\n  📋 project_incoming 示例:');
    incomingSample.forEach(row => {
      console.log(`     ${row.project_code}: ${row.project_name} [${row.status}]`);
    });

    console.log('\n✨ 迁移完成！\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
