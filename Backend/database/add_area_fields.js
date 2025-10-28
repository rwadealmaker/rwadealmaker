require('dotenv').config();
const mysql = require('mysql2/promise');

async function addAreaFields() {
  console.log('🔄 开始添加 site_area 和 gross_floor_area 字段...');

  const connection = await mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
    charset: 'utf8mb4'
  });

  try {
    console.log('✅ 数据库连接成功');

    // 检查并添加字段的辅助函数
    async function addFieldIfNotExists(tableName, fieldName, fieldDefinition) {
      const [columns] = await connection.query(
        `SHOW COLUMNS FROM ${tableName} LIKE ?`,
        [fieldName]
      );

      if (columns.length === 0) {
        console.log(`➕ 添加字段 ${tableName}.${fieldName}`);
        await connection.query(`ALTER TABLE ${tableName} ${fieldDefinition}`);
        console.log(`✅ ${tableName}.${fieldName} 添加成功`);
        return true;
      } else {
        console.log(`⏭️  ${tableName}.${fieldName} 已存在，跳过`);
        return false;
      }
    }

    // 1. 添加字段到 project_active 表
    console.log('\n📊 更新 project_active 表...');
    await addFieldIfNotExists(
      'project_active',
      'site_area',
      `ADD COLUMN site_area DECIMAL(10,2) COMMENT '土地面积(平方米)' AFTER property_value`
    );

    await addFieldIfNotExists(
      'project_active',
      'gross_floor_area',
      `ADD COLUMN gross_floor_area DECIMAL(10,2) COMMENT '建筑面积(平方米)' AFTER site_area`
    );

    // 2. 添加字段到 project_incoming 表
    console.log('\n📊 更新 project_incoming 表...');
    await addFieldIfNotExists(
      'project_incoming',
      'site_area',
      `ADD COLUMN site_area DECIMAL(10,2) COMMENT '土地面积(平方米)' AFTER property_value`
    );

    await addFieldIfNotExists(
      'project_incoming',
      'gross_floor_area',
      `ADD COLUMN gross_floor_area DECIMAL(10,2) COMMENT '建筑面积(平方米)' AFTER site_area`
    );

    console.log('\n✅ 所有字段添加完成！');

    // 3. 验证字段
    console.log('\n🔍 验证字段...');
    const [activeFields] = await connection.query(
      `SHOW COLUMNS FROM project_active WHERE Field IN ('site_area', 'gross_floor_area')`
    );
    console.log('project_active 表字段:', activeFields.map(f => f.Field));

    const [incomingFields] = await connection.query(
      `SHOW COLUMNS FROM project_incoming WHERE Field IN ('site_area', 'gross_floor_area')`
    );
    console.log('project_incoming 表字段:', incomingFields.map(f => f.Field));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行脚本
addAreaFields()
  .then(() => {
    console.log('\n✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
