# **中台FLV视频播放详解**

## 包含的功能

* 类及播放器的初始化

* 视频追帧

* 断线重连

### 初始化播放器

```javascript
import flvjs from 'mpegts.js'
import EventEmit from './event'

const DEFAULT_OPTIONS = {
  element: '', // video element
  frameTracking: true, // 追帧设置
  reconnect: true, // 断流后重连
  reconnectInterval: 1000, // 重连间隔 (ms)
  maxReconnectAttempts: null, // 最大重连次数（为 null 则不限制次数）
  trackingDelta: 2, // 追帧最大延迟
  trackingPlaybackRate: 1.1, // 追帧时的播放速率
}
export class FlvExtend extends EventEmit {
  // 视频播放实例
  player = null
  // 尝试重连播放器的次数
  reconnectAttempts = 0
  constructor(options) {
    // 调用这个函数会继承父类的一些公共方法并调用父类的构造函数
    super()
    // 合并配置项
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    // 元素的 dom
    this.videoElement = this.options.element
    this.#validateOptions()
  }
  // 参数合法性校验，不合法会抛出错误
  #validateOptions() {
    if (this.videoElement) {
      throw new Error('options 中缺少 element 参数！')
    }
    // 追帧的速率不能小于 1
    if (this.options.trackingPlaybackRate < 1) {
      throw new Error('trackingPlaybackRate 参数不能小于 1！')
    }
    // 重连间隔不能小于 0
    if (this.options.reconnectInterval <= 0) {
      this.options.reconnectInterval = 1000
    }
  }
  /**
   * 初始化播放器
   *
   * flv github 文档地址 https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsloggingcontrol
   *
   * @param {number} mediaDataSource 播放器需要的一些基本参数，如 url、类型等
   * @param {number} config 播放器的一些额外配置选项
   * @returns void
   *
   * @type {Function}
   */
  init(mediaDataSource, config = {}) {
    if (this.player) {
      this.destroy()
    }
    // 保存这些参数供重建播放器的时候使用
    this.mediaDataSource = mediaDataSource
    this.config = config
    if (this.videoElement) {
      // 创建播放器
      this.player = flvjs.createPlayer(mediaDataSource, config)
      // 将 dom 元素连接上这个播放器实例
      this.player.attachMediaElement(this.player)
      // 开始加载播放器
      this.player.load()
    }
  }
  /**
   * 销毁
   *
   * @returns void
   *
   * @type {Function}
   */
  destroy() {
    if (this.player) {
      this.player.detachMediaElement()
      this.player.destroy()
      this.player = null
    }
    // 清理事件处理程序
    this.videoElement.removeEventListener('progress', onProgress)
    // 清除定时器
    this.timeout && clearTimeout(this.timeout)
  }
}
```

### 视频追帧

添加了 ***#chaseFrame()** 追帧函数， ***onProgress()*** 事件处理函数和 ***update()*** 视频更新到最新的函数

