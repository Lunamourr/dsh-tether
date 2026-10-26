// 老 WebView 垫片:在页面自己的脚本之前、所有 frame 里跑。
//
// dsh 前端要 Promise.withResolvers(Chrome 119 起)和 AbortSignal.any(Chrome 116 起)。
// 华为机的 com.huawei.webview 停在 Chromium 114,又不跟 Google Play 更新,两个都没有:
// dsh 的 index.html 里 `__DSH_BOOT_READY__` 那句当场抛,随后 RemoteStream.read 再抛一次,
// 客户端就进「connection lost, retry #N」死循环,界面永远停在「正在加载工作区…」。
// 实测 dsh 0.2.1-rc.2 发给浏览器的那几个包只缺这两个 API,别的新东西没用到。
//
// 判据是「typeof 不是 function 才补」:不看 UA、不看版本号 —— 版本号随厂商定制漂,
// 能力检测对任何引擎都成立,引擎自己有了这段就什么都不做。
;(function () {
  function define(target, name, value) {
    if (!target || typeof target[name] === 'function') return
    Object.defineProperty(target, name, { value: value, writable: true, configurable: true })
  }

  define(Promise, 'withResolvers', function withResolvers() {
    var resolve
    var reject
    var promise = new Promise(function (res, rej) {
      resolve = res
      reject = rej
    })
    return { promise: promise, resolve: resolve, reject: reject }
  })

  define(typeof AbortSignal === 'undefined' ? null : AbortSignal, 'any', function any(signals) {
    var list = Array.prototype.slice.call(signals)
    var controller = new AbortController()
    for (var i = 0; i < list.length; i++) {
      if (list[i].aborted) {
        controller.abort(list[i].reason)
        return controller.signal
      }
    }
    // 谁先中止就取谁的 reason,随后把其余监听摘掉 —— 原生语义如此
    function onAbort() {
      for (var k = 0; k < list.length; k++) list[k].removeEventListener('abort', onAbort)
      controller.abort(this.reason)
    }
    for (var j = 0; j < list.length; j++) list[j].addEventListener('abort', onAbort)
    return controller.signal
  })
})()
