# 手写 Promise

参考 [@yuanyuanbyte](https://github.com/yuanyuanbyte) 前辈的博客，手写 Promise 核心原理，完整的 Promises/A+ 实现，通过了 Promises/A+ 官方872个测试用例测试。

## Promises/A+ 测试

### 1. 安装官方测试工具

使用 Promises/A+ 官方的测试工具 [promises-aplus-tests](https://github.com/promises-aplus/promises-tests) 来对我们的`my-promise` 进行测试

**安装 `promises-aplus-tests`:**

```shell
pnpm add promises-aplus-tests -D
```

### 2. 执行命令

就会对 my-promise.js 进行测试

```shell
pnpm test
```

## 参考文章

- [JavaScript 深入系列之 Promise 核心原理的模拟实现，通过 Promises/A+ 官方测试](https://github.com/yuanyuanbyte/Blog/issues/125)
- [JavaScript 深入系列之 Promise 实例方法 catch 和 finally 的模拟实现](https://github.com/yuanyuanbyte/Blog/issues/126)
- [JavaScript 深入系列之 Promise 静态方法 resolve、reject、all、allSettled、any 和 race 的模拟实现](https://github.com/yuanyuanbyte/Blog/issues/126)
