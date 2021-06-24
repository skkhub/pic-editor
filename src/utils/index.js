/**
* @file index
* @author sunkeke
* @date 2020-12-21
*/

// 格式化数字，默认保留2位小数
export function formatFloat(num, pos = 2) {
    num = Number(num);
    return Number(num.toFixed(pos));
}

export function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

// 利用随机+当前日期模拟生成一个唯一的字符串，当然不是绝对的唯一
export function getUniqueString() {
    return Math.floor(Math.random() * 10**8) + new Date().getTime().toString().slice(-8);
}