const { PromiseQueue } = require('../dist/index')

let queue = new PromiseQueue

queue.finally(async ()=>new Promise(r=>{
    setTimeout(() => {
        console.log('done')
        r()
    }, 1000);
})).finally(async ()=>new Promise(r=>{
    setTimeout(() => {
        console.log('done')
        r()
    }, 1000);
})).finally(async ()=>new Promise(r=>{
    setTimeout(() => {
        console.log('done')
        r()
    }, 1000);
}))