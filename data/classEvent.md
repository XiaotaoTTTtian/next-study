# 自定义事件封装

## 类方法介绍

* 注册事件 (on 函数)
* 触发事件 (emit 函数)
* 注销事件 (off 函数)
* 检测事件是否存在 (has 函数)
* 事件只触发一次久注销事件 (once 函数)

## 代码

```javascript
export class CustomEvent {
  list: { [key: string]: Array<any> }
  constructor() {
    this.list = {}
  }
  // 注册事件
  on(event: string, fn: any) {
    // 判断是否订阅过这个事件，如果没有订阅过就给 event 创建一个缓存列表
    // 如果有 event 值，把 fn 加入到这个列表里面
    if (!this.list[event]) {
      this.list[event] = []
    }
    this.list[event].push(fn)
  }
  // 触发事件
  emit(event: string, payload: any) {
    // 找到这个事件对应的函数列表
    const handers = this.list[event]
    if (handers) {
      handers.forEach(hander => {
        hander(payload)
      })
    }
  }
  // 注销这个事件
  off(event: string, fn: any) {
    const handers = this.list[event]
    // 如果这个事件不存在就直接退出
    if (!handers) { return }
    const index = handers.indexOf(fn)
    if (index !== -1) {
      // 将事件从列表里面删除
      handers.splice(index, 1)
    }
  }
  // 检测这个事件是否存在
  has(event: string, fn: any) {
    const handers = this.list[event]
    if (handers) {
      return handers.indexOf(fn) !== -1
    } else {
      return false
    }
  }
  // 使这个事件只触发一次
  once(event: string, fn: any) {
    // this.on(event, fn)
    const on = (...args: any) => {
      this.off(event, on)
      fn.apply(this, args)
    }
    on.fn = fn
    this.on(event, on)
  }
}
```