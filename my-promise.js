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
        callback()
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
        callback()
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
  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
  finally(callback) {
    // 无论最终结果如何都要执行的情况
    return this.then(callback, callback)
  }

  /** Promise.resolve()
   * @param {[type]} value 要解析为 Promise 对象的值
   */
  static resolve(value) {
    // 如果这个值是一个 promise ，那么将返回这个 promise
    if (value instanceof MyPromise) {
      return value
    } else if (
      value instanceof Object &&
      'then' in value &&
      typeof value.then === 'function'
    ) {
      // 如果这个值是 thenable（即带有 "then" 方法），返回的 promise 会“跟随”这个 thenable 的对象，采用它的最终状态
      return new MyPromise((resolve, reject) => {
        value.then(resolve, reject)
      })
    } else {
      // 否则返回的 promise 将以此值完成，即以此值执行 resolve() 方法 (状态为 fulfilled)
      return new MyPromise((resolve) => {
        resolve(value)
      })
    }
  }

  /**
   * Promise.reject()
   * @param {[type]} reason 拒绝原因
   */
  static reject(reason) {
    // 返回一个带有拒绝原因的 Promise 对象
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }

  /**
   * Promise.all
   * @param {iterable} promises 一个 promise 的 iterable 类型（注：Array，Map，Set都属于ES6的iterable类型）的输入
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      // 参数校验
      if (Array.isArray(promises)) {
        let result = [] // 存储结果
        let count = 0 // 计数器

        // 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise
        if (promises.length === 0) {
          return resolve(promises)
        }

        promises.forEach((item, index) => {
          // MyPromise.resolve 方法中已经判断了参数是否为 promise 与 thenable 对象，所以无需在该方法中再次判断
          MyPromise.resolve(item).then(
            (value) => {
              count++
              // 每个promise执行的结果存储在 result 中
              result[index] = value
              // Promise.all 等待所有都完成（或第一个失败）
              count === promises.length && resolve(result)
            },
            (reason) => {
              // 如果传入的 promise 中有一个失败（rejected）
              // Promise.all 异步地将失败的那个结果给失败状态的回调函数，而不管其它 promise 是否完成
              reject(reason)
            },
          )
        })
      } else {
        // 如果不是可迭代对象直接抛出错误
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  /**
   * Promise.allSettled
   * @param {iterable} promises 一个 promise 的 iterable 类型（注：Array，Map，Set都属于ES6的iterable类型）的输入
   */
  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result = [] // 存储结果
        let count = 0 // 计数器

        if (promises.length === 0) return resolve(promises)

        promises.forEach((item, index) => {
          MyPromise.resolve(item).then(
            (value) => {
              count++
              // 对于每个结果对象，都有一个 status 字符串。如果它的值为 fulfilled，则结果对象上存在一个 value
              result[index] = {
                status: 'fulfilled',
                value,
              }

              count === promises.length && resolve(result)
            },
            (reason) => {
              count++
              result[index] = {
                status: 'rejected',
                reason,
              }
              // 所有给定的 promise 都已经 fulfilled 或 rejected 后,返回这个 promise
              count === promises.length && resolve(result)
            },
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  /**
   * Promise.any
   * @param {iterable} promises 一个 promise 的 iterable 类型（注：Array，Map，Set都属于ES6的iterable类型）的输入
   */
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        // 如果传入的参数是一个空的可迭代对象，则返回一个 已失败（already rejected） 状态的 Promise
        if (promises.length === 0)
          return reject(new AggregateError('All promises were rejected'))

        let errors = []
        let count = 0

        promises.forEach((item) => {
          // 非 Promise 值，通过 Promise.resolve 转换为 Promise
          MyPromise.resolve(item).then(
            (value) => {
              // 只要其中的一个 promise 成功，就返回那个已经成功的 promise
              resolve(value)
            },
            (reason) => {
              count++
              errors.push(reason)

              // 如果可迭代对象中没有一个 promise 成功，就返回一个失败的 promise 和 AggregateError 类型的实例
              // AggregateError 是 Error 的一个子类，用于把单一的错误集合在一起
              count === promises.length && reject(new AggregateError(errors))
            },
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  /**
   * Promise.race
   * @param {iterable} promises 一个 promise 的 iterable 类型（注：Array，Map，Set都属于ES6的iterable类型）的输入
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        // 如果传入的迭代 promises 是空的，则返回的 promise 将永远等待
        if (promises.length > 0) {
          // 如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺
          // 则 Promise.race 将解析为迭代中找到的第一个值
          promises.forEach((item) => {
            MyPromise.resolve(item).then(resolve, reject)
          })
        }
      } else {
        reject(new TypeError('Argument is not iterable'))
      }
    })
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
      reject(error)
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
    resolve(x)
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
