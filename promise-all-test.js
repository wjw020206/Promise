const MyPromise = require('./my-promise')

const promise1 = MyPromise.resolve(3)
const promise2 = 42
const promise3 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo')
})

MyPromise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values)
})

const p1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, 'one')
})
const p2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 2000, 'two')
})
const p3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 3000, 'three')
})
const p4 = new Promise((resolve, reject) => {
  setTimeout(resolve, 4000, 'four')
})
const p5 = new Promise((resolve, reject) => {
  reject('reject')
})

Promise.all([p1, p2, p3, p4, p5]).then(
  (values) => {
    console.log(values)
  },
  (reason) => {
    console.log(reason)
  },
)

/**
 * 正确打印：
 * reject
 * [ 3, 42, 'foo' ]
 */
