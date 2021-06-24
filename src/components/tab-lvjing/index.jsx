/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import {connect} from 'react-redux';
import {MENU} from '@/redux/const';

const filterList = [
    {
        name: '原图',
        img: require('@/assets/filter/origin.png').default,
        type: null
    },
    {
        name: '美化',
        img: require('@/assets/filter/beautify.png').default,
        type: 'Saturation',
        value: 0.5
    },
    {
        name: '鲜明',
        img: require('@/assets/filter/brightness.png').default,
        type: 'Brightness',
        value: 0.1
    },
    {
        name: '冷色',
        img: require('@/assets/filter/cool.png').default,
        type: 'BlendColor',
        value: {
            color: 'rgb(71, 167, 215)',
            mode: 'tint',
            alpha: 0.1
        }
    },
    {
        name: '暖色',
        img: require('@/assets/filter/warm.png').default,
        type: 'BlendColor',
        value: {
            color: 'rgb(227, 120, 120)',
            mode: 'tint',
            alpha: 0.1
        }
    },
    {
        name: '复古',
        img: require('@/assets/filter/retro.png').default,
        type: 'Sepia',
    },
    {
        name: '黑白',
        img: require('@/assets/filter/grayscale.png').default,
        type: 'Grayscale'
    },
];

class TabLvjing extends Component {
    selectFilter = i => {
        console.log(i);
        const {type, value} = filterList[i];
        this.props.ce.getMachine(MENU.LVJING).setFilter(type, value);
        this.props.dispatch({
            type: 'canvas',
            filter: i
        });
        this.props.track('滤镜-滤镜区点击');
    }
    render() {
        return (
            <div
                className={style.container}
                style={{
                    display: this.props.show ? 'block' : 'none'
                }}
            >
                <ul className={style['filter-list']}>
                    {
                        filterList.map((item, i) => (
                            <li
                                className={style['filter-li'] + ' ' + (this.props.filter === i ? style['active'] : '')}
                                onClick={this.selectFilter.bind(this, i)}
                                key={item.name}
                            >
                                <img className={style['filter-img']} src={item.img} />
                                <p className={style['filter-name']}>{item.name}</p>
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    return {
        ce: state.get('canvas').get('ce'),
        filter: state.get('canvas').get('filter'),
        track: state.get('event').get('track'),
    };
};

export default connect(mapStateToProps)(TabLvjing);
