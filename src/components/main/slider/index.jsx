/**
* @file 滑动选择器，用户选择透明度、描边粗细、阴影偏移量等
* @author sunkeke
* @date 2021-04-01
*/


import React, {Component} from 'react';
import style from './index.module.less';

export default class Slider extends Component {
    constructor() {
        super();
        this.ref = React.createRef();
    }
    state = {

    }
    componentDidMount() {
        document.body.addEventListener('mouseup', e => {
            this.isMove = false;
        });
        document.body.addEventListener('mousemove', e => {
            if (!this.isMove) {
                return;
            }
            // console.log('e.pageX=', e.pageX, 'this.pageX=', this.pageX);
            const dis = e.pageX - this.pageX;
            this.pageX = e.pageX;
            const dv = dis / (this.ref.current.offsetWidth - 1);
            const value = Math.max(Math.min(dv + Number(this.props.value), 1), 0);
            this.props.onChange(value);
        });
    }
    changeValue = (e) => {
        // e.stopPropagation();
        if (e.target.tagName.toLowerCase() === 'i') {
            // console.log('no eq');
            return;
        }
        const value = Math.min(e.nativeEvent.offsetX / (this.ref.current.offsetWidth - 1), 1);
        this.props.onChange(value);
    }
    onMouseDown = e => {
        this.isMove = true;
        this.pageX = e.pageX;
        this.changeValue(e);
    }
    render() {
        return (
            <div className={style['container'] + ' ' + this.props.className}>
                <span className={style['name']}>{this.props.name}</span>
                <div className={style['outer']} onMouseDown={this.onMouseDown} ref={this.ref}>
                    <div className={style['gray-bar']}>
                        <div className={style['inner']} style={{width: `${this.props.value * 100}%`}}>
                            <i className={style['dot']}></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
