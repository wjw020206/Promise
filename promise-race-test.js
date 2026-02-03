const MyPromise = require('./my-promise')

/** 以下是测试示例 */

// 数组全是非Promise值，测试通过
let p1 = MyPromise.race([1, 3, 4])
setTimeout(() => {
  console.log('p1 :>> ', p1)
})

// 空数组，测试通过
let p2 = MyPromise.race([])
setTimeout(() => {
  console.log('p2 :>> ', p2)
})

const p11 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one')
})

const p22 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two')
})

// // 数组里有非Promise值，测试通过
MyPromise.race([p11, p22, 10]).then((value) => {
  console.log('p3 :>> ', value)
  // Both resolve, but p22 is faster
})
// expected output: 10

// 数组里有'已解决的Promise' 和 非Promise值 测试通过
let p12 = MyPromise.resolve('已解决的Promise')
setTimeout(() => {
  MyPromise.race([p12, p22, 10]).then((value) => {
    console.log('p4 :>> ', value)
  })
  // expected output:已解决的Promise
})

// Promise.race 的一般情况 测试通过
const p13 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one')
})

const p14 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two')
})

MyPromise.race([p13, p14]).then((value) => {
  console.log('p5 :>> ', value)
  // Both resolve, but promise2 is faster
})
// expected output: "two"

/**
 * 正确打印：
 * p3 :>>  10
 * p1 :>>  MyPromise {
 *   PromiseState: 'fulfilled',
 *   PromiseResult: 1,
 *   onFulfilledCallbacks: [],
 *   onRejectedCallbacks: []
 * }
 * p2 :>>  MyPromise {
 *   PromiseState: 'pending',
 *   PromiseResult: null,
 *   onFulfilledCallbacks: [],
 *   onRejectedCallbacks: []
 * }
 * p4 :>>  已解决的Promise
 * p5 :>>  two
 */
