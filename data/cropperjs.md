# cropperjs 插件封装

## 包含的功能

* 图片的渲染功能（里面还有一个检测图片是否存在的自定义事件） **renderImg()** 函数

* 将文件数据转换成可视化数据呈现在页面上面（包含上传的数据和 blob 数据）**setImg()** 函数

* 图片裁切功能 **ClipImg()** 函数

* 删除界面显示的图片 **deleteImg()**

* 保存图片文件功能，可用于图片上传 **saveFile()**

* 图片销毁功能 **destroy()**

## 代码 (引用的代码在最下面)

```javascript
import Cropper from 'cropperjs'
import { EventDispatcher } from './EventDispatcher'
import hintMessage from './hintMessage'
export default class cropperjsClass extends EventDispatcher {

  cropper: any = null
  imgExit: boolean = false
  constructor(config: any) {
    super()
    this.renderImg()
  }
  renderImg() {
    const that = this
    this.imgExit = false
    this.dispatchEvent('imgExistStatus', false)
    const image = document.getElementById('cropperjsImg') as HTMLImageElement;
    this.cropper = new Cropper(image, {
      aspectRatio: 1 / 1,
      checkCrossOrigin: true,
      viewMode: 1,
      autoCrop: false,
      ready() {
        
        that.imgExit = true
        that.dispatchEvent('imgExistStatus', true)
      }
    });
    
    
  }
  setImg(file: any) {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      this.cropper?.replace(event.target.result)
    }
    reader.readAsDataURL(file)
  }
  ClipImg() {
    if (!this.cropper?.cropped) {
      hintMessage('warning', '请先选择裁剪区域')
      return
    }
    this.cropper.getCroppedCanvas().toBlob((blob: any) => {
      // this.renderImg()
      this.setImg(blob)
    }, 'image/png')
  }
  deleteImg() {
    this.imgExit = false
    this.dispatchEvent('imgExistStatus', false)
    this.destroy()
    this.renderImg()
  }
  saveFile() {
    return new Promise((resolve, reject) => {
      if (this.cropper.getCroppedCanvas()) {
        this.cropper.getCroppedCanvas().toBlob((blob: any) => {
          const file = new File([blob], 'img.png', {type: 'image/png'})
          resolve(file)
        }, 'image/png')
      } else {
        resolve(null)
      }
    })
  }
  destroy() {
    if (this.cropper) {
      this.cropper.destroy()
      this.cropper = null
    }
  }
}
```

## 类引用代码

```javascript
// file import { EventDispatcher } from './EventDispatcher'
class EventDispatcher {
  private _listeners: { [key: string]: Function[] } = {};

  addEventListener(type: string, listener: Function): void {
    if (this._listeners[type] === undefined) this._listeners[type] = [];
    if (this._listeners[type].indexOf(listener) === -1) {
      this._listeners[type].push(listener);
    }
  }

  hasEventListener(type: string, listener: Function): boolean {
    return this._listeners[type] !== undefined && this._listeners[type].indexOf(listener) !== -1;
  }

  removeEventListener(type: string, listener: Function): void {
    const listenerArray = this._listeners[type];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(eventType: string, data: any): void {
    const handlers = this._listeners[eventType];
    if (handlers) {
      handlers.forEach((handler: Function) => {
        handler(data);
      });
    }
  }
}

export { EventDispatcher };
// file import hintMessage from './hintMessage'
import { ElMessage } from 'element-plus'

type MessageType = 'info' | 'success' | 'warning' | 'error';

const hintMessage = (type: MessageType, content: string) => {
  ElMessage({
    message: content,
    type: type,
  })
};

export default hintMessage
```
