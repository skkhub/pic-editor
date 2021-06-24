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
import {post, get} from '@/utils/http';

// function loadFrames(context) {
//     const frames = [];
//     context.keys().forEach(k => {
//         frames.push(context(k).default);
//     });
//     return frames;
// }
// const context = require.context('@/assets/shape', false, /\.svg$/i);
// const shapeList = loadFrames(context);
// let shapeListGroup = [];
// for (let i = 0, len = shapeList.length; i < len; i += 9) {
//     shapeListGroup.push(shapeList.slice(i, i + 9));
// }

// const context2 = require.context('@/assets/paster-img', false, /\.png|\.jpg|\.jpeg$/i);
// const imgList = loadFrames(context2);
// let imgListGroup = [];
// for (let i = 0, len = imgList.length; i < len; i += 9) {
//     imgListGroup.push(imgList.slice(i, i + 9));
// }

class TabTiezhi extends Component {
    state = {
        // imgListGroup: []
        imgList: []
    }
    componentDidMount() {
        post('/pcui/template/gettemplates', {
            type: 'element',
            element: 'paster',
        }).then(res => {
            for (let obj of res.list) {
                obj.url = obj.url.replace(/^http(s)?:/i, window.location.protocol);
            }
            this.setState({
                imgList: res.list
            });
            // for (let i = 0, len = res.list.length; i < len; i += 9) {
            //     this.state.imgListGroup.push(res.list.slice(i, i + 9));
            // }
        });
    }
    addImg = url => {
        this.props.ce.getMachine(MENU.TIEZHI).addImg(url);
        this.props.track('贴纸-贴纸区点击');
    }
    // addShape = (shape, type) => {
    //     this.props.ce.getMachine(MENU.TIEZHI).addShape(shape, type).catch(err => {
    //         console.error(err);
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
                <p className={style['title']}>贴纸</p>
                <ul className={style['paster-ul'] + ' ' + style['custom-scroll-bar']}>{
                    this.state.imgList.map(img => (
                        <li
                            className={style['shape']}
                            onClick={this.addImg.bind(this, img.url)}
                            key={img.id}
                        >
                            {/* 这里加载图片给其增加一个后缀，确保与传入canvas被操作的图片的缓存不是同一个，不会出现cors问题 */}
                            <img src={img.url + '?cors'} />
                        </li>
                    ))
                }</ul>
                {/* <Carousel className={style['carousel']}>
                    {
                        shapeListGroup.map((shapeList, i) => (
                            <CarouselItem key={i}>
                                {
                                    shapeList.map(shape => (
                                        <div
                                            className={style['shape']}
                                            onClick={this.addImg.bind(this, shape)}
                                            key={shape}
                                        >
                                            <img src={shape} />
                                        </div>
                                    ))
                                }
                            </CarouselItem>
                        ))
                    }
                </Carousel> */}
                {/* <Carousel className={style['carousel'] + ' ' + (this.state.imgListGroup.length === 0 ? style['hide'] : '')}>
                    {
                        this.state.imgListGroup.map((imgList, i) => (
                            <CarouselItem key={i}>
                                {
                                    imgList.map(img => (
                                        <div
                                            className={style['shape']}
                                            onClick={this.addImg.bind(this, img.url)}
                                            key={img.id}
                                        >
                                            <img src={img.url} />
                                        </div>
                                    ))
                                }
                            </CarouselItem>
                        ))
                    }
                </Carousel> */}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => ({
    ce: state.get('canvas').get('ce'),
    message: state.get('event').get('message'),
    track: state.get('event').get('track'),
});

export default connect(mapStateToProps)(TabTiezhi);
