// =====================================================
// 数据迁移脚本
// =====================================================
// 用途: 将旧project表的数据迁移到project_active和project_incoming
// 执行方式: node Backend/database/migrate_project_data.js
// =====================================================

require('dotenv').config()
const mysql = require('mysql2/promise')
const dbConfig = require('../src/database/dbConfig')

async function migrateData() {
  let connection

  try {
    console.log('===== 开始数据迁移 =====\n')

    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig.mysql)
    console.log('✅ 数据库连接成功\n')

    // 1. 检查旧project表是否存在
    console.log('📊 检查旧project表...')
    const [tables] = await connection.query(`SHOW TABLES LIKE 'project'`)
    if (tables.length === 0) {
      console.log('⚠️  未找到旧project表，无需迁移')
      return
    }
    console.log('✅ 找到旧project表\n')

    // 2. 统计旧表数据
    const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM project`)
    const totalCount = countResult[0].total
    console.log(`📊 旧project表共有 ${totalCount} 条记录\n`)

    if (totalCount === 0) {
      console.log('⚠️  旧project表无数据，无需迁移')
      return
    }

    // 3. 统计各状态数量
    const [statusCount] = await connection.query(`
      SELECT loan_status, COUNT(*) as count
      FROM project
      GROUP BY loan_status
    `)
    console.log('📊 状态分布:')
    statusCount.forEach(row => {
      console.log(`   ${row.loan_status}: ${row.count} 条`)
    })
    console.log('')

    // 4. 开始迁移 - 已代币化项目 (ACTIVE/COMPLETED/DEFAULT)
    console.log('🚀 开始迁移已代币化项目...')
    const [activeProjects] = await connection.query(`
      SELECT * FROM project
      WHERE loan_status IN ('ACTIVE', 'COMPLETED', 'DEFAULT')
    `)

    let activeCount = 0
    for (const project of activeProjects) {
      try {
        // 生成RWAT开头的project_code
        const newCode = project.project_code && project.project_code.startsWith('RWAT')
          ? project.project_code
          : await generateProjectCode(connection, 'RWAT')

        await connection.query(`
          INSERT INTO project_active (
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newCode,
          project.project_name || project.name,
          project.property_summary || project.subtitle,
          mapStatus(project.loan_status, 'active'),
          project.total_offering_token || project.total_token || 0,
          project.subscribe_token || project.current_subscribed_token || 0,
          project.token_price || 1,
          project.loan_amount,
          project.interest_rate || project.annual_interest_rate,
          project.loan_term_months || project.loan_term,
          project.lvr || project.LTV,
          project.property_location || project.property_address,
          project.property_state || project.region,
          project.property_type || project.type,
          project.property_value || project.valuation,
          project.loan_type,
          project.loan_product,
          project.loan_purpose,
          project.mortgage_type,
          project.borrower,
          project.lender,
          project.issuer,
          project.guarantor,
          project.collateral,
          project.security_rank,
          project.commencement_date,
          project.expiry_date || project.maturity_date,
          project.drawdown_date,
          project.expected_recovery_date,
          project.repayment_arrangement,
          project.early_repayment,
          project.early_repayment_details,
          project.default_interest_rate,
          project.default_triggers,
          project.default_process,
          project.valuation_report,
          project.mortgage_deed,
          project.issuer_token,
          project.loan_token,
          project.created_at,
          project.updated_at,
          project.created_by,
          project.updated_by
        ])

        activeCount++
        console.log(`   ✅ 迁移项目: ${newCode} - ${project.project_name || project.name}`)
      } catch (err) {
        console.error(`   ❌ 迁移项目失败: ${project.project_code}`, err.message)
      }
    }
    console.log(`✅ 已代币化项目迁移完成: ${activeCount}/${activeProjects.length} 条\n`)

    // 5. 开始迁移 - 待代币化项目 (INCOMING)
    console.log('🚀 开始迁移待代币化项目...')
    const [incomingProjects] = await connection.query(`
      SELECT * FROM project
      WHERE loan_status = 'INCOMING'
    `)

    let incomingCount = 0
    for (const project of incomingProjects) {
      try {
        // 生成RWA开头的project_code
        const newCode = project.project_code && !project.project_code.startsWith('RWAT')
          ? project.project_code
          : await generateProjectCode(connection, 'RWA')

        await connection.query(`
          INSERT INTO project_incoming (
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newCode,
          project.project_name || project.name,
          project.property_summary || project.subtitle,
          'INCOMING',
          project.total_offering_token || project.total_token || 0,
          project.token_price || 1,
          project.loan_amount,
          project.interest_rate || project.annual_interest_rate,
          project.loan_term_months || project.loan_term,
          project.lvr || project.LTV,
          project.property_location || project.property_address,
          project.property_state || project.region,
          project.property_type || project.type,
          project.property_value || project.valuation,
          project.loan_type,
          project.loan_product,
          project.loan_purpose,
          project.mortgage_type,
          project.borrower,
          project.lender,
          project.issuer,
          project.guarantor,
          project.collateral,
          project.security_rank,
          project.commencement_date,
          project.expiry_date || project.maturity_date,
          project.drawdown_date,
          project.repayment_arrangement,
          project.early_repayment,
          project.early_repayment_details,
          project.default_interest_rate,
          project.default_triggers,
          project.default_process,
          project.valuation_report,
          project.mortgage_deed,
          project.created_at,
          project.updated_at,
          project.created_by,
          project.updated_by
        ])

        incomingCount++
        console.log(`   ✅ 迁移项目: ${newCode} - ${project.project_name || project.name}`)
      } catch (err) {
        console.error(`   ❌ 迁移项目失败: ${project.project_code}`, err.message)
      }
    }
    console.log(`✅ 待代币化项目迁移完成: ${incomingCount}/${incomingProjects.length} 条\n`)

    // 6. 汇总统计
    console.log('===== 迁移完成汇总 =====')
    console.log(`原始数据: ${totalCount} 条`)
    console.log(`已代币化项目: ${activeCount} 条`)
    console.log(`待代币化项目: ${incomingCount} 条`)
    console.log(`总计迁移: ${activeCount + incomingCount} 条\n`)

    // 7. 备份提示
    console.log('⚠️  建议操作:')
    console.log('   1. 验证新表数据是否正确')
    console.log('   2. 备份旧project表: RENAME TABLE project TO project_backup;')
    console.log('   3. 更新后端路由配置')
    console.log('   4. 测试前端功能\n')

  } catch (error) {
    console.error('❌ 迁移过程发生错误:', error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log('✅ 数据库连接已关闭')
    }
  }
}

// 生成新的project_code
async function generateProjectCode(connection, prefix) {
  const regex = prefix === 'RWAT' ? '^RWAT[0-9]+$' : '^RWA[0-9]+$'
  const table = prefix === 'RWAT' ? 'project_active' : 'project_incoming'
  const length = prefix === 'RWAT' ? 4 : 3

  const [result] = await connection.query(`
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_code, ${length + 1}) AS UNSIGNED)), 0) + 1 as next_id
    FROM ${table}
    WHERE project_code REGEXP ?
  `, [regex])

  const nextId = result[0].next_id
  return `${prefix}${String(nextId).padStart(3, '0')}`
}

// 状态映射
function mapStatus(oldStatus, type) {
  if (type === 'active') {
    const statusMap = {
      'ACTIVE': 'ACTIVE',
      'COMPLETED': 'COMPLETED',
      'COMPLETE': 'COMPLETED',
      'DEFAULT': 'DEFAULT'
    }
    return statusMap[oldStatus] || 'ACTIVE'
  } else {
    return 'INCOMING'
  }
}

// 执行迁移
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n✅ 数据迁移脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ 数据迁移失败:', error)
      process.exit(1)
    })
}

module.exports = { migrateData }
