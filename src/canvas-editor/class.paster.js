/**
* @file 贴纸零件类
* @author sunkeke
* @date 2020-12-22
*/
import {fabric} from 'fabric';

/** 贴纸零件类 */
class Paster {
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
    * @desc 添加形状，可以解析svg生成fabric对象，然后修改fill、stroke、shadow，但由于app端不能做，双端为了通用，pc端也暂时不做。2021.5.21得知，app已不打算与pc编辑器共用素材
    * @param {string} url 图片地址
    */
    addShape(url) {
        return new Promise((resolve, reject) => {
            fabric.loadSVGFromURL(url, (e) => {
                console.log('loadSVG: e=', e);
                const target = e[0];
                target.fill = 'rgba(0, 255, 255, 0.7)';
                this.#canvas.add(target);
                this.#canvas.setActiveObject(target);
                this.#canvas.fire('user:pushHistory');
                resolve();
            }, (e) => {
                console.log('loadSVG: e2=', e);
            }, {
                crossOrigin: 'Anonymous'
            });
        });
    }

    /**
    * @desc 添加图片
    * @param {string}} url 图片地址
    */
    async addImg(url) {
        if (this.#canvas.size() >= this.#limitCount) {
            this.#canvas.fire('user:message', {
                type: 'error',
                errno: 10003
            });
            return;
        }
        fabric.Image.fromURL(url, async (img, isError) => {
            if (isError) {
                // reject('图片加载失败');
                this.#canvas.fire('user:message', {
                    type: 'error',
                    message: '图片加载失败'
                });
                return Promise.reject('图片加载失败');
            }

            let top = this.#height / 2;
            let left = this.#width / 2;

            let activeObject = this.#canvas.getActiveObject();
            if (activeObject?.type === 'image') {
                top = activeObject.top;
                left = activeObject.left;
                this.#canvas.remove(activeObject);
            }

            img.set({
                top,
                left,
                originX: 'center',
                originY: 'center',
            });
            let curImage = this.#canvas.backgroundImage;
            let width = curImage.getScaledWidth();
            let height = curImage.getScaledHeight();
            // 添加的元素如果太大，则缩小到图片内
            if (img.width > width) {
                img.scaleToWidth(width);
            }
            if (img.getScaledHeight() > height) {
                img.scaleToHeight(height);
            }
            await this.#canvas.add(img);
            this.#canvas.setActiveObject(img);
            this.#canvas.fire('user:pushHistory');
            return;
        }, {
            crossOrigin: 'Anonymous'
        });
    }
}

export default Paster;
