// api/_utils/response.js - 统一响应处理

function success(res, data = null, message = 'Success') {
  return res.status(200).json({
    status: 0,
    message,
    data
  })
}

function error(res, message = 'Error', statusCode = 500) {
  return res.status(statusCode).json({
    status: 1,
    message
  })
}

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  return res
}

module.exports = {
  success,
  error,
  setCORS
}
