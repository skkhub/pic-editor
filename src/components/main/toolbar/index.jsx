import React, {Component} from 'react';
import style from './index.module.less';
import {connect} from 'react-redux';
import {MENU} from '@/redux/const';
// import {createPortal} from 'react-dom';
import ColorBox from '../color-box';

class TextToolbar extends Component {
    state = {
        isOpenFontList: false,
        isOpenFontColor: false,
        isOpenStrokeColor: false,
        isOpenShadow: false,
        isOpenLayer: false
    }
    componentDidMount() {
        // this.toolbar = document.getElementById(this.props.id);
        // this.props.onRef(this);
        document.addEventListener('click', e => {
            if (e?.path?.find(ele => ele.dataset?.picEditorKeepOpen)) {
                return;
            }
            // 点击所有元素，关闭弹出层，对应地，open方法里要利用setTimeout开启对应的功能
            this.setState({
                isOpenFontList: false,
                isOpenFontColor: false,
                isOpenStrokeColor: false,
                isOpenShadow: false,
                isOpenLayer: false,
            });
        });
    }
    // 修正弹窗相对于工具条的方位
    // correctBox = () => {
    //     if (this.toolbar) {
    //         const offsetY = this.toolbar.dataset.offsetY + this.toolbar.offsetHeight / 2;
    //         if (offsetY > this.props.canvasHeight / 2 && this.props.toolbarBoxPosition !== 'up') {
    //             this.props.dispatch({
    //                 type: 'canvas',
    //                 toolbarBoxPosition: 'up'
    //             });
    //         }
    //         else if (offsetY < this.props.canvasHeight / 2 && this.props.toolbarBoxPosition !== 'down') {
    //             this.props.dispatch({
    //                 type: 'canvas',
    //                 toolbarBoxPosition: 'down'
    //             });
    //         }
    //     }
    // }
    open(key) {
        setTimeout(() => {
            // this.correctBox();
            // 只要key不是以下所列的属性，就是关闭所有
            this.setState(prevState => ({
                isOpenFontList: false,
                isOpenFontColor: false,
                isOpenStrokeColor: false,
                isOpenShadow: false,
                isOpenLayer: false,
                [key]: !prevState[key]
            }));
        });
    }

    changeFont = async font => {
        const name = font.get('fontFamily');
        // this.setState({
        //     isOpenFontList: false
        // });
        // 改变字体之前先加载字体，如果已经加载过（ce通过name判断，则不会重复加载）
        await this.props.ce.getMachine(MENU.WENZI).loadFont(name, font.get('url'));
        // 改变已有文字时，不需要改变fill及stroke样式，所以不传
        this.props.ce.getMachine(MENU.WENZI).change({fontFamily: name});
        this.props.dispatch({
            type: 'text',
            fontFamily: name,
            fontImg: font.get('preview')
        });
    }
    onColorBoxChange = rules => {
        for (let [k, v] of Object.entries(rules)) {
            this.changeStyle(k, v);
        }
    }
    changeStyle = (key, value) => {
        // 当open不传参数key时，就是关闭所有弹窗
        // this.open();

        this.props.dispatch({
            type: 'text',
            [key]: value
        });
        let rules = {};

        switch (key) {
        case 'fontWeight': {
            value = value ? '700' : '400';
            // this.props.dispatch({
            //     type: 'text',
            //     fontWeight: value
            // });
            break;
        }
        case 'fontStyle': {
            value = value ? 'italic' : 'normal';
            // this.props.dispatch({
            //     type: 'text',
            //     fontStyle: value
            // });
            break;
        }
        }
        Object.assign(rules, {[key]: value});

        this.props.ce.getMachine(MENU.WENZI).change(rules);

        // const {fill, stroke} = rules;
        // if (fill !== undefined) {
        //     this.props.dispatch({
        //         type: 'text',
        //         fill
        //     });
        // }
        // if (stroke !== undefined) {
        //     this.props.dispatch({
        //         type: 'text',
        //         stroke
        //     });
        // }
    }

