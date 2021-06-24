/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import {CanvasEditor, Clip, Tpl, Text, Filter, Paster} from '@/canvas-editor';
import {connect} from 'react-redux';
import Toolbar from './toolbar';
import ImgToolbar from '@/components/img-toolbar';
import {MENU} from '@/redux/const';
import {getUniqueString} from '@/utils';

const IMGURL = 'https://p1.pstatp.com/origin/dfic-imagehandler/fa00d42f-d50e-4439-bab6-2c310e908e1d?timestamp=1608101875695';
// const IMGURL = 'https://weiliicimg9.pstatp.com/weili/ms/260915500917457048.jpg';
// const IMGURL = 'https://p1.pstatp.com/origin/dfic-imagehandler/c22e456b-9a89-4a2a-bf68-7cd652ca433f?timestamp=1610603992015';
// const IMGURL = 'https://guarantee.cdn.bcebos.com/pic-editor/paster/temp03.png';
// const IMGURL = '';
// const WIDTH = 653;
// const HEIGHT = 371;
const WIDTH = 467;
const HEIGHT = 264;
// 因这些dom会放到body下，为防止污染，这里命名需要尽量保证全局唯一
const CANVAS_ID = 'bjh-pic-editor-canvas-' + getUniqueString();
const LOADING_ID = 'bjh-pic-editor-loading-' + getUniqueString();
const TOOLBAR_ID = 'bjh-pic-editor-toolbar-' + getUniqueString();
const BTN_ID = 'bjh-pic-editor-btn-clip-' + getUniqueString();

