const MyPromise = require('./my-promise')

/** 以下是测试示例 */
let p1 = new MyPromise(function (resolve, reject) {
  resolve(1)
})
  .then(function (value) {
    console.log(value)
  })
  .catch(function (e) {
    console.log(e)
  })
  .finally(function () {
    console.log('finally')
  })

/**
 * 正确打印：
 * 1
 * finally
 */