    changeIndex = num => {
        this.props.ce.changeIndex(num);
    }
    render() {
        const fillColorMatch = this.props.fill.match(/\((\d+\,\s?\d+\,\s?\d+)/i);
        const fillColor = fillColorMatch ? fillColorMatch[1] : this.props.fill;
        const strokeColorMatch = this.props.stroke?.match(/\((\d+\,\s?\d+\,\s?\d+)/i);
        const strokeColor = strokeColorMatch ? strokeColorMatch[1] : this.props.stroke;
        const shadowColorMatch = this.props.shadow?.color?.match(/\((\d+\,\s?\d+\,\s?\d+)/i);
        const shadowColor = shadowColorMatch ? shadowColorMatch[1] : '51, 51, 51';
        const shadowOpacityMatches = this.props.shadow?.color?.match(/\(\d+\,\s?\d+\,\s?\d+\,\s?([\d\.]+)\)/i);
        const shadowOpacity = Number(shadowOpacityMatches ? shadowOpacityMatches[1] : 1);
        const offsetX = this.props.shadow.offsetX ?? 0;
        const offsetY = this.props.shadow.offsetY ?? 0;
        const blur = this.props.shadow.blur ?? 0;
        // console.log('toolbar render shadow=', this.props.shadow, 'offsetX=', offsetX, 'offsetY=', offsetY, 'blur=', blur);
        // console.log('shadowColor=', shadowColor, 'shadowOpacity=', shadowOpacity);
        return (
            <ul className={style['menu']} id={this.props.id} ref={this.props.userRef}>
                {
                    this.props.toolbarType === 'i-text' &&(
                        <ul className={style['sub-menu'] + ' ' + style['text-menu']}>
                            <li className={style['item'] + ' ' + style['ff']}>
                                <p className={style['text']} onClick={this.open.bind(this, 'isOpenFontList')}>
                                    <span className={style['text-val']} style={{backgroundImage: `url(${this.props.fontImg})`}}>{this.props.fontImg ? '' : '匿名字体'}</span>
                                    <span className={style['text-arrow']}></span>
                                </p>
                                <ul
                                    className={style['toolbar-select'] + ' ' + style['custom-scroll-bar'] + ' ' + (this.state.isOpenFontList ? '' : style['dn'])}
                                    data-pic-editor-keep-open='true'
                                >
                                    {
                                        this.props.fontList.map((font, i) => (
                                            <li className={style['select-item']} onClick={this.changeFont.bind(this, font)} key={font.get('fontFamily')}>
                                                <div
                                                    className={style['font-content']}
                                                    style={{backgroundImage: `url(${font.get('preview')})`}}
                                                >{font.get('preview') ? '' : `匿名字体${i}`}
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </li>
                            <li className={style['item'] + ' ' + style['separator']}></li>
                            <li className={style['item'] + ' ' + style['font-b']}>
                                <i
                                    className={style['icon'] + ' icon-jiacu ' + (this.props.fontWeight ? style['active'] : '')}
                                    onClick={this.changeStyle.bind(this, 'fontWeight', !this.props.fontWeight)}
                                ></i>
                                <div className={style['toolbar-tips']}>粗体</div>
                            </li>
                            <li className={style['item'] + ' ' + style['font-i']}>
                                <i
                                    className={style['icon'] + ' icon-xieti ' + (this.props.fontStyle ? style['active'] : '')}
                                    onClick={this.changeStyle.bind(this, 'fontStyle', !this.props.fontStyle)}
                                ></i>
                                <div className={style['toolbar-tips']}>斜体</div>
                            </li>
                            <li className={style['item'] + ' ' + style['font-u']}>
                                <i
                                    className={style['icon'] + ' icon-xiahuaxian ' + (this.props.underline ? style['active'] : '')}
                                    onClick={this.changeStyle.bind(this, 'underline', !this.props.underline)}
                                ></i>
                                <div className={style['toolbar-tips']}>下划线</div>
                            </li>
                            <li className={style['item'] + ' ' + style['font-u']}>
                                <i
                                    className={style['icon'] + ' icon-shanchuxian ' + (this.props.linethrough ? style['active'] : '')}
                                    onClick={this.changeStyle.bind(this, 'linethrough', !this.props.linethrough)}
                                ></i>
                                <div className={style['toolbar-tips']}>删除线</div>
                            </li>
                            <li className={style['item'] + ' ' + style['separator']}></li>
                            <li className={style['item'] + ' ' + style['fc']}>
                                <div className={style['fc-wrap']} onClick={this.open.bind(this, 'isOpenFontColor')}>
                                    <i className={style['icon'] + ' icon-baseA'}></i>
                                    <div className={style['preview-color']} style={{backgroundColor: this.props.fill}}></div>
                                </div>
                                <div className={style['toolbar-tips']}>字体颜色</div>
                                <ColorBox
                                    type="fill"
                                    className={style['color-box'] + ' ' + (this.state.isOpenFontColor ? '' : style['dn'])}
                                    // style={{top: this.props.toolbarBoxPosition === 'up' ? -152 : 34}}
                                    color={fillColor}
                                    opacity={this.props.fillOpacity}
                                    onChange={this.onColorBoxChange}
                                />
                            </li>
                            <li className={style['item'] + ' ' + style['bsc']}>
                                <div className={style['bsc-wrap']} onClick={this.open.bind(this, 'isOpenStrokeColor')}>
                                    <div className={style['bsc-border']} style={{borderColor: `${this.props.stroke}`}}>
                                        <i className={style['icon'] + ' icon-baseA'}></i>
                                    </div>
                                </div>
                                <div className={style['toolbar-tips']}>描边颜色</div>
                                <ColorBox
                                    type="stroke"
                                    className={style['color-box'] + ' ' + (this.state.isOpenStrokeColor ? '' : style['dn'])}
                                    // style={{top: this.props.toolbarBoxPosition === 'up' ? -184 : 34}}
                                    color={strokeColor}
                                    strokeWidth={this.props.strokeWidth}
                                    onChange={this.onColorBoxChange}
                                />
                            </li>
                            <li className={style['item'] + ' ' + style['fs']}>
                                <div className={style['fs-wrap']} onClick={this.open.bind(this, 'isOpenShadow')}>
                                    <i className={style['icon'] + ' ' + style['text-shadow']} style={{boxShadow: `4px 4px ${blur}px 0 rgba(${shadowColor}, ${shadowOpacity})`}}>
                                        {/* <i className={style['icon'] + ' icon-text-shadow'} style={{color: `rgb(${shadowColor})`}}> */}
                                    </i>
                                </div>
                                <div className={style['toolbar-tips']}>投影</div>
                                <ColorBox
                                    type="shadow" 
                                    className={style['color-box'] + ' ' + (this.state.isOpenShadow ? '' : style['dn'])}
                                    // style={{top: this.props.toolbarBoxPosition === 'up' ? -236 : 34}}
                                    color={shadowColor}
                                    opacity={shadowOpacity}
                                    offsetX={offsetX}
                                    offsetY={offsetY}
                                    blur={blur}
                                    onChange={this.onColorBoxChange}
                                />
                            </li>
                        </ul>
                    )
                }
                <ul className={style['sub-menu'] + ' ' + style['common-menu']}>
                    <li className={style['item'] + ' ' + style['separator']}></li>
                    <li className={style['item'] + ' ' + style['layer']}>
                        <i
                            className={style['icon'] + ' icon-tuceng '}
                            onClick={this.open.bind(this, 'isOpenLayer')}
                        ></i>
                        <div className={style['toolbar-tips']}>层级</div>
                        <ul
                            className={style['toolbar-select'] + ' ' + (this.state.isOpenLayer ? '' : style['dn'])}
                            data-pic-editor-keep-open='true'
                        >
                            <li className={style['select-item']} onClick={this.changeIndex.bind(this, 'top')}>置顶</li>
                            <li className={style['select-item']} onClick={this.changeIndex.bind(this, 'bottom')}>置底</li>
                            <li className={style['select-item']} onClick={this.changeIndex.bind(this, 1)}>上移一层</li>
                            <li className={style['select-item']} onClick={this.changeIndex.bind(this, -1)}>下移一层</li>
                        </ul>
                    </li>
                </ul>
            </ul>
        );
    }
}

const mapStateToProps = (state, props) => ({
    ce: state.get('canvas').get('ce'),
    fontList: state.get('text').get('fontList'),
    toolbarType: state.get('canvas').get('toolbarType'),
    fontFamily: state.get('text').get('fontFamily'),
    fontImg: state.get('text').get('fontImg'),
    fill: state.get('text').get('fill'),
    fillOpacity: state.get('text').get('fillOpacity'),
    stroke: state.get('text').get('stroke'),
    strokeWidth: state.get('text').get('strokeWidth'),
    fontWeight: state.get('text').get('fontWeight'),
    fontStyle: state.get('text').get('fontStyle'),
    underline: state.get('text').get('underline'),
    linethrough: state.get('text').get('linethrough'),
    shadow: state.get('text').get('shadow')
    // toolbarBoxPosition: state.get('canvas').get('toolbarBoxPosition')
});

export default connect(mapStateToProps)(TextToolbar);
