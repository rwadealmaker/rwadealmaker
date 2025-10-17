require('dotenv').config()

const SumSub = require('@sumsub/websdk')

//初始化SumSub客户端
const sumsubClient = new SumSub(
  process.env.SUMSUB_APP_TOKEN,
  process.env.SUMSUB_SECRET_KEY,
  { baseURL: process.env.SUMSUB_API_URL }
)
module.exports = sumsubClient