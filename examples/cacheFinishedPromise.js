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