```javascript
import flvjs from 'mpegts.js'
import EventEmit from './event'

const DEFAULT_OPTIONS = {
  element: '', // video element
  frameTracking: true, // 追帧设置
  reconnect: true, // 断流后重连
  reconnectInterval: 1000, // 重连间隔 (ms)
  maxReconnectAttempts: null, // 最大重连次数（为 null 则不限制次数）
  trackingDelta: 2, // 追帧最大延迟
  trackingPlaybackRate: 1.1, // 追帧时的播放速率
}
export class FlvExtend extends EventEmit {
  // 视频播放实例
  player = null
  // 尝试重连播放器的次数
  reconnectAttempts = 0
  constructor(options) {
    // 调用这个函数会继承父类的一些公共方法并调用父类的构造函数
    super()
    // 合并配置项
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    // 元素的 dom
    this.videoElement = this.options.element
    this.#validateOptions()
  }
  // 参数合法性校验，不合法会抛出错误
  #validateOptions() {
    if (this.videoElement) {
      throw new Error('options 中缺少 element 参数！')
    }
    // 追帧的速率不能小于 1
    if (this.options.trackingPlaybackRate < 1) {
      throw new Error('trackingPlaybackRate 参数不能小于 1！')
    }
    // 重连间隔不能小于 0
    if (this.options.reconnectInterval <= 0) {
      this.options.reconnectInterval = 1000
    }
  }
  /**
   * 初始化播放器
   *
   * flv github 文档地址 https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsloggingcontrol
   *
   * @param {number} mediaDataSource 播放器需要的一些基本参数，如 url、类型等
   * @param {number} config 播放器的一些额外配置选项
   * @returns void
   *
   * @type {Function}
   */
  init(mediaDataSource, config = {}) {
    if (this.player) {
      this.destroy()
    }
    // 保存这些参数供重建播放器的时候使用
    this.mediaDataSource = mediaDataSource
    this.config = config
    if (this.videoElement) {
      // 创建播放器
      this.player = flvjs.createPlayer(mediaDataSource, config)
      // 将 dom 元素连接上这个播放器实例
      this.player.attachMediaElement(this.player)
      // 开始加载播放器
      this.player.load()
    }
  }
  /**
   * 销毁
   *
   * @returns void
   *
   * @type {Function}
   */
  destroy() {
    if (this.player) {
      this.player.detachMediaElement()
      this.player.destroy()
      this.player = null
    }
    // 清理事件处理程序
    this.videoElement.removeEventListener('progress', onProgress)
    // 清除定时器
    this.timeout && clearTimeout(this.timeout)
  }
  /**
   * 追帧
   *
   * @returns void
   *
   * @type {Function}
   */
  #chaseFrame () {
    if (this.options.frameTracking) {
      // progress 事件会在请求接收到数据的时候被周期性触发
      this.videoElement.removeEventListener('progress', onProgress)
      this.videoElement.addEventListener('progress', onProgress)
    }
  }
  /**
   * progress 事件的处理函数
   *
   * @returns void
   *
   * @type {Function}
   */
  onProgress() {
    // 如果播放器不存在或者缓冲区不存在则直接返回，不执行下面代码
    if (!this.player || !this.player?.buffered.length) return
    // buffered 属性表示媒体资源已经缓冲的范围
    // 获取当前 buffered 值 (缓冲区末尾)
    let end = this.player.buffered.end(0)
    // 获取 buffered 与当前播放位置的差值
    let delta = end - this.player.currentTime 
    // 延迟过大，通过跳帧的方式更新视频
    if (delta > 10 || delta < 0) {
      this.update()
      return
    }
    // 延迟较小时，通过调整播放速度的方式来追帧
    if (delta > this.options.trackingDelta) {
      this.videoElement.playbackRate = this.options.trackingPlaybackRate
    } else {
      this.videoElement.playbackRate = 1
    }
  }
  /**
   * 更新视频到最新
   *
   * @returns void
   *
   * @type {Function}
   */
  update() {
    if (this.player && this.player.buffered.length) {
      // 直接更改 currentTime 的值到缓冲去末尾
      this.player.currentTime = this.player.buffered.end(0) - 1
    }
  }
}
```

### 断线重连

增加了 ***tryReconnect()*** 函数和 ***rebuild()*** 相机重建函数

