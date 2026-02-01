class MyPromise {
  // 定义 promise 的三种状态
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  // 在 new 一个 promise 实例时必须要传入参数
  constructor(func) {
    // 为每个不同的 promise 添加实例状态（默认状态为 pending）
    this.PromiseState = MyPromise.PENDING
    // 为每个不同的 promise 添加实例结果（默认状态为 null）
    this.PromiseResult = null
    this.onFulfilledCallbacks = [] // 保存成功回调
    this.onRejectedCallbacks = [] // 保存失败回调

    // 捕获抛出异常
    try {
      // 参数是一个函数，这个函数参数会立即执行
      // 原生的 promise 里会传入 resolve 和 reject 两个参数
      // 使用 bind 绑定 this，避免 resolve 或 reject 执行时 this 丢失
      func(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(result) {
    // 执行时判断 promise 实例的状态是否为 pending 状态
    if (this.PromiseState === MyPromise.PENDING) {
      this.PromiseState = MyPromise.FULFILLED
      // 修改 promise 实例的结果
      this.PromiseResult = result

      this.onFulfilledCallbacks.forEach((callback) => {
        callback(result)
      })
    }
  }
  reject(reason) {
    // 执行时判断 promise 实例的状态是否为 pending 状态
    if (this.PromiseState === MyPromise.PENDING) {
      this.PromiseState = MyPromise.REJECTED
      // 修改 promise 实例的结果
      this.PromiseResult = reason

      this.onRejectedCallbacks.forEach((callback) => {
        callback(reason)
      })
    }
  }
  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.PromiseState === MyPromise.FULFILLED) {
        // 执行时判断 promise 实例的状态是否为 fulfilled 状态
        // 添加异步执行
        queueMicrotask(() => {
          try {
            // 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
            if (typeof onFulfilled !== 'function') {
              resolve(this.PromiseResult)
            } else {
              const x = onFulfilled(this.PromiseResult)
              resolvePromise(promise2, x, resolve, reject)
            }
          } catch (error) {
            reject(error) // 捕获前面 onFulfilled 中抛出的异常
          }
        })
      } else if (this.PromiseState === MyPromise.REJECTED) {
        // 执行时判断 promise 实例的状态是否为 rejected 状态
        // 添加异步执行
        queueMicrotask(() => {
          try {
            if (typeof onRejected !== 'function') {
              reject(this.PromiseResult)
            } else {
              const x = onRejected(this.PromiseResult)
              resolvePromise(promise2, x, resolve, reject)
            }
          } catch (error) {
            reject(error) // 捕获前面 onRejected 中抛出的异常
          }
        })
      } else if (this.PromiseState === MyPromise.PENDING) {
        // 执行时判断 promise 实例的状态是否为 pending 状态
        this.onFulfilledCallbacks.push(() => {
          // 要确保 onFulfilled 方法异步执行
          queueMicrotask(() => {
            try {
              if (typeof onFulfilled !== 'function') {
                resolve(this.PromiseResult)
              } else {
                const x = onFulfilled(this.PromiseResult)
                resolvePromise(promise2, x, resolve, reject)
              }
            } catch (error) {
              reject(error)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          // 要确保 onRejected 方法异步执行
          queueMicrotask(() => {
            try {
              if (typeof onRejected !== 'function') {
                reject(this.PromiseResult)
              } else {
                const x = onRejected(this.PromiseResult)
                resolvePromise(promise2, x, resolve, reject)
              }
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    })

    return promise2
  }
}

/**
 * 对 resolve()、reject() 进行改造增强针对 resolve() 和 reject() 中不同值情况 进行处理
 * @param  {MyPromise} promise2 promise1.then 方法返回的新的 promise 对象
 * @param  {[type]} x         promise1 中 onFulfilled 或 onRejected 的返回值
 * @param  {[type]} resolve   promise2 的 resolve 方法
 * @param  {[type]} reject    promise2 的 reject 方法
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  if (x === promise2) {
    throw new TypeError('Chaining cycle detected for promise')
  }

  // 如果 x 为 Promise ，则使 promise 接受 x 的状态
  if (x instanceof MyPromise) {
    x.then((y) => {
      resolvePromise(promise2, y, resolve, reject)
    }, reject)
  }

  // 如果 x 为对象或者函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let then

    try {
      // 把 x.then 赋值给 then
      then = x.then
    } catch (error) {
      //  如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error)
    }

    /**
     * 如果 then 是函数，将 x 作为函数的作用域 this 调用之
     * 传递两个回调函数作为参数
     * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
     */
    if (typeof then === 'function') {
      let called = false // 避免多次调用
      try {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          (r) => {
            if (called) return
            called = true
            reject(r)
          },
        )
      } catch (error) {
        if (called) return
        called = true
        reject(error)
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x)
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    return resolve(x)
  }
}

// promises-aplus-tests 测试工具要求手写的 MyPromise 上实现一个静态方法 deferred()，该方法要返回一个包含 { promise, resolve, reject } 的对象
MyPromise.deferred = function () {
  let result = {}
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
  })

  return result
}

module.exports = MyPromise
