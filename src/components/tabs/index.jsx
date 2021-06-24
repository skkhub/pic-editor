/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import TabCaijian from '../tab-caijian';
import TabMuban from '../tab-muban';
import TabWenben from '../tab-wenzi';
import TabLvjing from '../tab-lvjing';
import TabTiezhi from '../tab-tiezhi';
import {MENU} from '@/redux/const';
// import {store} from '@/redux/store';
import {connect} from 'react-redux';

class Tabs extends Component {
    constructor(props) {
        super(props);
    }
    handleClick = index => {
        if (index > -1 && !this.props.isFreezeRatio && !this.props.isLegal) {
            this.props.dispatch({
                type: 'canvas',
                tab: index
            });

            if (this.props.ce) {
                this.props.ce.run(index);
                if (index === MENU.CAIJIAN) {
                    this.props.dispatch({
                        type: 'canvas',
                        activeRatio: 0
                    });
                    this.props.ce.getMachine(MENU.CAIJIAN).setRatio(this.props.ratioList.get(0).get('ratio'));
                }
            }
            else {
                console.warn('canvasEditor尚未完成初始化');
            }

            this.props.track('导航-' + ({
                [MENU.MUBAN]: '模板',
                [MENU.CAIJIAN]: '裁剪',
                [MENU.WENZI]: '文字',
                [MENU.TIEZHI]: '贴纸',
                [MENU.LVJING]: '滤镜',
            })[index] + '点击');
        }
    }
    render() {
        let iconColor = this.props.isFreezeRatio || this.props.isLegal ? '#bdbdbd' : '#333';
        return (
            <div className={style['tabs']}>
                <ul className={style['tabs-container'] + ' ' + (this.props.isFreezeRatio || this.props.isLegal ? style['not-allowed'] : '')} onClick={this.handleClick}>
                    <li
                        className={style['tab'] + ' '
                        + (this.props.tab === MENU.MUBAN && style['active'])}
                        onClick={this.handleClick.bind(this, MENU.MUBAN)}
                    >
                        <svg
                            style={{
                                stroke: this.props.tab === MENU.MUBAN ? 'var(--bjh-pic-editor-theme-color)' : iconColor
                            }}
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="页面-1" strokeWidth="1" fillRule="evenodd">
                                <g id="q" transform="translate(-547.000000, -985.000000)">
                                    <g id="编组-78" transform="translate(523.000000, 897.000000)">
                                        <g id="编组-22" transform="translate(0.000000, 65.000000)">
                                            <g id="编组-16" transform="translate(22.000000, 23.000000)">
                                                <g id="编组-8" transform="translate(2.000000, 0.000000)">
                                                    <rect id="矩形" fill="none" strokeWidth="2" x="4" y="3" width="12" height="12"></rect>
                                                    <rect id="矩形" fill="none" strokeWidth="2" x="4" y="19" width="1" height="1"></rect>
                                                    <rect id="矩形备份-6" fill="none" strokeWidth="2" x="11" y="10" width="10" height="10"></rect>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <p>模版</p></li>
                    <li
                        className={style['tab'] + ' '
                        + (this.props.tab === MENU.CAIJIAN && style['active'])}
                        onClick={this.handleClick.bind(this, MENU.CAIJIAN)}
                    >
                        <svg style={{fill: this.props.tab === MENU.CAIJIAN ? 'var(--bjh-pic-editor-theme-color)' : iconColor}} width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                            <g id="页面-1" stroke="none" strokeWidth="1" fillRule="evenodd">
                                <g id="q" transform="translate(-547.000000, -1345.000000)">
                                    <g id="编组-78" transform="translate(523.000000, 897.000000)">
                                        <g id="编组-22" transform="translate(0.000000, 65.000000)">
                                            <g id="编组-12" transform="translate(0.000000, 360.000000)">
                                                <g id="编组-11" transform="translate(22.000000, 23.000000)">
                                                    <g id="编组-9" transform="translate(2.000000, 0.000000)">
                                                        <path d="M19,19 L19,20 C18.625,20.7341691 18.3591691,21 18,21 C17.7033309,21 17.4375,20.7341691 17,20 L17,19 L4,19 L4,6 L3,6 C2.26583093,5.56250001 2,5.29666908 2,5 C2,4.64083094 2.26583093,4.37500001 3,4 L4,4 L4,3 C4.37500001,2.26583093 4.64083094,2 5,2 C5.29666908,2 5.56250001,2.26583093 6,3 L6,4 L14.3046875,4 L13.3046875,6 L6,6 L6,15.859375 L18.3219923,2.7228279 C18.6881172,2.33250007 19.3013433,2.31287969 19.6916711,2.67900455 C19.6969696,2.68397453 19.7022121,2.68900392 19.7073975,2.6940918 C20.100709,3.08000541 20.1139857,3.70933398 19.7372998,4.11149192 L7.1862793,17.5112305 L7.1862793,17.5112305 L6,17 L17,17 L17,9.6105957 L19,7.6105957 L19,17 L20,17 C20.7341691,17.4375 21,17.7033309 21,18 C21,18.3591691 20.7341691,18.625 20,19 L19,19 Z" id="Shape-Copy" fillRule="nonzero"></path>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <p>裁剪</p></li>
                    <li
                        className={style['tab'] + ' '
                        + (this.props.tab === MENU.WENZI && style['active'])}
                        onClick={this.handleClick.bind(this, MENU.WENZI)}
                    >
                        <svg
                            style={{
                                stroke: this.props.tab === MENU.WENZI ? 'var(--bjh-pic-editor-theme-color)' : iconColor,
                                fill: this.props.tab === MENU.WENZI ? 'var(--bjh-pic-editor-theme-color)' : iconColor
                            }}
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="页面-1" strokeWidth="1" fillRule="evenodd">
                                <g id="q" transform="translate(-547.000000, -1162.000000)">
                                    <g id="编组-78" transform="translate(523.000000, 897.000000)">
                                        <g id="编组-22" transform="translate(0.000000, 65.000000)">
                                            <g id="编组-18" transform="translate(22.000000, 200.000000)">
                                                <g id="编组-77" transform="translate(2.000000, 0.000000)">
                                                    <rect id="矩形" fill="none" strokeWidth="2" x="4" y="4" width="16" height="16"></rect>
                                                    <rect id="矩形" stroke="none" x="7" y="8" width="10" height="2"></rect>
                                                    <rect id="矩形备份-36" stroke="none" transform="translate(12.000000, 12.500000) rotate(-90.000000) translate(-12.000000, -12.500000) " x="7.5" y="11.5" width="9" height="2"></rect>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <p>文字</p></li>
                    <li
                        className={style['tab'] + ' '
                        + (this.props.tab === MENU.TIEZHI && style['active'])}
                        onClick={this.handleClick.bind(this, MENU.TIEZHI)}
                    >
                        <svg style={{fill: this.props.tab === MENU.TIEZHI ? 'var(--bjh-pic-editor-theme-color)' : iconColor}} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" >
                            <g id="svg" stroke="none" strokeWidth="1" fillRule="evenodd">
                                <g id="贴纸" transform="translate(-2.000000, -2.000000)" fillRule="nonzero">
                                    <path d="M24,0 L0,0 L0,24 L24,24 L24,0 Z M23,1 L23,23 L1,23 L1,1 L23,1 Z" id="矩形备份-5" fillOpacity="0"></path>
                                    <path d="M12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 Z M12,4 C16.418278,4 20,7.581722 20,12 C20,16.418278 16.418278,20 12,20 C7.581722,20 4,16.418278 4,12 C4,7.581722 7.581722,4 12,4 Z" id="椭圆形"></path>
                                    <path d="M8.5,7.5 C7.3954305,7.5 6.5,8.3954305 6.5,9.5 C6.5,10.6045695 7.3954305,11.5 8.5,11.5 C9.6045695,11.5 10.5,10.6045695 10.5,9.5 C10.5,8.3954305 9.6045695,7.5 8.5,7.5 Z" id="椭圆形" ></path>
                                    <path d="M16.5833883,13.0009039 C16.7879112,13.0009039 16.9580125,13.1482462 16.9932878,13.3425945 L17,13.4174809 C17,15.9488356 14.7614237,18.0009039 12,18.0009039 C9.31320933,18.0009039 7.12138604,16.0582592 7.0048717,13.6216445 L7,13.4174809 C7,13.1873919 7.18652403,13.0009039 7.41661308,13.0009039 L16.5833883,13.0009039 Z" id="路径" ></path>
                                    <path d="M15.5,7.5 C14.3954305,7.5 13.5,8.3954305 13.5,9.5 C13.5,10.6045695 14.3954305,11.5 15.5,11.5 C16.6045695,11.5 17.5,10.6045695 17.5,9.5 C17.5,8.3954305 16.6045695,7.5 15.5,7.5 Z" id="椭圆形备份-3" ></path>
                                </g>
                            </g>
                        </svg>
                        <p>贴纸</p>
                    </li>
                    <li
                        className={style['tab'] + ' '
                        + (this.props.tab === MENU.LVJING && style['active'])}
                        onClick={this.handleClick.bind(this, MENU.LVJING)}
                    >
                        <svg style={{fill: this.props.tab === MENU.LVJING ? 'var(--bjh-pic-editor-theme-color)' : iconColor}} width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <g id="页面-1" stroke="none" strokeWidth="1" fillRule="evenodd">
                                <g id="q" transform="translate(-548.000000, -1255.000000)">
                                    <g id="编组-78" transform="translate(523.000000, 897.000000)">
                                        <g id="编组-22" transform="translate(0.000000, 65.000000)">
                                            <g id="编组-19" transform="translate(0.000000, 270.000000)">
                                                <g id="编组-14" transform="translate(22.000000, 23.000000)">
                                                    <g id="编组-111" transform="translate(3.000000, 0.000000)">
                                                        <path d="M7.72344176,4.29092535 C7.04758853,3.60557317 5.96378787,3.60557317 5.27575709,4.29092535 L3.80227527,5.78511658 C3.12642204,6.47046876 3.12642204,7.56950198 3.80227527,8.26720286 L16.5765102,21.2456739 C17.2523634,21.9310261 18.3361641,21.9310261 19.0241948,21.2456739 L20.4976767,19.7514827 C21.1674411,19.0661305 21.1674411,17.9609229 20.4976767,17.2817451 L7.72344176,4.29092535 Z M5.19348145,7.53446831 C5.06561731,7.40480709 5.0534398,7.18253071 5.19348145,7.03434644 L6.36288892,5.79862847 C6.42986536,5.74305937 6.52119688,5.7060133 6.60643964,5.718362 C6.69777116,5.718362 6.78910266,5.75540806 6.84999033,5.82332584 L8.72973633,7.53446831 L7.06713867,9.27030816 L5.19348145,7.53446831 Z M17.6968435,19.7514827 C17.629867,19.8194005 17.5385355,19.8564465 17.4532927,19.8564465 C17.3619612,19.8564465 17.2706297,19.8194005 17.209742,19.7514827 L8.17736816,10.4432818 L9.97591304,8.73759351 L18.9961094,18.0457944 C19.1300623,18.1939786 19.1300623,18.416255 19.0021981,18.5459163 L17.6968435,19.7514827 Z M5.62281685,14.0834349 L4.35635314,16.4605573 L2,17.7571696 L4.35635314,19.0599561 L5.62281685,21.4370786 L6.90754685,19.0599561 L9.25172248,17.7571696 L6.90754685,16.4605573 L5.62281685,14.0834349 Z M14.3851074,6.30400522 L15.2876515,4.58885134 L16.98614,3.6520026 L15.2876515,2.70074081 L14.3851074,1 L13.44703,2.70074081 L11.7556481,3.6520026 L13.44703,4.58885134 L14.3851074,6.30400522 Z M19.9959759,10.759688 L20.6961771,9.47681953 L22,8.75968804 L20.6961771,8.05052469 L19.9959759,6.75968804 L19.2796781,8.05052469 L18,8.75968804 L19.2796781,9.47681953 L19.9959759,10.759688 Z" id="Shape" fillRule="nonzero"></path>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <p>滤镜</p></li>
                </ul>
                <div className={style['content']}>
                    <TabCaijian show={this.props.tab === MENU.CAIJIAN} />
                    <TabMuban   show={this.props.tab === MENU.MUBAN}   />
                    <TabWenben  show={this.props.tab === MENU.WENZI}  />
                    <TabLvjing  show={this.props.tab === MENU.LVJING}  />
                    <TabTiezhi  show={this.props.tab === MENU.TIEZHI}  />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    return {
        ce: state.get('canvas').get('ce'),
        tab: state.get('canvas').get('tab'),
        ratioList: state.get('canvas').get('ratioList'),
        isFreezeRatio: state.get('canvas').get('isFreezeRatio'),
        isLegal: state.get('canvas').get('isLegal'),
        track: state.get('event').get('track'),
    };
};

export default connect(mapStateToProps)(Tabs);
