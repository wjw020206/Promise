const MyPromise = require('./my-promise')

/** 以下是测试示例 */
const promise1 = MyPromise.resolve(123)

promise1.then((value) => {
  console.log(value)
  // expected output: 123
})

// Resolve一个thenable对象
const p1 = MyPromise.resolve({
  then: function (onFulfill) {
    onFulfill('Resolving')
  },
})
console.log(p1 instanceof MyPromise) // true, 这是一个Promise对象

setTimeout(() => {
  console.log('p1 :>> ', p1)
}, 1000)

p1.then(
  function (v) {
    console.log(v) // 输出"fulfilled!"
  },
  function (e) {
    // 不会被调用
  },
)

// Thenable在callback之前抛出异常
// MyPromise rejects
const thenable = {
  then: function (resolve) {
    throw new TypeError('Throwing')
    resolve('Resolving')
  },
}

const p2 = MyPromise.resolve(thenable)
p2.then(
  function (v) {
    // 不会被调用
  },
  function (e) {
    console.log(e) // TypeError: Throwing
  },
)

/**
 * 正确打印：
 * true
 * 123
 * Resolving
 * TypeError: Throwing
 * p1 :>>  MyPromise {
 *   PromiseState: 'fulfilled',
 *   PromiseResult: 'Resolving',
 *   onFulfilledCallbacks: [],
 *   onRejectedCallbacks: []
 * }
 */
