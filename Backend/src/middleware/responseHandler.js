function responseHandler() {
  return (req, res, next) => {
    // 封装统一响应函数
    res.cc = function (err, status = 1) {
      console.log(err)
      res.send({
        status,
        message: err instanceof Error ? err.message : err
      })
    }
    next()
  }
}

module.exports = responseHandler