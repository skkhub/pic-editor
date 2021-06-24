# src目录说明

## index.js
- 本地开发入口文件，打包时不会构建它，这里可以做配置实验

## main.js
- 打包入口之一，对应于lib/js/main.js

## App.jsx
- 打包入口之二，对应于lib/js/react.editor.js，是个react组件（入口配置放在里scripts/build.js第53行）

## assets/
- 资源目录

## cavnas-editor/
- sdk相关代码，会被打包成core.editor.js

### index.js
- sdk入口文件

### class.main.js
- 编辑器主文件

### class.clip.js
- 裁剪零件类

### class.filter.js
- 滤镜零件类

### class.paster.js
- 贴纸零件类

### class.text.js
- 文字零件类

### class.tpl.js
- 模板零件类

### change-corner.js
- 改变默认的编辑元素的四个角及功能，在class.main.js被调用

### history.js
- 操作历史类，单例输出

### utils.js
- 工具方法，目前只用到了formatFloat

## components/
- 操作面板组件目录

### layout/
- 布局

### main/
- 核心，其中引入了sdk并初始化配置

#### color-box
- 颜色选择面板，独立的组件，未接入redux

#### slider
- 滑块，独立的组件，未接入redux

#### toolbar
- 编辑元素的操作条，通用的有层级，对于文字有字体、填充颜色、描边颜色、阴影、加粗、下划线、斜体等等

### img-toolbar
- 图片编辑条，包括后退、前进、旋转、翻转、对比

### tabs/
- 导航

### tab-muban
- 模板相关的操作面板

### tab-caijain
- 裁剪相关的操作面板

### tab-wenzi
- 文字相关的操作面板

### tab-tiezhi
- 贴纸相关的操作面板

### tab-lvjing
- 滤镜相关的操作面板

### footer
- 右下角，包含确定、取消、保存模板的按钮

### carousel
- 轮播组件，独立的组件，未接入redux

## redux
- 状态管理

### const.js
- 常量定义

### font-list.js
- 字体列表，最初开发的方案，后来由于考虑要与端共用资源，字体资源改为后端传输，所以没用了。但是目前（2021.5.25）得知，app无法做到与端共用资源。后期可以考虑本地化此资源

### ratio-list.js
- 比例列表，默认的，如果外部没传入对应配置，则会应用这个

### store.js
- 常规store.js

## utils/
- 工具

### http.js
- axios封装，对错误做了统一的拦截及报错，具体的报错形式，可以配置，比如弹窗形式
- 当状态码==0，才会resolve，且resolve的是状态码同级data的下级

# 根目录其他文件说明

## out/
- jsdoc生成的文档目录

## mock/
- 本地开发的模拟数据

## lib/
- 构建产物目录，发版时也是发布的这个

## package.json
- 项目配置文件，发版时会自动发布该文件

### 字段说明
- name：sdk名
- main：sdk入口文件
- module：esmodlue的入口文件
- files：发版时要发布的文件或目录，目前只有lib，完全发布太大，会报错