class Main extends Component {
    constructor(props) {
        super(props);
        this.toolbar = React.createRef();
        this.props.dispatch({
            type: 'canvas',
            image: props.image
        });
    }
    componentDidMount() {
        const {minWidth, minHeight, layerColor} = this.props;
        const ce = new CanvasEditor({
            id: CANVAS_ID,
            width: this.props.width,
            height: this.props.height,
            padding: 4,
            url: this.props.image,
            quality: this.props.quality,
            format: this.props.format, // 当设置为jpeg时，裁剪的右下两边可能会有黑线，建议配置为png，或者不配置，默认为png
            loadingId: LOADING_ID,
            // toolbarId: TOOLBAR_ID,
            theme: this.props.theme,
            backgroundColor: this.props.backgroundColor,
            // backgroundColor: '#f6f8f9',
            layerColor: this.props.layerColor,
            limitCount: this.props.limitCount,
            // machines配置的顺序与常量MENU有关，这里如果改变了顺序，记得要改MENU里的顺序
            machines: [
                new Tpl(),
                new Clip({
                    btnId: BTN_ID,
                    layerColor,
                    minHeight,
                    minWidth,
                    // 点击“确认裁剪”时的回调函数
                    complete: ({ratio}) => {
                        // this.props.dispatch({
                        //     type: 'canvas',
                        //     showRestore: true
                        // });
                        let trackData = this.props.trackData.toJS();
                        trackData.cut = true;
                        this.props.dispatch({
                            type: 'event',
                            trackData: trackData
                        });
                        if (this.props.isReactiveOriginalRatio) {
                            this.props.dispatch({
                                type: 'canvas.originalRatio',
                                value: ratio
                            });
                        }
                        if (this.props.isFreezeRatio) {
                            ce.clearHistory(true);
                            this.props.dispatch({
                                type: 'canvas',
                                isFreezeRatio: false,
                                allowRotate: false
                            });
                        }
                    }
                }),
                new Text(),
                new Paster(),
                new Filter()
            ]
        });
        const toolbar = this.toolbar.current;
        // const toolbarOffsetWidth = 376;
        const self = this;
        function positionToolbar(e) {
            const target = e.target;
            // const point = target.getCoords()[3];
            // const y = Math.max(...target.getCoords().map(point => point.y));
            // const x = target.getCenterPoint().x;
            // // console.log('positionToolbar', target.getCenterPoint());
            // const toolbarOffsetWidth = target.type === 'i-text' ? 376 : 36;
            // toolbar.style.width = toolbarOffsetWidth + 'px';
            // toolbar.style.left = x - toolbarOffsetWidth / 2 + 'px';
            // toolbar.style.top = y + 20 + 'px';

            self.props.dispatch({
                type: 'canvas',
                toolbarType: target.type
            });
            if (target.type === 'i-text') {

                let {fill, stroke, strokeWidth, fontFamily, underline, linethrough, fontWeight, fontStyle, shadow} = target;
                // console.log('shadow=', shadow, stroke, strokeWidth, underline, linethrough, fontWeight, fontStyle);
                // 在target原型上居然有strokeWidth == 1,所以这里判断如果不是自身的strokeWidth，则手动赋值为0
                // if (!target.hasOwnProperty('strokeWidth')) {
                //     strokeWidth = 0;
                // }
                
                // console.log('position', strokeWidth);
                shadow = shadow || {
                    offsetX: 0,
                    offsetY: 0,
                    color: 'rgb(102, 102, 102)',
                    blur: 0
                };

                self.props.dispatch({
                    type: 'text',
                    fill,
                    stroke,
                    strokeWidth,
                    fontFamily,
                    underline,
                    linethrough,
                    shadow,
                    fontWeight: fontWeight === 'bold' || Number(fontWeight) > 550,
                    fontStyle: fontStyle === 'italic' || fontStyle === 'oblique',
                    fontImg: self.props.fontList.find(item => item.get('fontFamily') === fontFamily)?.get('preview')
                });
            }
        }
        ce.onSelectionCreated = e => {
            // console.log('select create', e, this.toolbar);
            // this.toolbarComponent.open('hidden');
            positionToolbar(e);
            toolbar.style.display = 'flex';
        };
        // ce.onObjectMoved = e => {
        //     // console.log('moved' , e, this.toolbar);
        //     positionToolbar(e);
        // };
        // ce.onObjectScaled = e => {
        //     // console.log('scaled');
        //     positionToolbar(e);
        // };
        // ce.onObjectRotated = e => {
        //     // console.log('rotated');
        //     positionToolbar(e);
        // };
        ce.beforeSelectionCleared = e => {
            // console.log('select, clear', e);
            setTimeout(() => {
                toolbar.style.display = 'none';
            }, 0);
        };
        // ce.onObjectMouseDown = e => {
        //     // console.log('mouse down');
        //     toolbar.style.display = 'none';
        // };
        // ce.onObjectMouseUp = e => {
        //     // positionToolbar(e);
        //     toolbar.style.display = 'flex';
        // };
        ce.onHistoryChange = ({showBack, showForward}) => {
            // 解决报错：Reducers may not dispatch actions
            setTimeout(() => {
                // 初始化时也会触发change，此时showBack, showForward都是false，这里allowSaveTemp要赋值为false，其他情况，只要历史记录变更，说明有操作，就赋值为true
                this.props.dispatch({
                    type: 'canvas',
                    showBack,
                    showForward,
                    allowSaveTemp: ce.getSize() > 0
                });
            });
        };
        ce.onSizeChange = info => {
            if (this.props.isReactiveOriginalRatio) {
                setTimeout(() => {
                    // 解决报错：Reducers may not dispatch actions
                    this.props.dispatch({
                        type: 'canvas.originalRatio',
                        value: info.ratio
                    });
                });
                if (this.props.activeRatio === 0 && this.props.ce) {
                    // console.log('第一个 原图比例', ce.getMachine(MENU.CAIJIAN), this.props.ce.getMachine(MENU.CAIJIAN));
                    this.props.ce.getMachine(MENU.CAIJIAN).setRatio(info.ratio);
                }
            }
        };
        ce.onMessage = info => {
            this.props.message(info);
        };
        ce.ready = () => {
            const initTab = this.props.isFreezeRatio || this.props.isLegal ? MENU.CAIJIAN : MENU.MUBAN;
            // 注意: 初始运行的machine在这里设置！！！
            ce.run(initTab);
            if (minWidth && minHeight) {
                ce.getMachine(MENU.CAIJIAN).setRatio(minWidth / minHeight);
            }
            this.props.dispatch({
                type: 'canvas',
                ce,
                tab: initTab
            });
        };
    }
    // onRef = toolbarThis => {
    //     this.toolbarComponent = toolbarThis;
    // }
    render() {
        return (
            <div className={style.main}>
                <Toolbar
                    id={TOOLBAR_ID}
                    userRef={this.toolbar}
                    // onRef={this.onRef}
                />
                <div className={style['canvas-container']} style={{width: this.props.width, height: this.props.height}}>
                    <canvas id={CANVAS_ID} width={this.props.width} height={this.props.height}></canvas>
                    <div id={BTN_ID} className={style['btn-clip']}>
                        <svg className={style['icon']} width="18px" height="18px" viewBox="0 0 18 18" version="1.1" >
                            <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="操作调整" transform="translate(-989.000000, -3095.000000)">
                                    <g id="编组-34" transform="translate(983.000000, 3091.000000)">
                                        <g id="编组-30" transform="translate(7.000000, 5.000000)">
                                            <g id="编组-32" transform="translate(2.000000, 1.000000)">
                                                <polyline id="路径-5" stroke="#3855D5" strokeWidth="2" points="2 2 2 11 11 11"></polyline>
                                                <path d="M5.5,3.5 L5.5,4.5 L0.5,4.5 L0.5,3.5 L5.5,3.5 Z" id="矩形" stroke="#3855D5" fill="#D8D8D8"></path>
                                                <rect id="矩形备份-22" stroke="#3855D5" fill="#D8D8D8" transform="translate(9.000000, 9.500000) rotate(-90.000000) translate(-9.000000, -9.500000) " x="6" y="9" width="6" height="1"></rect>
                                                <circle id="椭圆形" fill="#3855D5" cx="8.79289322" cy="4.29289322" r="3.5"></circle>
                                                <polyline id="路径-7" stroke="#FFFFFF" transform="translate(8.922650, 4.483402) rotate(-360.000000) translate(-8.922650, -4.483402) " points="6.87982184 4.07713197 8.51255413 5.70986426 10.9654784 3.25694001"></polyline>
                                            </g>
                                            <rect id="矩形" strokeOpacity="0" stroke="#979797" x="0" y="0" width="16" height="16"></rect>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        完成裁剪</div>
                    <div id={LOADING_ID} className={style['loading']}>loading...</div>
                </div>
                {!this.props.isLegal && <ImgToolbar />}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => ({
    minWidth: state.get('canvas').get('minWidth'),
    minHeight: state.get('canvas').get('minHeight'),
    isFreezeRatio: state.get('canvas').get('isFreezeRatio'),
    isLegal: state.get('canvas').get('isLegal'),
    isReactiveOriginalRatio: state.get('canvas').get('isReactiveOriginalRatio'),
    limitCount: state.get('canvas').get('limitCount'),
    backgroundColor: state.get('canvas').get('backgroundColor'),
    layerColor: state.get('canvas').get('layerColor'),
    width: state.get('canvas').get('width'),
    height: state.get('canvas').get('height'),
    // image: state.get('canvas').get('image'),
    ce: state.get('canvas').get('ce'),
    theme: state.get('canvas').get('theme'),
    fontList: state.get('text').get('fontList'),
    ratioList: state.get('canvas').get('ratioList'),
    toolbarType: state.get('canvas').get('toolbarType'),
    activeRatio: state.get('canvas').get('activeRatio'),
    quality: state.get('canvas').get('quality'),
    format: state.get('canvas').get('format'),
    message: state.get('event').get('message'),
    trackData: state.get('event').get('trackData')
});

export default connect(mapStateToProps)(Main);
