/**
* @file 本地开发的入口文件，打包时不涉及这里，放心配置、尝试
* @author sunkeke
* @date 2021-04-28
*/

import Editor from './main';

const ce = new Editor('#root', {
    quality: 1, // 设置为jpeg时的压缩比，这个只对jpeg生效，canvas的方式调用toDataurl，默认是0.92的压缩比
    format: 'jpeg', // 点击完成时输出的图片格式
    theme: '#ff0099',
    // backgroundColor: 'transparent',
    backgroundColor: '#000', // canvas背景色
    layerColor: 'rgba(0,0,0,0.2)', // 蒙层颜色，目前用在2个地方：元素超出图片区域的地方，裁剪框外
    track: function (action) { // 打点函数，可以由外部传入
        console.log(action);
    },
    message: function(info) {
        const {type, message} = info;
        console.log(type + ' ' + message);
    },
    width: 500, // canvas宽
    height: 281, // canvs高
    image: 'https://p1.pstatp.com/origin/dfic-imagehandler/fa00d42f-d50e-4439-bab6-2c310e908e1d?timestamp=1608101875695',
    // image: '', // 除了image可以响应外部的变化外，其余配置目前不做响应
    cancelText: '取消', // 取消按钮文本
    sureText: '完成', // 完成按钮文本
    cancel: function(a,b,c) {
        console.log(a,b,c);
        console.log('cancel');
    },
    sure: function(a,b,c) {
        console.log(a,b,c);
        console.log('sure');
        // if (a && !confirm('有初始态文字，要继续吗？')) {
        //     return;
        // }
        typeof c === 'function' && c();
        let img = document.getElementById('base64-img');
        img.src = b.base64;
    },
    // 裁剪比例列表，自带一个默认的列表，也可以自己传入
    // ratioList: [
    //     {
    //         name: '固定比例',
    //         ratio: 16 / 9
    //     }
    // ],
    limit: {
        // isLegal: true, // 是否正版图片，正版图片只支持裁剪，不支持模板、贴纸、文字、滤镜、翻转、旋转
        // 当设置了limit.ratio时，表示要限制图片裁剪比例。ratioList和limit.ratio都配置时，会忽略ratioList
        // ratio: {
        //     name: '固定比例',
        //     minWidth: 180,
        //     minHeight: 68
        // },
        count: 10, // 元素限制的添加上限，超过这个数会提示元素过多
        memorySize: 0 // 单位：MB 生成图片的大小最大限制，若超过，会尝试递归压缩，直到低于这个值，或者压缩到0.05也不行，则报错；当为0时，没有大小限制
    }
});

// setTimeout(() => {
//     console.log('load a new image');
//     ce.loadImage('https://weiliicimg9.pstatp.com/weili/ms/260915500917457048.jpg');
// }, 2000);

/**
 * 将base64格式转化为Blob格式
 * @param {string} urlData : urlData格式的数据，通过这个转化为Blob对象
 * @param {Function} callback : 回调函数
 */
function convertBase64UrlToBlob(urlData, callback) { //将base64转化为文件格式
    // console.log("压缩成base64的对象：",urlData);
    const arr = urlData.split(',');
    // console.log("arr",arr);
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);   //atob方法用于解码base64
    // console.log("将base64进行解码:",bstr);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    // console.log("Uint8Array:",u8arr);
    callback(new Blob([u8arr], {
        type: mime
    }));
}
