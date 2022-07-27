/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import {connect} from 'react-redux';
import {MENU} from '@/redux/const';
import {post, get} from '@/utils/http';

// const INIT_TAG = 2;
// const preview = 'http://p1.bdxiguaimg.com/img/xigua-short-video/short/ecb1284def90c5fa01d1251d4209791b.jpg~c5_q75_720x405.png';
class TabMuban extends Component {
    state = {
        loading: false
    }
    componentDidMount() {
        this.fetchTemp(null).then(({list}) => {
            let arr = new Array(this.props.tagList.size).fill([]);
            // 加个空模板放到默认的模板tag下
            list.unshift({
                id: 0,
                element: [],
                preview: require('@/assets/ban2.png').default,
            });
            arr[this.props.curTag] = list;
            this.props.dispatch({
                type: 'tpl',
                tempList: arr
            });
        });
    }
    fetchTemp = id => {
        this.setState({
            loading: true
        });
        let url = '/api/pcui/template/gettemplates';
        return post(url, {
            type: 'cover',
            tag: id,
        }).then(res => {
            // 坑爹的接口数据，有的模板会是null
            res.list = res.list.filter(Boolean);
            for (let temp of res.list) {
                // 预览原图比较大，加上后缀是在线缩小图片，以更快的加载出来，这里缩小到宽度204
                // temp.preview = temp.preview + '@w_204';
                for (let tempItem of temp.element) {
                    if (tempItem.type === 'image') {
                        // 将模板资源中的贴纸src替换为符合当前网页协议的src（当然，前提是贴纸支持http和https都可访问）
                        tempItem.src = tempItem.src.replace(/^http(s)?:/i, window.location.protocol);
                    }
                }
            }
            this.setState({
                loading: false
            });
            return res;
        }).catch(err => {
            this.setState({
                loading: false
            });
            return Promise.reject(err);
        });
    }
    selectTag = (n, id) => {
        // console.log('n=', n);
        if (this.props.curTag === n) {
            return;
        }

        this.props.dispatch({
            type: 'tpl',
            curTag: n
        });
        if (this.props.tempList.get(n).size === 0  || n === 0) {
            this.fetchTemp(id).then(res => {
                this.props.dispatch({
                    type: 'tpl.tempList',
                    key: n,
                    value: res.list
                });
            });
        }
        this.props.track('模板-' + ({
            0: '我的',
            1: '最近',
            2: '热门',
        })[n] + '点击');
    }
    selectTemp = async (e, i, temp) => {
        // 里边有个button按钮也绑定了click，这里做判断解决冒泡问题
        if (e.target.tagName.toLowerCase() !== 'img') {
            return;
        }
        if (this.props.curTemp === i) {
            return;
        }

        let elements = temp.get('element').toJS();

        // 要把当前模板基于的画布的尺寸（canvas的width\height）给到sdk，以此计算加载模板所要缩放的因子（即适配需要这个参数，如果不传，就不会做适配。2021.5.25，目前的版本，UI基于500*281做模板，未传尺寸）
        let size = temp.get('size')?.toJS();
        for (let obj of elements) {
            obj.tempId = temp.get('id');
            // 给文字类型加载对应字体
            if (obj.type === 'i-text') {
                let {fontFamily} = obj;
                const font = this.props.fontList.find(font => {
                    return font.get('fontFamily') === fontFamily;
                }
                );
                font && await this.props.ce.getMachine(MENU.WENZI).loadFont(fontFamily, font.get('url'));
            }
        }
        // 这里传入size
        await this.props.ce.getMachine(MENU.MUBAN).loadTemp(elements, size);

        this.props.dispatch({
            type: 'tpl',
            curTemp: i
        });

        this.props.track('模板-模板区点击');
    }
    delTemp = (id) => {
        post('/api/pcui/template/deltemplate', {tid: id})
            .then(res => {
                let personalTempList = this.props.tempList.get(0).toJS();
                let index = personalTempList.findIndex(obj => obj.id === id);
                personalTempList.splice(index, 1);
                this.props.dispatch({
                    type: 'tpl.tempList',
                    key: 0,
                    value: personalTempList
                });
                this.props.message({type: 'success', message: '删除成功'});
                this.setState({
                    delString: ''
                });
            });
    }
    // openDelConfirm = (delString) => {
    //     this.setState({
    //         delString: delString
    //     });
    // }
    render() {
        return (
            <div
                className={style['container']}
                style={{
                    display: this.props.show ? 'flex' : 'none'
                }}
            >
                <ul className={style['menu']}>
                    {
                        // React.Children.map(this.props.tagList, (tag, i) => (
                        //     <li
                        //         className={this.props.curTag === i ? style['active'] : ''}
                        //         onClick={this.selectTag.bind(this, i, tag['key'])}
                        //         key={tag['name']}
                        //     >{tag['name']}</li>
                        // ))
                        this.props.tagList.map((tag, i) => (
                            <li
                                className={this.props.curTag === i ? style['active'] : ''}
                                onClick={this.selectTag.bind(this, i, tag.get('key'))}
                                key={tag.get('name')}
                            >{tag.get('name')}</li>
                        ))
                    }
                </ul>
                {
                    this.props.tempList.map((list, i) => (
                        <ul className={style['content'] + ' ' + style['custom-scroll-bar']} style={{display: this.props.curTag === i ? 'flex' : 'none'}} key={i}>
                            {
                                list.size === 0 ? <p className={style['loading']}>{this.state.loading ? 'loading...' : '暂无模板'}</p> :
                                    list.map((temp, j) => (
                                        <li
                                            className={this.props.curTemp === `${i}-${j}` ? style['active'] : ''}
                                            onClick={e => this.selectTemp(e, `${i}-${j}`, temp)}
                                            // style={{backgroundImage: `url(${temp.get('preview')}`}}
                                            key={temp.get('id')}
                                        >
                                            <img src={temp.get('preview')} />
                                            {
                                                i === 0 && (<>
                                                    <button className={style['btn-del']} onClick={this.delTemp.bind(this, temp.get('id'))}>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 1C9.96024 1 10.3333 1.3731 10.3333 1.83333V2.66667H13.6667C14.0349 2.66667 14.3333 2.96514 14.3333 3.33333V3.66667C14.3333 4.03486 14.0349 4.33333 13.6667 4.33333L12.999 4.333L13 13C13 13.9205 12.2538 14.6667 11.3333 14.6667H4C3.07953 14.6667 2.33333 13.9205 2.33333 13L2.333 4.333L1.66667 4.33333C1.29848 4.33333 1 4.03486 1 3.66667V3.33333C1 2.96514 1.29848 2.66667 1.66667 2.66667H5V1.83333C5 1.3731 5.3731 1 5.83333 1H9.5ZM11.332 4.333H3.999L4 13H11.3333L11.332 4.333ZM6.33333 6C6.70152 6 7 6.29848 7 6.66667V10.6667C7 11.0349 6.70152 11.3333 6.33333 11.3333H6C5.63181 11.3333 5.33333 11.0349 5.33333 10.6667V6.66667C5.33333 6.29848 5.63181 6 6 6H6.33333ZM9.33333 6C9.70152 6 10 6.29848 10 6.66667V10.6667C10 11.0349 9.70152 11.3333 9.33333 11.3333H9C8.63181 11.3333 8.33333 11.0349 8.33333 10.6667V6.66667C8.33333 6.29848 8.63181 6 9 6H9.33333Z" fill="white"></path></svg>
                                                    </button>
                                                    {/* <div className={style['del-layer']} style={{display: this.state.delString === `${i}-${j}` ? 'block' : 'none'}} onMouseLeave={this.openDelConfirm}>
                                                        <p>确认删除？</p>
                                                        <button onClick={this.delTemp.bind(this, temp.get('id'))}>确认</button>
                                                        <button onClick={this.openDelConfirm}>取消</button>
                                                    </div> */}
                                                </>)
                                            }
                                        </li>
                                    ))
                            }
                        </ul>
                    ))
                }
            </div>
        );
    }
}

const mapStateToProps = (state, props) => ({
    message: state.get('event').get('message'),
    ce: state.get('canvas').get('ce'),
    fontList: state.get('text').get('fontList'),
    tempList: state.get('tpl').get('tempList'),
    tagList: state.get('tpl').get('tagList'),
    curTemp: state.get('tpl').get('curTemp'),
    curTag: state.get('tpl').get('curTag'),
    track: state.get('event').get('track'),
});

export default connect(mapStateToProps)(TabMuban);
