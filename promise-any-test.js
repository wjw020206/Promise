const MyPromise = require('./my-promise')

/** 以下是测试示例 */

MyPromise.any([]).catch((e) => {
  console.log(e)
})

const pErr = new MyPromise((resolve, reject) => {
  reject('总是失败')
})

const pSlow = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, '最终完成')
})

const pFast = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, '很快完成')
})

MyPromise.any([pErr, pSlow, pFast]).then((value) => {
  console.log(value)
  // 期望输出: "很快完成"
})

const pErr1 = new MyPromise((resolve, reject) => {
  reject('总是失败')
})

const pErr2 = new MyPromise((resolve, reject) => {
  reject('总是失败')
})

const pErr3 = new MyPromise((resolve, reject) => {
  reject('总是失败')
})

MyPromise.any([pErr1, pErr2, pErr3]).catch((e) => {
  console.log(e)
})

/**
 * 正确打印：
 * AggregateError: All promises were rejected
 * AggregateError: All promises were rejected
 * 很快完成
 */
