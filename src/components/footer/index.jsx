/**
* @file index
* @author sunkeke
* @date 2020-12-14
*/

import React, {Component} from 'react';
import style from './index.module.less';
import {connect} from 'react-redux';
import {post, get} from '@/utils/http';
import {MENU} from '@/redux/const';

class Footer extends Component {
    // restoreImg = () => {
    //     this.props.ce.getMachine(0).restore()
    //         .then(({ratio}) => {
    //             this.props.dispatch({
    //                 type: 'canvas.originalRatio',
    //                 value: ratio
    //             });
    //             this.props.dispatch({
    //                 type: 'canvas',
    //                 activeRatio: 0
    //             });
    //         });
    // }
    saveToMyTemp = async (tag = 'personal') => {
        if (!this.props.allowSaveTemp) {
            return;
        }
        this.props.dispatch({
            type: 'canvas',
            allowSaveTemp: false
        });

        try {
            // 参数传true表示获得的图片比例是与画布比例相似的，内部逻辑是：当图片本身的比例与画布比例相差比较大
            // （我定义的是：图片比例大于画布比例*4/3或小于画布比例*3/4）的时候，截图会以画布比例做输出，以此保证获得的图片比例与画布比例相似
            // 业务上主要用于存储到“我的模板”时，保证预览图不会拉伸的太严重导致的模糊
            const preview = this.props.ce.exportBase64({similarRatio: true});
            const canvasData = this.props.ce.exportObject();
            let url = await post('/builder/author/picture/process', {
                action: ['save'],
                // base64: preview.slice(0, 22)
                base64: preview.slice(22)
            });
            const result = {
                preview: url.url,
                object: canvasData.objects
            };
            
            let {id} = await post('/pcui/template/addtemplate', {
                content: JSON.stringify(result)
            });

            // 保存当前模板后，将模板id传给所有编辑元素，且当前所有编辑元素自成一套模板，点击清除模板，会删掉
            this.props.ce.getMachine(MENU.MUBAN).attachId(id);
            this.props.message({type: 'success', message:'保存成功，可从“模版-我的”中应用该模版'});

            //  保存成功后，请求我的模板数据并更新
            let {list} = await post('/pcui/template/gettemplates', {
                type: 'cover',
                tag: 'personal'
            });
            list = list.filter(Boolean).map(item => {
                item.preview = item.preview + '@w_204';
                for (let tempItem of item.element) {
                    if (tempItem.type === 'image') {
                        // 将模板资源中的贴纸src替换为符合当前网页协议的src（当然，前提是贴纸支持http和https都可访问）
                        tempItem.src = tempItem.src.replace(/^http(s)?:/i, window.location.protocol);
                    }
                }
                return item;
            });
            
            this.props.dispatch({
                type: 'tpl.tempList',
                key: 0,
                value: list
            });
        }
        catch(err) {
            console.log('err=', err);
            this.props.dispatch({
                type: 'canvas',
                allowSaveTemp: true
            });
        }
        this.props.track('保存至我的模板点击');
    }
    exportImg = () => {
        if (this.props.isFreezeRatio) {
            return;
        }

        this.props.track('完成点击');

        const info = this.props.ce.exportImgInfo(['width', 'height']);

        // 当对比例有要求时，虽然刚开始做了强制裁剪，这里点击确定时再做个校验
        if (this.props.ratioList.size === 1) {
            let curRatio = info.width / info.height;
            let requireRatio = this.props.ratioList.get(0).get('ratio');
            // 小数点计算不够准确，这里只要误差小于0.1，则认为比例符合要求，大于0.1则需要重新裁剪
            if (Math.abs(curRatio - requireRatio) > 0.1) {
                this.props.message({type: 'error', errno: 10004, message: '您的图片不符合比例，请重新裁剪'});
                this.props.ce.run(MENU.CAIJIAN);
                this.props.dispatch({
                    type: 'canvas',
                    tab: MENU.CAIJIAN
                });
                return;
            }
        }
        // console.log('limitMemorySize=', this.props.limitMemorySize);
        let base64 = '';
        let tooLarge = false;
        let compressData = {
            isCompress: false
        };
        // 当配置了大小上限时，做个判断
        if (this.props.limitMemorySize > 0) {
            let sizeObj = this.getLimitedMemorySize(this.props.quality);
            // 如果在递减压缩比压缩后无法得到满足图片，则由外部做对应的提示
            if (!sizeObj) {
                // this.props.message({
                //     type: 'error',
                //     errno: 10005,
                //     message: '图片过大，保存失败'
                // });
                // return;
                tooLarge = true;
            }
            else {
                let {url, initSize, curSize, quality} = sizeObj;
                base64 = url;
                if (initSize) {
                    compressData = {
                        isCompress: true,
                        initSize,
                        curSize,
                        quality
                    };
                }
            }
        }
        if (!base64) {
            // 无论tooLarge的值，都做一次导出，是否使用，由外部根据业务自行决定
            base64 = this.props.ce.exportBase64({quality: this.props.quality});
        }
        const canvasData = this.props.ce.exportObject();
        let hasEmptyText = canvasData.objects.find(obj => obj.type === 'i-text' && obj.text === '请输入文字');
        let tempId = canvasData.objects.find(obj => !!obj.tempId)?.tempId;

        // 记录使用的热门模板id
        let usedTempId = null;
        let hotTempList = this.props.tempList.get(2).toJS();
        if (hotTempList.find(item => item.id === tempId)) {
            // this.props.track(`使用模板${tempId}`);
            usedTempId = tempId;
        }

        // 记录打点数据trackData：此次编辑，都使用了哪些功能
        let trackData = {};
        // backgroundImage就是被编辑的图片（fabric对象），filters是个数组，有长度说明应用了滤镜，则记录一次其使用了滤镜功能
        if (canvasData.backgroundImage.filters?.length) {
            trackData.filter = true;
        }
        // 当有文字且没有模板id，则记录一次其使用了文字功能
        if (canvasData.objects.find(obj => obj.type === 'i-text' && !obj.tempId)) {
            trackData.font = true;
        }
        // 当有贴纸且没有模板id，则记录一次其使用了贴纸功能
        if (canvasData.objects.find(obj => obj.type === 'image' && !obj.tempId)) {
            trackData.paster = true;
        }
        // 有模板id，则记录一次其使用了模板功能
        if (tempId) {
            trackData.template = true;
        }
        trackData.cut = this.props.trackData.get('cut') || false;
        // 记录完毕

        typeof this.props.sure === 'function' && this.props.sure(
            {hasEmptyText: !!hasEmptyText, tooLarge, trackData, compressData, usedTempId},
            {base64, ...info},
            () => {
                if (tempId) {
                    // 将使用的模板id上报
                    post('/pcui/template/recenttemplate', {
                        tid: tempId
                    });
                }
            });
    }
    getLimitedMemorySize = (quality, initSize) => {
        if (quality <= 0) {
            return false;
        }
        let url = this.props.ce.exportBase64({quality});
        let size = this.getBase64Size(url);
        if (size > this.props.limitMemorySize * 1024 * 1024) {
            if (!initSize) {
                initSize = size;
            }
            quality = Number((quality - 0.05).toFixed(2));
            return this.getLimitedMemorySize(quality, initSize);
        }
        else {
            return {
                url,
                initSize,
                curSize: size,
                quality
            };
        }
    }

