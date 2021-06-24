/**
* @file 内部自用的一些方法
* @author sunkeke
* @date 2020-12-21
*/

// 格式化数字，默认保留2位小数
export function formatFloat(num, pos = 2) {
    num = Number(num);
    return Number(num.toFixed(pos));
}

// 创建一个webworker
export function createWorker(f) {
    const blob = new Blob(['(' + f.toString() + ')()']);
    const url = window.URL.createObjectURL(blob);
    const worker = new Worker(url);
    return worker;
}

// 将16进制转换为rgb格式
export function convert2RGB(color) {
    if (/^#[0-9a-zA-Z]{6}/.test(color)) {
        let a = Number('0x' + color.slice(1,3));
        let b = Number('0x' + color.slice(3,5));
        let c = Number('0x' + color.slice(5));
        return `rgb(${a}, ${b}, ${c})`;
    }
    if (/^rgb/i.test(color)) {
        return color;
    }
    // 分开写，为了提示：可以传'transparent'
    if (color === 'transparent') {
        return 'transparent';
    }
    throw Error('输入的color参数格式不对，请输入类似#ffffff的16进制颜色值');
}