```javascript
import flvjs from 'mpegts.js'
import EventEmit from './event'

const DEFAULT_OPTIONS = {
  element: '', // video element
  frameTracking: true, // 追帧设置
  reconnect: true, // 断流后重连
  reconnectInterval: 1000, // 重连间隔 (ms)
  maxReconnectAttempts: null, // 最大重连次数（为 null 则不限制次数）
  trackingDelta: 2, // 追帧最大延迟
  trackingPlaybackRate: 1.1, // 追帧时的播放速率
}
export class FlvExtend extends EventEmit {
  // 视频播放实例
  player = null
  // 尝试重连播放器的次数
  reconnectAttempts = 0
  constructor(options) {
    // 调用这个函数会继承父类的一些公共方法并调用父类的构造函数
    super()
    // 合并配置项
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    // 元素的 dom
    this.videoElement = this.options.element
    this.#validateOptions()
  }
  // 参数合法性校验，不合法会抛出错误
  #validateOptions() {
    if (this.videoElement) {
      throw new Error('options 中缺少 element 参数！')
    }
    // 追帧的速率不能小于 1
    if (this.options.trackingPlaybackRate < 1) {
      throw new Error('trackingPlaybackRate 参数不能小于 1！')
    }
    // 重连间隔不能小于 0
    if (this.options.reconnectInterval <= 0) {
      this.options.reconnectInterval = 1000
    }
  }
  /**
   * 初始化播放器
   *
   * flv github 文档地址 https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsloggingcontrol
   *
   * @param {number} mediaDataSource 播放器需要的一些基本参数，如 url、类型等
   * @param {number} config 播放器的一些额外配置选项
   * @returns void
   *
   * @type {Function}
   */
  init(mediaDataSource, config = {}) {
    if (this.player) {
      this.destroy()
    }
    // 保存这些参数供重建播放器的时候使用
    this.mediaDataSource = mediaDataSource
    this.config = config
    if (this.videoElement) {
      // 创建播放器
      this.player = flvjs.createPlayer(mediaDataSource, config)
      // 将 dom 元素连接上这个播放器实例
      this.player.attachMediaElement(this.player)
      // 开始加载播放器
      this.player.load()
    }
  }
  /**
   * 销毁
   *
   * @returns void
   *
   * @type {Function}
   */
  destroy() {
    if (this.player) {
      this.player.detachMediaElement()
      this.player.destroy()
      this.player = null
    }
    // 清理事件处理程序
    this.videoElement.removeEventListener('progress', onProgress)
    // 清除定时器
    this.timeout && clearTimeout(this.timeout)
  }
  /**
   * 追帧
   *
   * @returns void
   *
   * @type {Function}
   */
  #chaseFrame () {
    if (this.options.frameTracking) {
      // progress 事件会在请求接收到数据的时候被周期性触发
      this.videoElement.removeEventListener('progress', onProgress)
      this.videoElement.addEventListener('progress', onProgress)
    }
  }
  /**
   * progress 事件的处理函数
   *
   * @returns void
   *
   * @type {Function}
   */
  onProgress() {
    // 如果播放器不存在或者缓冲区不存在则直接返回，不执行下面代码
    if (!this.player || !this.player?.buffered.length) return
    // buffered 属性表示媒体资源已经缓冲的范围
    // 获取当前 buffered 值 (缓冲区末尾)
    let end = this.player.buffered.end(0)
    // 获取 buffered 与当前播放位置的差值
    let delta = end - this.player.currentTime 
    // 延迟过大，通过跳帧的方式更新视频
    if (delta > 10 || delta < 0) {
      this.update()
      return
    }
    // 延迟较小时，通过调整播放速度的方式来追帧
    if (delta > this.options.trackingDelta) {
      this.videoElement.playbackRate = this.options.trackingPlaybackRate
    } else {
      this.videoElement.playbackRate = 1
    }
  }
  /**
   * 更新视频到最新
   *
   * @returns void
   *
   * @type {Function}
   */
  update() {
    if (this.player && this.player.buffered.length) {
      // 直接更改 currentTime 的值到缓冲去末尾
      this.player.currentTime = this.player.buffered.end(0) - 1
    }
  }
  /**
   * 视频重连函数
   *
   * @returns void
   *
   * @type {Function}
   */
  tryReconnect() {
    // 播放器发生了错误，一般为网络错误，这时候就开始进行重连操作
    this.player.on(flvjs.Events.ERROR, () => {
      const { reconnect, reconnectInterval, maxReconnectAttempts } = this.options
      if (!reconnect) { return }
      if (!maxReconnectAttempts || (maxReconnectAttempts && this.reconnectAttempts < maxReconnectAttempts)) {
        this.timeout = setTimeout(() => {
          this.reconnectAttempts++
          // 重建播放器
          this.rebuild()
        }, reconnectInterval)
      } else {
        // 重连次数耗尽，重连失败
        // 将这个消息通知给组件内，在组件内进行相应的逻辑处理
        this.emit('tryReconnectFilled')
      }
    })
  }
  /**
   * 视频重建
   *
   * @returns void
   *
   * @type {Function}
   */
   rebuild() {
    this.destroy()
    this.init(this.mediaDataSource, this.config)
   }
}
```
