# 图片编辑器

## 可用脚本命令
### `npm start` 
- 启动本地服务器
### `npm run build`
- 本地构建
- 包含2个步骤，1:构建基本版；2:将构建产物利用rollup转化为esmodlue
### `npm run pub`
- 构建后发布（需要先手动改好版本号）
- 不要用npm publish做发布，因为发布的时lib/文件夹下的东西，需要先构建新的产物再发布，而npm run pub就是构建+发布

## 关于开发
- `npm start`
- src/index.js文件是本地开发的webpack入口文件，构建时不会打包此文件，可以在这个文件里尝试各种配置

## 关于构建
- webpack打包成umd，然后由rollup再打包成esmodule，放到lib/es/目录下
- 构建时有两个源：1是src/main.js，会打包成普通js，2是src/App.jsx，会打包成react组件
- 使用普通js时就像src/index.js那样配置好即可
- 构建产物里，es/目录下即rollup打包成的esmodule文件
- 发布时只发布lib目录，且使用npm run pub即可

## 关于接入
- 构建产物有两种格式：esmodule和cmd，有两种类别：jssdk，以及带有操作面板的成品编辑器（react）
- 外部引用成品编辑器时，除了js，也要引入对应的css文件，例子：
```js
import Editor from 'path/to/pic-editor/lib/es/react.editor';
import 'path/to/pic-editor/lib/css/react.editor.css';

class Page extends Component{
  // 。。。
  render () {
    return (
      <Editor 
       // 配置项
      />
    )
  }
}
```
或者
```js
import Editor from 'path/to/pic-editor/lib/es/main';
import 'path/to/pic-editor/lib/css/react.editor.css';

const ce = new Editor('#root', {
  // 。。。配置项
});
```
- 外部想自己做界面时，可参考本代码库，只引入core.editor.js，自己开发界面，不受框架限制

## 报错表
- 10001 ajax请求出错
- 10002 在加载图片到canvas时被跨域拦截了
- 10003 添加的元素过多（目前限制最多30个）
- 10004 图片不符合比例，需要裁剪
- 10005 图片过大，保存失败

## 关于资源跨域
- 字体、贴纸这两类资源，是由接口传入的，其地址对本地会有跨域问题，可以使用谷歌跨域插件解决，或者找资源方临时加个cors配置
