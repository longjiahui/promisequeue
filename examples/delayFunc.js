const { delayFunc } = require('../dist/index')

const delayCall = delayFunc(()=>{console.log('search')}, 1000)

delayCall()
delayCall()
delayCall()
delayCall()
delayCall()