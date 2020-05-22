const { queueUpAll } = require('../dist/index')

let funcs = queueUpAll([
    async()=>new Promise(r=>setTimeout(()=>{console.log('a done');r()}, 1000)),
    async()=>new Promise(r=>setTimeout(()=>{console.log('b done');r()}, 1000))
])

funcs[0]()
funcs[0]()
funcs[1]()
funcs[0]()