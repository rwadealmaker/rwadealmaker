/**
 * 分析数据库表结构
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

async function analyzeSchema() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('📊 PROJECT_ACTIVE 表结构:\n');
    const [activeFields] = await connection.query('DESCRIBE project_active');
    activeFields.forEach(field => {
      console.log(`${field.Field.padEnd(30)} ${field.Type.padEnd(20)} ${field.Comment || ''}`);
    });

    console.log('\n\n📊 PROJECT_INCOMING 表结构:\n');
    const [incomingFields] = await connection.query('DESCRIBE project_incoming');
    incomingFields.forEach(field => {
      console.log(`${field.Field.padEnd(30)} ${field.Type.padEnd(20)} ${field.Comment || ''}`);
    });

    // 获取示例数据
    console.log('\n\n📋 PROJECT_ACTIVE 示例数据:\n');
    const [activeSample] = await connection.query('SELECT * FROM project_active LIMIT 1');
    if (activeSample.length > 0) {
      console.log(JSON.stringify(activeSample[0], null, 2));
    }

    console.log('\n\n📋 PROJECT_INCOMING 示例数据:\n');
    const [incomingSample] = await connection.query('SELECT * FROM project_incoming LIMIT 1');
    if (incomingSample.length > 0) {
      console.log(JSON.stringify(incomingSample[0], null, 2));
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

analyzeSchema();
