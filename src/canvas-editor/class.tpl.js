/**
* @file 模板零件类
* @author sunkeke
* @date 2020-12-22
*/
import {fabric} from 'fabric';

/** 模板零件类 */
class Tpl {
    #canvas
    #limitCount

    /**
    * @ignore
    * @desc 零件标准方法之一，初始化零件
    * @param {object} options 配置对象
    * @param {object} options.canvas 主canvas对象
    * @param {number} options.limitCount 元素数量上线
    */
    init({
        canvas,
        limitCount
    }) {
        this.#canvas = canvas;
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
    * @desc 加载模板
    * @param {object[]} tempArr 模板元素的数组
    * @param {object} size 模板的基准尺寸，如果传了，则会做适配
    * @param {number} size.width 基准尺寸的宽
    * @param {number} size.height 基准尺寸的高
    */
    async loadTemp(tempArr, size) {
        if (!Array.isArray(tempArr)) {
            console.error('加载的模板不是数组');
            return;
        }
        let prevTemp = [];
        // 使用模板前，必先清除前一个模板，所有带tempId的元素都是模板元素
        this.#canvas.forEachObject(obj => {
            if (obj.tempId) {
                prevTemp.push(obj);
            }
        });
        // console.log('添加模板前元素数量：',this.#canvas.size(), '当前模板元素数量：', prevTemp.length, '应用新模板元素数量:', tempArr.length);
        if (this.#canvas.size() - prevTemp.length + tempArr.length > this.#limitCount) {
            this.#canvas.fire('user:message', {type: 'error', errno: 10003});
            return Promise.reject('添加的元素过多');
        }
        // 这里清除prevTemp
        for (let obj of prevTemp) {
            this.#canvas.remove(obj);
        }
        // 没有模板，则只是清除模板
        if (tempArr.length === 0) {
            this.#canvas.fire('user:pushHistory');
            return;
        }
        // 如果传了基准尺寸，则做适配
        if (size) {
            // 当模板的基准尺寸跟当前canvas尺寸不一致时，要将模板元素做等比缩放处理以适配当前canvas尺寸，同时位置也按照比例处理
            const {width, height} = this.#canvas;
            let {w, h} = size;
            let scale = 1;
            let modify = {
                x: 0,
                y: 0
            };
            if (w / h < width / height) {
                scale = height / h;
                w = w * scale;
                h = height;
                modify.x = (width - w) / 2;
            }
            else if (w / h > width / height) {
                scale = width / w;
                h = h * scale;
                w = width;
                modify.y = (height - h) / 2;
            }
            else if (w !== width) {
                scale = width / w;
                h = height;
                w = width;
            }
            tempArr.forEach(temp => {
                temp.top = temp.top * scale + modify.y;
                temp.left = temp.left * scale + modify.x;
                temp.scaleX *= scale;
                temp.scaleY *= scale;
            });
        }
        // 适配结束

        // 将对象表示转换为fabric对象
        fabric.util.enlivenObjects(tempArr, objArr => {
            this.#canvas.add(...objArr);
            this.#canvas.fire('user:pushHistory');
        });
    }

    /**
    * @desc 给当前所有元素加上统一的模板id，曾经有id的元素也会被新id替换
    * @param {string} id 模板id
    */
    attachId(id) {
        if (!id) {
            return;
        }
        this.#canvas.forEachObject(obj => {
            obj.tempId = id;
        });
    }
}

export default Tpl;
