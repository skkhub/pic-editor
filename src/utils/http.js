/**
* @file http
* @author sunkeke
* @date 2021-05-25
*/

import axios from 'axios';
import qs from 'qs';
import {store} from '@/redux/store';

const instance = axios.create({
    timeout: 2000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
});

const handler = function(res) {
    if (res?.data.errno === 0) {
        return Promise.resolve(res.data.data || res.data.ret);
    }
    else if (res?.data.errmsg) {
        console.warn(res?.data.errmsg);
        return Promise.reject(res.data.errmsg);
    }

};
const errHandler = function(err) {
    // 这里对错误可做统一的错误处理
    const message = store.getState().get('event').get('message');
    message({type: 'error', errno: 10001, message: err.toString() || '未知的网络错误'});
    return Promise.reject(err);
};
/**
* @desc post请求
* @param {string} url 请求地址
* @param {object} data 请求参数
* @returns {object} axios实例
*/
const post = function (url, data) {
    return instance({
        method: 'POST',
        data: qs.stringify(data),
        url,
    })
        .then(handler)
        .catch(errHandler);
};
/**
* @desc get请求
* @param {string} url 请求地址
* @param {object} data 请求参数
* @returns {object} axios实例
*/
const get = function (url, data) {
    return instance({
        method: 'get',
        params: data,
        url
    })
        .then(handler)
        .catch(errHandler);
};

export {
    post,
    get
};