    getBase64Size(base64) {
        if (/^data:image/.test(base64)) {
            let len = base64.split(',')[1].length;
            const index = base64.lastIndexOf('='); // 获取=号下标
            if (index > 0) {
                len = index;
            }
            const fileLength = len - (len / 8) * 2; // 真实的图片byte大小
            return Math.floor(fileLength); // 向下取整
        } else {
            return null;
        }
    }

    // toJSON = () => {
    //     // this.props.ce.toJSON();
    //     this.props.ce.destroy();
    // }
    render() {
        return (<>
            <button className={style['btn-save'] + ' ' + (this.props.allowSaveTemp ? '' : style['not-allowed'])} onClick={this.saveToMyTemp} >保存至我的模板</button>
            <button className={style['btn-sure'] + ' ' + (this.props.isFreezeRatio ? style['not-allowed'] : '')} onClick={this.exportImg} >{this.props.sureText}</button>
            {this.props.cancelText && <button className={style['btn-cancel']} onClick={this.props.cancel}>{this.props.cancelText}</button>}
            {/* <button className={style['btn-cancel']} onClick={this.toJSON} >toJSON</button> */}
        </>);
    }
}

const mapStateToProps = (state, props) => ({
    // showRestore: state.get('canvas').get('showRestore'),
    ce: state.get('canvas').get('ce'),
    tempList: state.get('tpl').get('tempList'),
    message: state.get('event').get('message'),
    sureText: state.get('canvas').get('sureText'),
    cancelText: state.get('canvas').get('cancelText'),
    sure: state.get('canvas').get('sure'),
    cancel: state.get('canvas').get('cancel'),
    allowSaveTemp: state.get('canvas').get('allowSaveTemp'),
    isFreezeRatio: state.get('canvas').get('isFreezeRatio'),
    ratioList: state.get('canvas').get('ratioList'),
    track: state.get('event').get('track'),
    trackData: state.get('event').get('trackData'),
    limitMemorySize: state.get('canvas').get('limitMemorySize'),
    quality: state.get('canvas').get('quality'),
});

export default connect(mapStateToProps)(Footer);
