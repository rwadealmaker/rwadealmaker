const mysql2 = require('mysql2')
const dbconfig = require('./dbConfig')
const mysql = mysql2.createPool(dbconfig.mysql)

module.exports = mysql