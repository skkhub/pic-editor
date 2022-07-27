/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React from 'react';
import ReactDOM from 'react-dom';
import ReactEditor from './App.jsx';
import {store} from './redux/store';

class Editor {
    /**
    * @constructor Editor
    * @desc 图片编辑器构造函数
    * @param {HTMLElement|string} ele 编辑器绑定的dom节点或者dom对应的id字符串
    * @param {object} options 配置项
    * @param {string} options.format 输出图片格式，jpeg或者png
    * @param {string} options.quality 输出图片压缩比，范围0-1，默认0.92，只对jpeg生效
    * @param {string} options.theme 主题色，默认是rgb(56, 85, 213)
    * @param {string} options.backgroundColor canvas背景色，默认黑色
    * @param {string} options.layerColor 蒙层颜色，目前用在2个地方：元素超出图片区域的地方，裁剪框外
    * @param {number|string} options.width canvas宽
    * @param {number|string} options.height canvs高
    * @param {string} options.image 要处理的图片url
    * @param {function} options.sure 确定按钮执行的方法
    * @param {string} options.sureText 确定按钮的文本，默认“确定”
    * @param {function} options.cancel 取消按钮执行的方法
    * @param {string} options.cancelText 取消按钮文本，默认“取消”，当为空时，不展示该按钮
    * @param {Object[]} options.ratioList 裁剪的比例列表，不传则使用自带的比例列表
    * @param {string} options.ratioList[].name 比例显示文本
    * @param {number} options.ratioList[].ratio 比例数值，宽除以高的值
    * @param {object} options.limit 限制配置项
    * @param {number} options.limit.count 添加元素上限，超过这个数会提示元素过多，默认30
    * @param {number} options.limit.memorySize 单位：MB 生成图片大小限制，若超过，会递归压缩；0表示无大小限制，默认0
    * @param {boolean} options.limit.isLegal 是否正版图片，正版图片只支持裁剪，不支持模板、贴纸、文字、滤镜、翻转、旋转
    * @param {object} options.limit.ratio 比例及最小宽高限制，若配置了此项，则name、minWidth、minHeight都必传
    * @param {string} options.limit.ratio.name 比例显示文本
    * @param {number} options.limit.ratio.minWidth 裁剪最小宽
    * @param {number} options.limit.ratio.minHeight 裁剪最小高
    */
    constructor(ele, options) {
        const dom = typeof ele === 'string' ? document.querySelector(ele)
            : ele instanceof HTMLElement ? ele : null;
        if (!dom) {
            throw Error('请传入正确的dom节点或者id作为pic-editor的根元素!');
        }
    
        ReactDOM.render(
            <ReactEditor {...options} />,
            dom
        );
    }
    /**
    * @desc 重新加载一张图片
    * @param {string} url 图片地址
    */
    loadImage(url) {
        store.dispatch({
            type: 'canvas.image',
            value: url
        });
    }
}

export default Editor;
