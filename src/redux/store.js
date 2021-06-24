/**
* @file store
* @author sunkeke
* @date 2020-12-16
*/

import {createStore} from 'redux';
import {fromJS} from 'immutable';
import {combineReducers} from 'redux-immutable';
import {MENU} from './const';
import ratioList from './ratio-list';
// import {fontList, fontListGroup, styleList, styleListGroup} from './font-list';

const initialState = fromJS({
    canvas: fromJS({
        format: 'png',
        quality: 0.92, // 图片输出质量
        limitCount: 30, // 限制的最大元素数
        limitMemorySize: 0, // 输出图片的限制大小，单位MB
        backgroundColor: '#000000',
        layerColor: null,
        width: 0,
        height: 0,
        image: '',
        cancelText: '取消',
        sureText: '确定',
        cancel: function() {console.log('cancel');},
        sure: function() {console.log('sure');},
        theme: 'rgb(56, 85, 213)',
        ce: null, // 保存canvasEditor实例
        originalRatio: 0,
        activeRatio: 0,
        ratioList,
        minWidth: 0,
        minHeight: 0,
        allowRotate: true,
        isFreezeRatio: false,
        isLegal: false,
        isReactiveOriginalRatio: true, // 是否用户自定义了比例列表，如果是，则不去响应原图比例的变化，默认true，响应比例变化，会主动更新裁剪列表的第一项
        tab: -1,
        // showRestore: false,
        showBack: false,
        showForward: false,
        filter: 0,
        toolbarType: '',
        allowSaveTemp: false,
    }),
    text: fromJS({
        fontList: [],
        fontListGroup: [],
        styleList: [],
        styleListGroup: [],
        fontFamily: '',
        fontImg: '',
        fill: 'rgb(56, 85, 213, 1)',
        fillOpacity: 1,
        // stroke: 'rgb(51, 51, 51)', // 描边不支持透明度
        stroke: null, // 描边不支持rgba格式
        strokeWidth: 0,
        underline: false,
        linethrough: false,
        fontWeight: false,
        fontStyle: false,
        shadow: {
            // color: 'rgba(0, 0, 0, 1)',
            // offsetX: 0,
            // offsetY: 0,
            // blur: 0
        }
    }),
    tpl: fromJS({
        curTag: 2,
        curTemp: '2-0',
        tempList: [],
        tagList: [
            {
                name: '我的',
                key: 'personal'
            },
            {
                name: '最近',
                key: 'recent'
            },
            {
                name: '热门',
                key: null
            }
        ],
        ratioList: []
    }),
    event: {
        trackData: {}, // 传给外部的打点数据
        track: function() {}, // 默认的打点方法
        message: function(info) {
            // 默认使用alert，该函数可通过外部去改写
            alert(info.message);
        }
    }
});

const canvasReducer = (state, action) => {
    const {type, ...obj} = action;
    if (type === 'canvas') {
        return Object.keys(obj).reduce((result, key) => result.set(key, fromJS(obj[key])), state);
    }
    else if (type === 'canvas.originalRatio') {
        let ratioList = state.get('ratioList').toJS();
        ratioList[0].ratio = action.value;
        return state.set('ratioList', fromJS(ratioList));
    }
    else if (type === 'canvas.image') {
        let ce = state.get('ce');
        if (ce) {
            if (obj.value) {
                ce.loadImg(obj.value);
            }
            else {
                ce.destroy();
            }
        }
        return state.set('image', obj.value);
    }
    else {
        return state;
    }
};

const textReducer = (state, action) => {
    const {type, ...obj} = action;
    if (type === 'text') {
        return Object.keys(obj).reduce((result, key) => {
            if (key === 'fill') {
                const matches = obj[key].match(/\(\d+\,\s?\d+\,\s?\d+\,\s?([\d\.]+)\)/i);
                const opacity = matches ? matches[1] : 1;
                return result.set('fillOpacity', opacity).set(key, obj[key]);
            }
            return result.set(key, obj[key]);
        }, state);
    }
    return state;
};
const tplReducer = (state, action) => {
    const {type, ...obj} = action;
    if (type === 'tpl') {
        return Object.keys(obj).reduce((result, key) => result.set(key, fromJS(obj[key])), state);
    }
    else if (type === 'tpl.tempList') {
        const {key, value} = obj;
        const list = state.get('tempList').set(key, fromJS(value));
        return state.set('tempList', list);
    }

    return state;
};
const eventReducer = (state, action) => {
    const {type, ...obj} = action;
    if (type === 'event') {
        return Object.keys(obj).reduce((result, key) => result.set(key, fromJS(obj[key])), state);
    }
    return state;
};

const reducer2 = combineReducers({canvas: canvasReducer, text: textReducer, tpl: tplReducer, event: eventReducer});
// 写个顶级的reducer，用于在组件的componentWillUnmount时重置所有数据
const reducer = (state, action) => {
    if (action.type === 'reset') {
        return initialState;
    }
    return reducer2(state, action);
};

export const store = createStore(reducer, initialState);
