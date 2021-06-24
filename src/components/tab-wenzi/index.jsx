/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import {connect} from 'react-redux';
import {MENU} from '@/redux/const';
import {Carousel, CarouselItem} from '@/components/carousel';
import {fromJS} from 'immutable';
import {post} from '@/utils/http';


class TabWenzi extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    componentDidMount() {
        post('/pcui/template/gettemplates', {
            type: 'element',
            element: 'font'
        })
            .then(res => {
                // 将字体的协议转换成线上相同的协议防止跨域（目前是将http转成https，当然，字体url本身http和https都支持访问）
                for (let obj of res.list) {
                    obj.url = obj.url.replace(/^http(s)?:/i, window.location.protocol);
                }
                let fontListGroup = [];
                for (let i = 0, len = res.list.length; i < len; i += 12) {
                    fontListGroup.push(res.list.slice(i, i + 12));
                }

                this.props.dispatch({
                    type: 'text',
                    fontList: fromJS(res.list),
                    fontListGroup: fromJS(fontListGroup)
                });
            });

        post('/pcui/template/gettemplates', {
            type: 'element',
            element: 'stroke'
        })
            .then(res => {
                let styleListGroup = [];
                for (let i = 0, len = res.list.length; i < len; i += 15) {
                    styleListGroup.push(res.list.slice(i, i + 15));
                }

                this.props.dispatch({
                    type: 'text',
                    styleList: fromJS(res.list),
                    styleListGroup: fromJS(styleListGroup)
                });
            });
        
    }
    addText = async () => {
        let {fontFamily, fill, stroke} = this.props;
        if (!fontFamily) {
            const defaultFont = this.props.fontListGroup.getIn([0, 0]);
            fontFamily = defaultFont.get('fontFamily');
            await this.props.ce.getMachine(MENU.WENZI).loadFont(fontFamily, defaultFont.get('url'));

            this.props.dispatch({
                type: 'text',
                fontFamily,
                fontImg: defaultFont.get('preview')
            });
        }
        // 新增加字体时，fill及stroke样式要用当前选定的
        this.props.ce.getMachine(MENU.WENZI).addText({fontFamily, fill, stroke});

        this.props.track('文字-添加文字点击');
    }
    changeFont = async font => {
        // const {fontFamily, preview, url} = font;
        const fontFamily = font.get('fontFamily');
        const preview = font.get('preview');
        const url = font.get('url');
        // 改变字体之前先加载字体，如果已经加载过（ce通过name判断，则不会重复加载）
        await this.props.ce.getMachine(MENU.WENZI).loadFont(fontFamily, url);
        // 改变已有文字时，带上当前fill及stroke样式，防止加载字体的情况下，没有默认的fill及stroke；change函数自带判断，当无选中文字时，自动创建新文字
        let {fill, stroke} = this.props;
        // console.log('当前fill=', fill, '当前stroke=', stroke);
        this.props.ce.getMachine(MENU.WENZI).change({fontFamily, fill, stroke});
        this.props.dispatch({
            type: 'text',
            fontFamily,
            fontImg: preview
        });
        this.props.track('文字-字体区点击');
    }
    parseSvgChangeStyle = url => {
        this.props.ce.getMachine(MENU.WENZI).parseSvgChange(url);
    }
    changeStyle = async rules => {
        // 当有size属性，说明是fromJS之后的数据
        if (rules.hasOwnProperty('size')) {
            rules = Object.fromEntries(rules);
        }

        let {fontFamily} = this.props;

        // 如果初始字体未加载，则要先加载
        if (!fontFamily) {
            const defaultFont = this.props.fontListGroup.getIn([0, 0]);
            fontFamily = defaultFont.get('fontFamily');
            await this.props.ce.getMachine(MENU.WENZI).loadFont(fontFamily, defaultFont.get('url'));

            this.props.dispatch({
                type: 'text',
                fontFamily,
                fontImg: defaultFont.get('preview')
            });
        }
        // 将当前的fontFamily加在修改样式规则上，有激活对象时，激活对象的fontFamily与其相等；无激活对象时，保证ce内部新加的文字字体是fontFamily而不是默认值
        Object.assign(rules, {fontFamily: fontFamily});
        // ce内部做了判断：如果当前无选中的文字，则会先添加文字，再套用对应rules
        this.props.ce.getMachine(MENU.WENZI).change(rules);
        const {fill, stroke} = rules;
        if (fill !== undefined) {
            this.props.dispatch({
                type: 'text',
                fill
            });
        }
        if (stroke !== undefined) {
            this.props.dispatch({
                type: 'text',
                stroke
            });
        }

        this.props.track('文字-花字区点击');
    }
    delete = () => {
        this.props.ce.delete();
    }
    render() {
        return (
            <div
                className={style['tab-wenzi']}
                style={{
                    display: this.props.show ? 'block' : 'none'
                }}
            >
                <button className={style['btn-add']} onClick={this.addText}>添加文字</button>
                <div ></div>
                <h3 className={style.title}>字体</h3>
                <Carousel className={style.carousel}>
                    {
                        this.props.fontListGroup.map((fonts, i) =>
                            (<CarouselItem key={i}>
                                {
                                    fonts.map((font, j) =>
                                        (<button
                                            className={style['font'] + ' ' + (this.props.fontFamily === font.get('fontFamily') ? style['active'] : '')}
                                            style={{backgroundImage: `url(${font.get('preview')})`}}
                                            onClick={this.changeFont.bind(this, font)}
                                            // key={font.get('fontFamily')}
                                            key={j}
                                        >{font.get('preview') ? '' : `匿名字体${i * 12 + j}`}</button>)
                                    )
                                }
                            </CarouselItem>)
                        )
                    }
                </Carousel>
                <h3 className={style.title}>花字</h3>
                <Carousel className={style.carousel}>
                    {
                        this.props.styleListGroup.map((items, i) =>
                            (<CarouselItem key={i}>
                                {
                                    items.map((item, j) =>
                                        (<button
                                            className={style['font-style'] + ' ' + (this.props.fill === item.get('fill_rgb') && this.props.stroke === item.get('stroke_rgb') ? style['active'] : '')}
                                            style={{backgroundImage: `url(${item.get('preview')})`}}
                                            onClick={this.changeStyle.bind(this, {fill: item.get('fill_rgb'), stroke: item.get('stroke_rgb')})}
                                            // onClick={this.parseSvgChangeStyle.bind(this, item.get('img'))}
                                            // key={item.get('id')}
                                            key={j}
                                        ></button>)
                                    )
                                }
                            </CarouselItem>)
                        )
                    }
                </Carousel>

                {/* <br />
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {fontWeight: 'bold'})} >B</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {underline: true})} >U</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {fontStyle: 'italic'})} >I</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {fontStyle: 'oblique'})} >oblique</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {linethrough: true})} >-</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {fill: 'rgba(12,12,12,0.5)'})} >fill</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {stroke: '#999'})} >stroke: #999</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {strokeWidth: 4})} >strokeWidth</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {shadow: {color: 'rgba(0, 125, 0, 0.4)', blur: 10, offsetX: 3, offsetY: -3, opacity: 0.5}})} >shadow</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {charSpacing: 800})} >charSpacing</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {lineHeight: 2.5})} >lineHeight</button>
                <button className={style['btn-test']} onClick={this.changeStyle.bind(this, {visible: false})} >隐藏</button>
                <button className={style['btn-test']} onClick={this.delete} >del</button> */}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => ({
    ce: state.get('canvas').get('ce'),
    fontFamily: state.get('text').get('fontFamily'),
    fill: state.get('text').get('fill'),
    stroke: state.get('text').get('stroke'),
    fontListGroup: state.get('text').get('fontListGroup'),
    styleListGroup: state.get('text').get('styleListGroup'),
    track: state.get('event').get('track'),
});

export default connect(mapStateToProps)(TabWenzi);
