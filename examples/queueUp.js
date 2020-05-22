const {queueUp} = require('../dist/index')

let a = queueUp(async()=>new Promise(r=>setTimeout(() => {
    console.log('hello')
    r()
}, 1000)))

a()
a()
a()