function timeoutRacePromise(promise, timeout){
    return Promise.race([timeoutPromise(timeout), promise]);
}
function timeoutPromise(timeout){
    return new Promise((r, reject)=>setTimeout(()=>{reject('timeout')}, timeout))
}

class PromiseQueue{
    constructor(){
        this._promise = Promise.resolve();
    }
    /**
     * 
     * @param {Function} promiseFunc 返回一个Promise，该promise在上一个promise完成(r/reject)后执行 
     * @param {Number} timeout 该proimse会在timeout后自动完成(reject)，不管promiseFunc返回的promise是否完成
     */
    finally(promiseFunc, timeout){
        let currentPromise = this._promise;
        this._promise = new Promise(r=>{
            currentPromise.finally(()=>{
                r();
            });
        }).then(()=>{
            if(timeout){
                return timeoutRacePromise(promiseFunc(), timeout);
            }else{
                return promiseFunc();
            }
        });
        return this;
    }
    currentPromise(){
        return this._promise
    }
}
// 添加规律的接口
// finally[n]s , e.g. finally5s 5000 timeout
// finally3s 3000 timeout
// finally[n]ms e.g. finally300ms
PromiseQueue = new Proxy(PromiseQueue, {
    construct(target, args){
        return new Proxy(new target(...args), {
            get(target, key){
                let res = /^finally(\d+)s$/.exec(key)
                let res2 = /^finally(\d+)ms$/.exec(key)
                if(res || res2){
                    let time = res && res[1] || res2 && res2[1]
                    let unit = res ? 1000 : 1
                    return new Proxy(Reflect.get(target, 'finally'), {
                        apply(target, ctx, args){
                            return Reflect.apply(target, ctx, [...args, time * unit],)
                        }
                    })
                }
                return Reflect.get(target, key)
            }
        }) 
    }
})

function queueUp(promiseFunc, timeout, queue = new PromiseQueue){
    return function(...args){
        //此处的this指针是被调用时决定的,当然使用箭头函数this就无法被修改了
        queue.finally(async ()=>promiseFunc.call(this, ...args), timeout)
        return queue.currentPromise()
    }
}

function queueUpAll(promiseFuncs, defaultTimeout){
    let queue = new PromiseQueue
    let functions = []
    promiseFuncs.forEach(func=>{
        let timeout
        if(func instanceof Array){
            timeout = func[1] != null ? func[1] : defaultTimeout
            func = func[0]
        }
        //timeout func
        functions.push(queueUp(func, timeout, queue))
    })
    return functions
}

function _cachePromise(options){
    let {
        promiseFunc,
        finishedTimeout,
        timeout
    } = options || {}
    let prevCallTime
    let prevCallPromise
    return queueUp(async function(...args){
        let callPromiseFunc = ()=>promiseFunc?.call(this, ...args)
        let now = Date.now()
        let ret
        if(prevCallTime && now - prevCallTime < (finishedTimeout || timeout)){
            ret = prevCallPromise || callPromiseFunc()
        }else{
            prevCallPromise = callPromiseFunc()
            ret = prevCallPromise
        }
        if(finishedTimeout){
            return ret.finally(()=>{prevCallTime = Date.now()})
        }else{
            prevCallTime = now
            return ret
        }
    })
}
// 一定时间内连续请求这个promise，返回它的缓存
function cacheFinishedPromise(promiseFunc, timeout = 100){
    return _cachePromise({
        promiseFunc, 
        finishedTimeout: timeout
    })
}
function cachePromise(promiseFunc, timeout = 100){
    return _cachePromise({
        promiseFunc,
        timeout,
    })
}

// 往后节流
function delayFunc(func, timeout = 500){
    let instance
    return function(...rest){
        return new Promise((r, reject)=>{
            if(instance){
                clearTimeout(instance)
                instance = null
            }
            instance = setTimeout(()=>{
                r(func.bind(this, ...rest)?.call())
            }, timeout)
        })
    }
}

let lib = {
    PromiseQueue,
    timeoutRacePromise,
    timeoutPromise,
    queueUp,
    queueUpAll,
    cachePromise,
    cacheFinishedPromise,
    delayFunc,
}

export default lib
module.exports = lib