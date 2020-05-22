# @anfo/promisequeue

I am going to use my poor English to demostrate the simple usage of this lib. .. ok fine I m giving up

## 我是怎么想起来要弄个这个呢

#### How did I think about build this?

因为有一个函数内部有异步调用，而函数内引用了全局变量或不可重入，这个时候我希望它保持互斥，也就是函数本身有一个小队列，在被调用之后就会进入等待直到完成下次执行才会开始，当然这个函数可以在任何时候被调用。

Because there is an asynchronous call inside a function, and the global variable or non-reentrant is referenced in the function, at this time I want it to remain mutually exclusive, that is, the function itself has a small queue, and it will wait until it is completed after being called. The second execution will start, of course, this function can be called at any time.

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