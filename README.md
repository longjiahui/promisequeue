# @anfo/promisequeue

I am going to use my poor English to demostrate the simple usage of this lib. .. ok fine I m giving up

## 我是怎么想起来要弄个这个呢

#### How did I think about build this?

因为有一个函数内部有异步调用，而函数内引用了全局变量或不可重入，这个时候我希望它保持互斥，也就是函数本身有一个小队列，在被调用之后就会进入等待直到完成下次执行才会开始，当然这个函数可以在任何时候被调用。

Because there is an asynchronous call inside a function, and the global variable or non-reentrant is referenced in the function, at this time I want it to remain mutually exclusive, that is, the function itself has a small queue, and it will wait until it is completed after being called. The second execution will start, of course, this function can be called at any time.

## quick start

```bash
npm install @anfo/promisequeue
```

```javascript
import { queueUp } from '@anfo/promsiequeue' 
```

## example

### queueUp(function: Function, timeout: Number)

参数的函数会保持原来的this指针和参数传递

The parameter function will keep the original this pointer and parameter passing

tips: 
- 传入箭头函数，this不可改变，会保持箭头函数的this(Pass in the arrow function, this cannot be changed, it will keep this of the arrow function)
- 传入普通函数，则this为此处原来的this(Incoming ordinary functions, this is the original this here)

```javascript
const {queueUp} = require('@anfo/promisequeue')

let a = queueUp(async()=>new Promise(r=>setTimeout(() => {
    console.log('hello')
    r()
}, 1000)))

a()
a()
a()
```

### queueUpAll(functions: Array, timeout: Number)

a function can be like: 
```javascript
async()=>{} or [async()=>{}, 1000/*timeout*/]
```

```javascript
const { queueUpAll } = require('@anfo/promiseQueue')

let funcs = queueUpAll([
    async()=>new Promise(r=>setTimeout(()=>{console.log('a done');r()}, 1000)),
    async()=>new Promise(r=>setTimeout(()=>{console.log('b done');r()}, 1000))
])

funcs[0]()
funcs[0]()
funcs[1]()
funcs[0]()
```

### PromiseQueue.prototype.finally(promiseFunc: Function that return a Promise, timeout: Number)

```javascript
const { PromiseQueue } = require('@anfo/promisequeue')

let queue = new PromiseQueue

queue.finally(async ()=>new Promise(r=>{
    setTimeout(() => {
        console.log('done')
        r()
    }, 1000)
})).finally(async ()=>new Promise(r=>{
    setTimeout(() => {
        console.log('done')
        r()
    }, 1000)
})).finally(async ()=>new Promise(r=>{
    setTimeout(() => {
        console.log('done')
        r()
    }, 1000)
}))
```

### cachePromise(promiseFunc: Function that return a Promise, timeout: Number)

一个返回Promise的函数连续调用时，在timeout时间间隔内的连续调用会返回上一次调用的缓存

When a function that returns Promise is called continuously, the consecutive calls within the timeout interval will return the cache of the last call

```javascript
const { cachePromise } = require('../dist/index')

let i = 0
const cached = cachePromise(()=>new Promise(r=>setTimeout(()=>r(i++), 1000)), 200)

;(async()=>{
    let a = await cached()
    console.log(a)
})()
setTimeout(async ()=>{
    let a = await cached()
    console.log(a)
}, 100)
setTimeout(async ()=>{
    let a = await cached()
    console.log(a)
}, 200)
setTimeout(async ()=>{
    let a = await cached()
    console.log(a)
}, 500)
```

### cacheFinishedPromise(promiseFunc: Function that return a Promise, timeout: Number)

返回一个queueUp的函数，连续的调用，会在上一次的调用结束后才被调用，同时如果再被调用与上一次调用完成之间的时间间隔小于timeout，则会返回上一次调用的缓存

Return a queueUp function. Continuous calls will be called after the last call ends. At the same time, if the time interval between being called again and the last call is less than timeout, it will return to the cache of the last call

```javascript
const { cacheFinishedPromise } = require('../dist/index')

let i = 0
const cached = cacheFinishedPromise(()=>new Promise(r=>setTimeout(()=>r(i++), 1000)), 200)

;(async()=>{
    let a = await cached()
    console.log(a)
})()
setTimeout(async ()=>{
    let a = await cached()
    console.log(a)
}, 100)
setTimeout(async ()=>{
    let a = await cached()
    console.log(a)
}, 200)
setTimeout(async ()=>{
    let a = await cached()
    console.log(a)
}, 1300)
```

### delayFunc(func: Function, timeout: Number)

返回一个延迟调用的函数，例如输入的回调函数，在timeout时间内的连续调用，只有最后一次的调用会生效

Return a delayed call function, such as input callback function, continuous call within timeout time, only the last call will take effect

```javascript
const { delayFunc } = require('../dist/index')

const delayCall = delayFunc(()=>{console.log('search')}, 1000)

delayCall()
delayCall()
delayCall()
delayCall()
delayCall()
```