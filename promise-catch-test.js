const MyPromise = require('./my-promise')

/** 以下是测试示例 */
const p1 = new MyPromise(function (resolve, reject) {
  resolve('Success')
})

p1.then(function (value) {
  console.log(value) // "Success!"
  throw 'oh, no!'
})
  .catch(function (e) {
    console.log(e) // "oh, no!"
  })
  .then(
    function () {
      console.log('after a catch the chain is restored')
    },
    function () {
      console.log('Not fired due to the catch')
    },
  )

// 以下行为与上述相同
p1.then(function (value) {
  console.log(value) // "Success!"
  return Promise.reject('oh, no!')
})
  .catch(function (e) {
    console.log(e) // "oh, no!"
  })
  .then(
    function () {
      console.log('after a catch the chain is restored')
    },
    function () {
      console.log('Not fired due to the catch')
    },
  )

// 捕获异常
const p2 = new MyPromise(function (resolve, reject) {
  throw new Error('test')
})
p2.catch(function (error) {
  console.log(error)
})
// Error: test

/**
 * 正确打印：
 * Success
 * Success
 * Error: test
 * oh, no!
 * after a catch the chain is restored
 * oh, no!
 * after a catch the chain is restored
 */
