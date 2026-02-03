const MyPromise = require('./my-promise')

/** 以下是测试示例 */

MyPromise.reject(new Error('fail')).then(
  function () {
    // not called
  },
  function (error) {
    console.error(error) // Error: fail
  },
)

/**
 * 正确打印：
 * Error: fail
 */
