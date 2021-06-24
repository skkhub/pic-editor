/**
* @file 文字零件类
* @author sunkeke
* @date 2020-12-22
*/
import {fabric} from 'fabric';

/** 文字零件类 */
class Text {
    #canvas
    #width
    #height
    #limitCount
    /**
    * @ignore
    * @desc 零件标准方法之一，初始化零件
    * @param {object} options 配置对象
    * @param {object} options.canvas 主canvas对象
    * @param {number} options.width 画布宽
    * @param {number} options.height 画布高
    * @param {number} options.limitCount 元素数量上线
    */
    init({
        canvas,
        width,
        height,
        limitCount
    }) {
        this.#canvas = canvas;
        this.#width = width;
        this.#height = height;
        this.textList = [];
        this.#limitCount = limitCount;
    }

    /**
    * @ignore
    * @desc 零件标准方法之一，运行零件
    */
    run() {}
    /**
    * @ignore
    * @desc 零件标准方法之一，停止零件
    */
    stop() {}

    /**
    * @ignore
    * @desc 加载字体
    * @param {string} name 字体名
    * @param {string} url 字体资源地址
    * @returns {Promise}
    */
    loadFont(name, url) {
        // 浏览器是否支持
        if (!document.fonts) {
            alert('抱歉，当前浏览器兼容性较差，会影响操作体验，请更换最新版谷歌浏览器进行操作');
            return Promise.reject('浏览器不兼容document.fonts');
        }
        if (this.checkFont(name)) {
            console.log('已经加载该字体：', name);
            return Promise.resolve();
        }
        console.log('准备加载字体：', name);
        // 加载字体
        const fontface = new FontFace(name, `url(${url})`);
        document.fonts.add(fontface);
        this.#canvas.fire('user:loading', {show: true});
        fontface.load();
        return fontface.loaded.then(res => {
            this.#canvas.fire('user:loading', {show: false});
            return Promise.resolve(res);
        })
            .catch(err => {
                this.#canvas.fire('user:loading', {show: false});
                this.#canvas.fire('user:message', {type: 'error', errno: 10002, message: '字体加载失败，将使用系统默认字体'});
                document.fonts.delete(fontface);
                // return Promise.reject(err);
                return Promise.resolve();
            });
    }

    /**
    * @desc 检查是否有加载过某个字体名
    * @param {string} name 待检查的字体名
    * @returns {boolean}
    */
    checkFont(name) {
        let values = document.fonts.values();
        let isHave = false;
        let item = values.next();
        while(!item.done && !isHave) {
            let fontFace = item.value;
            if (fontFace.family === name) {
                isHave = true;
            }
            item = values.next();
        }
        return isHave;
    }

    /**
    * @desc 添加文字
    * @param {object} rules 添加文字后，附加的样式
    * @param {string} rules.fontFamily 添加文字的字体名
    * @param {string} rules.fill 添加文字的填充颜色
    * @param {string} rules.stroke 添加文字的描边颜色
    * @param {object} rules.shadow 添加文字的阴影配置对象
    * @param {string|number} rules.shadow.offsetX 阴影水平偏移
    * @param {string|number} rules.shadow.offsetY 阴影垂直偏移
    * @param {string} rules.shadow.color 阴影颜色
    * @param {number} rules.shadow.blur 阴影模糊度
    */
    async addText(rules) {
        // 添加元素之前，做判断：是否数量超出最大值。为何不复写原型上的add方法？经测试发现，在业务场景多次调用情况下，会发生多次复写导致额外的问题
        if (this.#canvas.size() >= this.#limitCount) {
            this.#canvas.fire('user:message', {
                type: 'error',
                errno: 10003
            });
            return;
        }
        // 如果传了fontFamily但是还没有加载该字体
        if (rules.fontFamily && !this.checkFont(rules.fontFamily)) {
            await this.loadFont(rules.fontFamily, rules.fontUrl);
        }
        if (rules.hasOwnProperty('shadow')) {
            rules.shadow = new fabric.Shadow(rules.shadow);
        }
        let text = new fabric.IText('请输入文字', {
            left: this.#width / 2,
            top: this.#height / 2,
            originX: 'center',
            originY: 'center',
            fontSize: 24,
            // textAlign: 'center',
            textAlign: 'left',
            ...rules,
            // shadow: {
            //     offsetX: 2,
            //     offsetY: '1em',
            //     color: 'rgba(233, 23, 123, 0.8)',
            //     blur: 12
            // }
        });

        this.#canvas.add(text);
        this.#canvas.setActiveObject(text);
        this.#canvas.fire('user:pushHistory');
    }

    /**
    * @desc 改变文字样式
    * @param {object} rules 样式配置对象
    * @param {string} rules.fontFamily 字体名
    * @param {string} rules.fill 填充颜色
    * @param {string} rules.stroke 描边颜色
    * @param {object} rules.shadow 阴影配置对象
    * @param {string|number} rules.shadow.offsetX 阴影水平偏移
    * @param {string|number} rules.shadow.offsetY 阴影垂直偏移
    * @param {string} rules.shadow.color 阴影颜色
    * @param {number} rules.shadow.blur 阴影模糊度
    */
    change(rules) {
        let activeObject = this.#canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'i-text') {
            this.addText(rules);
        }
        else if (activeObject.type === 'i-text') {
            activeObject.set({
                ...rules
            });
            this.#canvas.fire('user:pushHistory');
        }
        this.#canvas.requestRenderAll();
        return Promise.resolve();
    }

    // 前端可以通过解析svg获取对应的fill及stroke，但是app不一定行，此方法暂未被用到；目前是通过接口中直接给对应的stroke和fill做渲染
    parseSvgChange(url) {
        return new Promise((resolve, reject) => {
            fabric.loadSVGFromURL(url, (e) => {
                console.log('loadSVG: e=', e);
                const target = e[0];
                const {fill, stroke} = target;
                this.change({fill, stroke});
                resolve({fill, stroke});
            }, (e) => {
                console.log('loadSVG: e2=', e);
            }, {
                // crossOrigin: 'use-credentials'
                crossOrigin: 'Anonymous'
            });
        });
    }
}

export default Text;
