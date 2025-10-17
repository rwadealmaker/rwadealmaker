/*mysql配置信息*/
require('dotenv').config()
module.exports = {
  mysql: {
    host: process.env.db_host || '8.138.127.3',                           // 数据库IP地址
    user: process.env.db_user || 'root',                                  // 用户名
    password: process.env.db_password || '123456',                        // 密码
    database: process.env.db_name || 'rwa',                               // 数据库名   
    port: process.env.db_port || 3306,                                    // 端口号（默认都是3306）
    connectionLimit: process.env.db_connection_limit || 10,               //池内最大连接数
    waitForConnections: process.env.db_wait_for_connections || true,      //等待连接池可用
    idleTimeout: process.env.db_idleTimeout || 30000,                     //空闲30秒后回收
  }
};