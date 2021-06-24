/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import {connect} from 'react-redux';
// import {store} from '@/redux/store';

class ImgToolbar extends Component {
    back = () => {
        if (this.props.showBack) {
            this.props.ce.back();
            this.props.track('撤销点击');
        }
    }
    forward = () => {
        if (this.props.showForward) {
            this.props.ce.forward();
            this.props.track('重做点击');
        }
    }
    rotate = () => {
        if (this.props.allowRotate) {
            this.props.ce.rotate(90);
            this.props.track('旋转点击');
        }
    }
    flipX = () => {
        this.props.ce.flipX();
        this.props.track('左右翻转点击');
    }
    flipY = () => {
        this.props.ce.flipY();
        this.props.track('上下翻转点击');
    }
    contrast = show => {
        this.props.ce.contrast(show);
        this.props.track('对比点击');
    }
    render() {
        return (
            <ul className={style.toolbar}>
                <li className={style.item + ' ' + (this.props.showBack ? '' : style['not-allowed'])} onClick={this.back}>
                    <div className={style['toolbar-tips']}>撤销</div>
                    <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="封面编辑ui" transform="translate(-564.000000, -691.000000)">
                                <g id="编组-23" transform="translate(564.000000, 691.000000)">
                                    <g id="编组-31" transform="translate(6.000000, 5.000000)" stroke={this.props.showBack ? '#999baa' : '#ccc'} strokeWidth="2">
                                        <path d="M3.71902571,3 L7.5,3 C9.98528137,3 12,5.01471863 12,7.5 C12,9.98528137 9.98528137,12 7.5,12 L0,12 L0,12" id="路径"></path>
                                        <polyline id="路径" transform="translate(5.828427, 2.828427) rotate(-45.000000) translate(-5.828427, -2.828427) " points="3.82842712 4.82842712 3.82842712 0.828427125 7.82842712 0.828427125"></polyline>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </li>
                <li className={style.item + ' ' + (this.props.showForward ? '' : style['not-allowed'])} onClick={this.forward}>
                    <div className={style['toolbar-tips']}>重做</div>
                    <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="封面编辑ui" transform="translate(-2406.000000, -691.000000)">
                                <g id="编组-80" transform="translate(2015.000000, 247.000000)">
                                    <g id="编组-28" transform="translate(349.000000, 444.000000)">
                                        <g id="编组-27" transform="translate(42.000000, 0.000000)">
                                            <g id="编组-31备份" transform="translate(12.000000, 11.000000) scale(-1, 1) translate(-12.000000, -11.000000) translate(6.000000, 5.000000)" stroke={this.props.showForward ? '#999BAA' : '#ccc'} strokeWidth="2">
                                                <path d="M3.71902571,3 L7.5,3 C9.98528137,3 12,5.01471863 12,7.5 C12,9.98528137 9.98528137,12 7.5,12 L0,12 L0,12" id="路径"></path>
                                                <polyline id="路径" transform="translate(6.171573, 2.828427) rotate(-45.000000) translate(-6.171573, -2.828427) " points="4.17157288 4.82842712 4.17157288 0.828427125 8.17157288 0.828427125"></polyline>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </li>
                <li className={style.item + ' ' + (this.props.allowRotate ? '' : style['not-allowed'])} onClick={this.rotate}>
                    <div className={style['toolbar-tips']}>旋转</div>
                    <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="页面-1" stroke={this.props.allowRotate ? '#999baa' : '#ccc'} strokeWidth="1" fill="none" fillRule="evenodd" opacity="0.99">
                            <g id="封面编辑ui" transform="translate(-2448.000000, -691.000000)">
                                <g id="编组-80" transform="translate(2015.000000, 247.000000)">
                                    <g id="编组-28" transform="translate(349.000000, 444.000000)">
                                        <g id="编组-29备份" transform="translate(84.000000, 0.000000)">
                                            <rect id="矩形" strokeWidth="2" x="7" y="12" width="8" height="7" rx="1"></rect>
                                            <path id="路径" strokeWidth="2" d="M10.4478303,6.82842712 C10.5137508,6.82842712 11.1316754,6.82913584 11.1972576,6.83054608 C15.9804025,6.93339946 19.8447224,10.7678252 19.9954357,15.5390416 C19.9984709,15.6351311 20,15.9223087 20,16.0191353"></path>
                                            <polyline id="路径" strokeWidth="2" transform="translate(11.828427, 6.828427) rotate(-45.000000) translate(-11.828427, -6.828427) " points="9.82842712 8.82842712 9.82842712 4.82842712 13.8284271 4.82842712"></polyline>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </li>
                <li className={style.item} onClick={this.flipX}>
                    <div className={style['toolbar-tips']}>左右翻转</div>
                    <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="封面编辑ui" transform="translate(-690.000000, -691.000000)">
                                <g id="编组-28" transform="translate(564.000000, 691.000000)">
                                    <g id="编组-100" transform="translate(126.000000, 0.000000)">
                                        {/* <rect id="矩形备份-11" fill="#FFFFFF" x="0" y="0" width="24" height="24" rx="4"></rect> */}
                                        <g id="编组-70" transform="translate(4.500000, 5.000000)" fill="#999BAA">
                                            <path d="M2.91602515,5.62403772 L5.31509993,9.2226499 C5.46827616,9.45241425 5.40618923,9.76284892 5.17642489,9.91602515 C5.09429113,9.97078099 4.99778728,10 4.89907479,10 L0.100925213,10 C-0.175217162,10 -0.399074787,9.77614237 -0.399074787,9.5 C-0.399074787,9.40128751 -0.369855774,9.30478366 -0.315099935,9.2226499 L2.08397485,5.62403772 C2.23715108,5.39427338 2.54758575,5.33218644 2.7773501,5.48536267 C2.83227624,5.5219801 2.87940772,5.56911158 2.91602515,5.62403772 Z" id="三角形" transform="translate(2.500000, 7.500000) rotate(-270.000000) translate(-2.500000, -7.500000) "></path>
                                            <path d="M12.9160251,5.62403772 L15.3150999,9.2226499 C15.4682762,9.45241425 15.4061892,9.76284892 15.1764249,9.91602515 C15.0942911,9.97078099 14.9977873,10 14.8990748,10 L10.1009252,10 C9.82478284,10 9.60092521,9.77614237 9.60092521,9.5 C9.60092521,9.40128751 9.63014423,9.30478366 9.68490007,9.2226499 L12.0839749,5.62403772 C12.2371511,5.39427338 12.5475858,5.33218644 12.7773501,5.48536267 C12.8322762,5.5219801 12.8794077,5.56911158 12.9160251,5.62403772 Z" id="三角形备份-4" transform="translate(12.500000, 7.500000) rotate(-90.000000) translate(-12.500000, -7.500000) "></path>
                                            <rect id="矩形" x="6.5" y="0" width="2" height="3"></rect>
                                            <rect id="矩形备份-25" x="6.5" y="4" width="2" height="3"></rect>
                                            <rect id="矩形备份-26" x="6.5" y="8" width="2" height="3"></rect>
                                            <rect id="矩形备份-27" x="6.5" y="12" width="2" height="3"></rect>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </li>
                <li className={style.item} onClick={this.flipY}>
                    <div className={style['toolbar-tips']}>上下翻转</div>
                    <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <title>编组 28</title>
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="封面编辑ui" transform="translate(-732.000000, -691.000000)">
                                <g id="编组-28" transform="translate(564.000000, 691.000000)">
                                    <g id="编组-29备份-3" transform="translate(168.000000, 0.000000)">
                                        {/* <rect id="矩形备份-11" fill="#FFFFFF" x="0" y="0" width="24" height="24" rx="4"></rect> */}
                                        <g id="编组-70备份-2" transform="translate(12.500000, 12.500000) rotate(-270.000000) translate(-12.500000, -12.500000) translate(5.000000, 5.000000)" fill="#999BAA">
                                            <path d="M2.91602515,5.62403772 L5.31509993,9.2226499 C5.46827616,9.45241425 5.40618923,9.76284892 5.17642489,9.91602515 C5.09429113,9.97078099 4.99778728,10 4.89907479,10 L0.100925213,10 C-0.175217162,10 -0.399074787,9.77614237 -0.399074787,9.5 C-0.399074787,9.40128751 -0.369855774,9.30478366 -0.315099935,9.2226499 L2.08397485,5.62403772 C2.23715108,5.39427338 2.54758575,5.33218644 2.7773501,5.48536267 C2.83227624,5.5219801 2.87940772,5.56911158 2.91602515,5.62403772 Z" id="三角形" transform="translate(2.500000, 7.500000) rotate(-270.000000) translate(-2.500000, -7.500000) "></path>
                                            <path d="M12.9160251,5.62403772 L15.3150999,9.2226499 C15.4682762,9.45241425 15.4061892,9.76284892 15.1764249,9.91602515 C15.0942911,9.97078099 14.9977873,10 14.8990748,10 L10.1009252,10 C9.82478284,10 9.60092521,9.77614237 9.60092521,9.5 C9.60092521,9.40128751 9.63014423,9.30478366 9.68490007,9.2226499 L12.0839749,5.62403772 C12.2371511,5.39427338 12.5475858,5.33218644 12.7773501,5.48536267 C12.8322762,5.5219801 12.8794077,5.56911158 12.9160251,5.62403772 Z" id="三角形备份-4" transform="translate(12.500000, 7.500000) rotate(-90.000000) translate(-12.500000, -7.500000) "></path>
                                            <rect id="矩形" x="6.5" y="0" width="2" height="3"></rect>
                                            <rect id="矩形备份-25" x="6.5" y="4" width="2" height="3"></rect>
                                            <rect id="矩形备份-26" x="6.5" y="8" width="2" height="3"></rect>
                                            <rect id="矩形备份-27" x="6.5" y="12" width="2" height="3"></rect>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </li>
                <li className={style.item + ' ' + style['contrast']} onMouseDown={this.contrast.bind(this, false)} onMouseUp={this.contrast.bind(this, true)}>
                    <div className={style['toolbar-tips']}>{/*文案在css的after伪元素中定义*/}</div> 
                    <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="vs" fillRule="nonzero">
                                {/* <rect id="矩形备份-12" fill="#FFFFFF" x="0" y="0" width="24" height="24" rx="4"></rect> */}
                                <g id="编组-26" transform="translate(5.000000, 5.000000)" fill="#999BAA">
                                    <path d="M8,4 L1,4 C-0.1045695,4 -1,4.8954305 -1,6 L-1,13 C-1,14.1045695 -0.1045695,15 1,15 L8,15 C9.1045695,15 10,14.1045695 10,13 L10,6 C10,4.8954305 9.1045695,4 8,4 Z M1,6 L8,6 L8,13 L1,13 L1,6 Z" id="矩形"></path>
                                    <circle id="椭圆形" cx="4.5" cy="9.5" r="1.5"></circle>
                                    <g id="编组-25" transform="translate(3.000000, 0.000000)">
                                        <polygon id="矩形" points="9 9 7 9 7 11 9 11"></polygon>
                                        <polygon id="矩形备份-14" points="11 9 9 9 9 11 11 11"></polygon>
                                        <polygon id="矩形备份-15" points="11 6 9 6 9 8 11 8"></polygon>
                                        <polygon id="矩形备份-16" points="11 3 9 3 9 5 11 5"></polygon>
                                        <polygon id="矩形备份-17" points="11 -5.55111512e-17 9 -5.55111512e-17 9 2 11 2"></polygon>
                                        <polygon id="矩形备份-18" points="8 -5.55111512e-17 6 -5.55111512e-17 6 2 8 2"></polygon>
                                        <polygon id="矩形备份-19" points="5 -5.55111512e-17 3 -5.55111512e-17 3 2 5 2"></polygon>
                                        <polygon id="矩形备份-20" points="2 -5.55111512e-17 -5.55111512e-17 -5.55111512e-17 -5.55111512e-17 2 2 2"></polygon>
                                        <polygon id="矩形备份-21" points="2 2 -5.55111512e-17 2 -5.55111512e-17 4 2 4"></polygon>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </li>
            </ul>
        );
    }
}
const mapStateToProps = (state, props) => ({
    ce: state.get('canvas').get('ce'),
    showBack: state.get('canvas').get('showBack'),
    showForward: state.get('canvas').get('showForward'),
    allowRotate: state.get('canvas').get('allowRotate'),
    track: state.get('event').get('track'),
});

export default connect(mapStateToProps)(ImgToolbar);
