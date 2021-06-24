/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {PureComponent} from 'react';
import style from './index.module.less';
// import data from './data';
import {connect} from 'react-redux';
import {MENU} from '@/redux/const';

// 比例图的最大限制
const MAX = 80;

class Tab extends PureComponent {
    state = {
        notAllowed: this.props.isFreezeRatio
    }
    getStyle = ratio => {
        let width;
        let height;
        let margin;
        if (ratio >= 1) {
            width = MAX;
            height = Math.floor(MAX * (1 / ratio));
            margin = Math.floor((width - height) / 2) + 'px auto';
        }
        else {
            height = MAX;
            width = Math.floor(MAX * ratio);
            margin = '0 auto';
        }

        return ({
            width,
            height,
            margin
        });
    }

    handleClick = index => {
        if (this.state.notAllowed || this.props.activeRatio === index) {
            return;
        }

        this.props.dispatch({
            type: 'canvas',
            activeRatio: index
        });
        if (this.props.ratioList.get(index).get('name') === '自定义') {
            this.props.ce.getMachine(MENU.CAIJIAN).setRatio(0);
        }
        else {
            this.props.ce.getMachine(MENU.CAIJIAN).setRatio(this.props.ratioList.get(index).get('ratio'));
        }

        this.props.track('裁剪-比例选区点击');
    }
    render() {
        // console.log('render caijian ', this.props.ratioList.get(0).get('ratio'));
        // 初始的originalRatio==0，没获取到图片比例时，不显示
        if (this.props.ratioList.get(0).get('ratio')) {
            return (
                <ul
                    className={style.container + ' ' + style['custom-scroll-bar'] + ' ' + (this.state.notAllowed ? style['not-allowed'] : '')}
                    style={{
                        display: this.props.show ? 'block' : 'none'
                    }}
                >
                    {this.props.ratioList.map((item, index) => (<li
                        className={style.li}
                        key={item.get('name')}
                        onClick={this.handleClick.bind(this, index)}
                    >
                        <div
                            className={style.example + ' ' + (this.props.activeRatio === index && style.active)}
                            style={this.getStyle(item.get('ratio'))}
                        >{item.get('name')}</div>
                        {/* <p className={style.name}>{item.get('ratio')}</p> */}
                    </li>)
                    )}
                </ul>
            );
        }
        else {
            return null;
        }
    }
}

const mapStateToProps = (state, props) => {
    return {
        isFreezeRatio: state.get('canvas').get('isFreezeRatio'),
        // isLegal: state.get('canvas').get('isLegal'),
        ratioList: state.get('canvas').get('ratioList'),
        originalRatio: state.get('canvas').get('originalRatio'),
        activeRatio: state.get('canvas').get('activeRatio'),
        ce: state.get('canvas').get('ce'),
        track: state.get('event').get('track'),
    };
};

export default connect(mapStateToProps)(Tab);
