/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import './index.less';
import '@/assets/iconfont/style.less';
import {Provider} from 'react-redux';
import {store} from '@/redux/store';

import Layout from './components/layout/index.jsx';
import Footer from './components/footer';
import Tabs from './components/tabs';
import Main from './components/main';
import initialRatioList from './redux/ratio-list';

class EditorReact extends Component {
    /**
    * @desc 图片编辑器react组件构造函数
    * @param {object} props 配置项
    * @param {string} props.format 输出图片格式，jpeg或者png
    * @param {string} props.quality 输出图片压缩比，范围0-1，默认0.92，只对jpeg生效
    * @param {string} props.theme 主题色，默认是rgb(56, 85, 213)
    * @param {string} props.backgroundColor canvas背景色，默认黑色
    * @param {string} props.layerColor 蒙层颜色，目前用在2个地方：元素超出图片区域的地方，裁剪框外
    * @param {number|string} props.width canvas宽
    * @param {number|string} props.height canvs高
    * @param {string} props.image 要处理的图片url
    * @param {function} props.sure 确定按钮执行的方法
    * @param {string} props.sureText 确定按钮的文本，默认“确定”
    * @param {function} props.cancel 取消按钮执行的方法
    * @param {string} props.cancelText 取消按钮文本，默认“取消”，当为’‘时，不展示该按钮
    * @param {Object[]} props.ratioList 裁剪的比例列表，不传则使用自带的比例列表
    * @param {string} props.ratioList[].name 比例显示文本
    * @param {number} props.ratioList[].ratio 比例数值，宽除以高的值
    * @param {object} props.limit 限制配置项
    * @param {number} props.limit.count 添加元素上限，超过这个数会提示元素过多，默认30
    * @param {number} props.limit.memorySize 单位：MB 生成图片大小限制，若超过，会递归压缩；0表示无大小限制，默认0
    * @param {boolean} props.limit.isLegal 是否正版图片，正版图片只支持裁剪，不支持模板、贴纸、文字、滤镜、翻转、旋转
    * @param {object} props.limit.ratio 比例及最小宽高限制，若配置了此项，则name、minWidth、minHeight都必传
    * @param {string} props.limit.ratio.name 比例显示文本
    * @param {number} props.limit.ratio.minWidth 裁剪最小宽
    * @param {number} props.limit.ratio.minHeight 裁剪最小高
    */
    constructor(props) {
        super(props);
        let {theme, ratioList, limit, message, track, ...restProps} = props;

        if (typeof message === 'function') {
            store.dispatch({
                type: 'event',
                message
            });
        }
        if (typeof track === 'function') {
            store.dispatch({
                type: 'event',
                track
            });
        }
        store.dispatch({
            type: 'canvas',
            ...restProps
        });

        if (ratioList?.length > 0) {
            store.dispatch({
                type: 'canvas',
                ratioList,
                isReactiveOriginalRatio: false // 如果用户自己传了比例列表，这里就取消对列表第一个的响应
            });
        }
        else {
            // 外界没传，则使用默认比例列表
            store.dispatch({
                type: 'canvas',
                ratioList: initialRatioList,
                isReactiveOriginalRatio: true
            });
        }

        if (limit) {
            if (limit.ratio) {
                const {name, minWidth, minHeight} = limit.ratio;
                store.dispatch({
                    type: 'canvas',
                    ratioList: [{
                        name,
                        ratio: minWidth / minHeight
                    }],
                    isReactiveOriginalRatio: false,
                    isFreezeRatio: true,
                    minWidth: minWidth,
                    minHeight: minHeight
                });
            }
            if (limit.count) {
                store.dispatch({
                    type: 'canvas',
                    limitCount: limit.count
                });
            }
            if (limit.memorySize) {
                store.dispatch({
                    type: 'canvas',
                    limitMemorySize: limit.memorySize
                });
            }
            if (limit.isLegal) {
                store.dispatch({
                    type: 'canvas',
                    isLegal: Boolean(limit.isLegal),
                });
            }
        }

        if (theme) {
            store.dispatch({
                type: 'canvas',
                theme
            });
            store.dispatch({
                type: 'text',
                fill: theme,
            });
        }

        document.body.style.setProperty('--bjh-pic-editor-theme-color', store.getState().get('canvas').get('theme'));
    }

    // componentWillReceiveProps(nextProps) {
    //     console.log('nextProps', nextProps);
    //     // 针对图片url的变化做响应
    //     const {image} = nextProps;
    //     if (image && store.getState().get('canvas').get('image') !== image) {
    //         try {
    //             // 解决报错：Reducers may not dispatch actions
    //             setTimeout(() => {
    //                 console.log('nextProps setTimeout dispatch image=', image);
    //                 store.dispatch({
    //                     type: 'canvas.image',
    //                     value: image
    //                 });
    //             });
    //         }
    //         catch(err) {
    //             console.log('图片编辑器中 redux 报错：', err);
    //         }
    //     }
    // }
    componentWillUnmount() {
        // console.log('Editor will unmount');
        // console.log(store.getState().get('canvas').get('ce'));
        // 要在reset之前调用ce的destroy，否则ce会是null
        store.getState().get('canvas').get('ce')?.destroy();
        store.dispatch({
            type: 'reset'
        });
        // 销毁时，重制数据
        // store.dispatch({
        //     type: 'tpl',
        //     curTag: 2,
        //     curTemp: '2-0'
        // });
        // // 清空历史记录

        // store.dispatch({
        //     type: 'canvas',
        //     isFreezeRatio: false,
        //     isReactiveOriginalRatio: true,
        //     minWidth: 0,
        //     minHeight: 0,
        // });

        // store.dispatch({
        //     type: 'text',
        //     fontFamily: '',
        //     fontImg: '',
        //     fill: 'rgb(56, 85, 213, 1)',
        //     fillOpacity: 1,
        //     stroke: null, // 描边不支持rgba格式
        //     strokeWidth: 0,
        //     underline: false,
        //     linethrough: false,
        //     fontWeight: false,
        //     fontStyle: false,
        //     shadow: {}
        // });
    }
    render () {
        return (
            this.props.image ?
                <Provider store={store}>
                    {/* 这里的className是命名空间的作用，不可删去 */}
                    <div className='bjh-pic-editor' style={{height: '100%'}}>
                        <Layout
                            right={<Main image={this.props.image} />}
                            left={<Tabs />}
                            footer={<Footer sureText={this.props.sureText} cancelText={this.props.cancelText} />}
                        />
                    </div>
                </Provider> : null);
    }
}

export default EditorReact;
