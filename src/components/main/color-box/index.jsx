import React, {Component} from 'react';
import style from './index.module.less';
import Slider from '../slider';

const MAX_STROKE_WIDTH = 10;
const MAX_OFFSET = 30;
const MAX_BLUR = 10;
const COLORS = [
    "255, 255, 255", "255, 186, 225", "255, 181, 198", "255, 205, 199", "255, 218, 173", "255, 241, 161", "254, 255, 186", "210, 194, 255", "186, 216, 255", "173, 250, 255", "194, 255, 242", "196, 255, 208",
    "185, 185, 185", "255, 115, 180", "240, 93, 137",  "255, 122, 117", "255, 171, 92",  "255, 217, 79",  "255, 247, 105", "141, 112, 255", "105, 160, 255", "92, 233, 255",  "153, 255, 236", "109, 242, 145",
    "136, 136, 136", "242, 70, 156",  "227, 52, 110",  "255, 76, 76",   "255, 144, 52",  "255, 201, 38",  "242, 227, 61",  "102, 71, 255",  "64, 128, 255",  "51, 221, 255",  "28, 229, 213",  "67, 229, 116",
    "112, 112, 112", "204, 49, 132",  "189, 34, 91",   "217, 54, 60",   "217, 109, 33",  "217, 161, 22",  "204, 185, 41",  "72, 50, 217",   "43, 95, 217",   "33, 180, 217",  "13, 191, 182",  "46, 191, 94",
    "0, 0, 0",       "42, 3, 21",     "71, 14, 66",    "74, 5, 37",     "92, 41, 13",    "102, 63, 0",    "188, 170, 33",  "34, 29, 100",   "4, 73, 102",    "4, 89, 90",     "0, 143, 151",   "36, 160, 72"];

class ColorBox extends Component {
    state = {
        list: COLORS,
        color: '',
        opacity: 1,
        strokeWidth: 0,
        offsetX: 0,
        offsetY: 0,
        blur: 0
    }
    pick = val => {
        if (this.props.type === 'fill') {
            const rules = {
                fill: `rgba(${val}, ${this.props.opacity})`
            };
            this.props.onChange(rules);
        }
        if (this.props.type === 'stroke') {
            const rules = {
                stroke: `rgb(${val})`,
                strokeWidth: this.props.strokeWidth
            };
            this.props.onChange(rules);
        }
        if (this.props.type === 'shadow') {
            const rules = {
                shadow: {
                    color: `rgba(${val}, ${this.props.opacity})`,
                    offsetX: this.props.offsetX,
                    offsetY: this.props.offsetY,
                    blur: this.props.blur
                }
            };
            this.props.onChange(rules);
        }
    }
    onOpacityChange = val => {
        // console.log('slider change', val);
        // this.setState({
        //     opacity: val
        // });
        const rules = {
            fill: `rgba(${this.props.color}, ${val})`
        };
        this.props.onChange(rules);
    }
    onStrokeWidthChange = val => {
        const rules = {
            stroke: `rgb(${this.props.color})`,
            strokeWidth: val * MAX_STROKE_WIDTH
        };
        this.props.onChange(rules);
        // this.setState({
        //     strokeWidth: val
        // });
    }
    onShadowOpacityChange = val => {
        const rules = {
            shadow: {
                color: `rgba(${this.props.color}, ${val})`,
                offsetX: this.props.offsetX,
                offsetY: this.props.offsetY,
                blur: this.props.blur
            }
        };
        this.props.onChange(rules);
    }
    onOffsetXChange = val => {
        const rules = {
            shadow: {
                color: `rgba(${this.props.color}, ${this.props.opacity})`,
                offsetX: val * MAX_OFFSET * 2 - MAX_OFFSET,
                offsetY: this.props.offsetY,
                blur: this.props.blur
            }
        };
        this.props.onChange(rules);
    }
    onOffsetYChange = val => {
        const rules = {
            shadow: {
                color: `rgba(${this.props.color}, ${this.props.opacity})`,
                offsetX: this.props.offsetX,
                offsetY: val * MAX_OFFSET * 2 - MAX_OFFSET,
                blur: this.props.blur
            }
        };
        this.props.onChange(rules);
    }
    onBlurChange = val => {
        const rules = {
            shadow: {
                color: `rgba(${this.props.color}, ${this.props.opacity})`,
                offsetX: this.props.offsetX,
                offsetY: this.props.offsetY,
                blur: val * MAX_BLUR
            }
        };
        this.props.onChange(rules);
    }
    render() {
        // todo：色值转换16进制为rgb格式
        return (
            <div className={style['container'] + ' ' + this.props.className} style={this.props.style} data-pic-editor-keep-open='true'>
                <ul className={style['color-list']}>
                    {
                        this.state.list.map((color, i) => (
                            <li
                                className={style['color-li'] + ' ' + (this.props.color === color ? style['active'] : '') + ' ' + (i === 0 ? style['color-li-white'] : '')}
                                style={this.props.type === 'stroke' ? {border: `2px solid rgb(${color})`} : {backgroundColor: `rgb(${color})`}}
                                onClick={this.pick.bind(this, color)}
                                key={color}
                            ></li>
                        ))
                    }
                </ul>
                {this.props.type === 'fill' && <Slider className={style['slider']} name='不透明度' value={this.props.opacity} onChange={this.onOpacityChange} />}
                {this.props.type === 'stroke' && <Slider className={style['slider']} name='描边粗细' value={this.props.strokeWidth / MAX_STROKE_WIDTH} onChange={this.onStrokeWidthChange} />}
                {this.props.type === 'shadow' && (
                    <>
                        <Slider className={style['slider']} name='不透明度' value={this.props.opacity} onChange={this.onShadowOpacityChange} />
                        <Slider className={style['slider']} name='X轴偏移度' value={(this.props.offsetX + MAX_OFFSET) / MAX_OFFSET / 2} onChange={this.onOffsetXChange} />
                        <Slider className={style['slider']} name='Y轴偏移度' value={(this.props.offsetY + MAX_OFFSET) / MAX_OFFSET / 2} onChange={this.onOffsetYChange} />
                        <Slider className={style['slider']} name='模糊度' value={this.props.blur / MAX_BLUR} onChange={this.onBlurChange} />
                    </>
                )}
            </div>
        );
    }
}

export default ColorBox;
