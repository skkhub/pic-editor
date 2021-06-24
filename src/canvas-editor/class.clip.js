/**
* @file 裁剪零件类
* @author sunkeke
* @date 2020-12-24
*/

import {fabric} from 'fabric';
import {formatFloat} from './utils';
import {tl, tr, bl} from './change-corner';

// 线宽
const LINE_WIDTH = 4;

/**
 * 注意：
 * 1.fabricjs的getScaledHeight() getScaledWidth()的计算结果并不准确，可以用Object.height * Object.scaleH代替
 */

/**
* @desc 裁剪零件类
*/
class Clip {
    #canvas
    #baseCanvas
    #offscreenCanvas
    #width
    #height
    #padding
    #clipRatio
    #grayLayer
    #rect
    #limit
    #minWidth
    #minHeight
    #isRunning
    /**
    * @desc 裁剪构造函数
    * @param {object} options 配置对象
    * @param {function} options.complete 裁剪完成后执行的方法
    * @param {HTMLElement|string} options.btnId 完成按钮的dom或者其对应的id
    * @param {string} options.layerColor 裁剪遮罩的颜色
    * @param {number} options.minWidth 裁剪限制的最小宽度
    * @param {number} options.minHeight 裁剪限制的最小高度
    */
    constructor({complete, btnId, layerColor, minWidth, minHeight}) {
        if (typeof complete !== 'function') {
            throw Error('complete must be a function!');
        }

        this.complete = complete;
        // 确定按钮dom
        this.btn = null;
        this._createCompletedBtn(btnId);
        this.layerColor = layerColor ?? 'rgba(246, 248, 249, 0.7)';

        this.#minWidth = minWidth;
        this.#minHeight = minHeight;
    }

    /**
    * @ignore
    * @desc 初始化方法
    * @param {object} options 配置对象
    * @param {object} options.canvas 主canvas对象
    * @param {number} options.padding padding值
    * @param {number} options.originalRatio 初始比例，宽除以高的值
    * @param {number} options.width canvs的宽
    * @param {number} options.height canvas的高
    * @param {string} options.theme 主题色，默认#55f
    */
    init({
        canvas,
        padding,
        originalRatio,
        width,
        height,
        theme,
    }) {
        // 创建一个新canvas承载裁剪功能，本质是用globalCompositeOperation = 'destination-out'
        const dom = fabric.util.createCanvasElement();
        dom.width = width;
        dom.height = height;
        dom.style.zIndex = 9;
        canvas.wrapperEl.appendChild(dom);
        this.#canvas = new fabric.Canvas(dom, {
            // 控制等比缩放的开关，false为不等比缩放，在自由比例裁剪时设置为false，默认为true
            // uniformScaling: false,
            // uniScaleKey默认值是shift，当按下时，会切换等比或不等比裁剪，这里取消此按键，不让用户切换
            uniScaleKey: 'none'
        });
        this.#baseCanvas = canvas;
        this.#width = width;
        this.#height = height;
        this.#padding = padding;
        this.#clipRatio = originalRatio;
        this.#grayLayer = new fabric.Rect({
            left: 0,
            top: 0,
            width: this.#width,
            height: this.#height,
            fill: this.layerColor,
            evented: false,
            hasControls: false,
            selectable: false
        });
        // 用户操作的裁剪框
        this.#rect = new fabric.Rect({
            // left: 80,
            // top: 80,
            // width,
            // height,
            // borderColor: 'transparent',
            borderColor: theme ?? '#55f',
            borderOpacityWhenMoving: 0.6,
            padding: 0,
            minScaleLimit: 0.2,
            // noScaleCache: false,
            // flipX: false,
            // flipY: true,
            lockScalingFlip: true,
            // cornerColor: 'transparent',
            cornerColor: theme ?? '#55f',
            cornerSize: 18,
            globalCompositeOperation: 'destination-out'
        });

        // 当前img的裁剪路径，因为裁剪起点在img的中心，这里做处理，top、left分别减去对应尺寸的一半，以转移起点到img的左上角
        // this.#clipRect = new fabric.Rect({
        //     top: 0 - formatFloat(this.#img.height / 2),
        //     left: 0 - formatFloat(this.#img.width / 2),
        //     width: this.#img.width,
        //     height: this.#img.height
        // });
        // fabricjs自带的clone函数经过clone后，数据不完全一样，这里只取需要的数据
        // this.#initData = {
        //     imgWidth,
        //     imgHeight,
        //     originalRatio,
        //     top: img.top,
        //     left: img.left,
        //     scaleX: img.scaleX,
        //     imgElement: img.getElement()
        // };

        this._changeRectControls();
        this._bindEvent();
        this.#canvas.add(this.#grayLayer, this.#rect);
        // img在canvas中的四个角的坐标
        this.#limit = null;
        this.calcLimit();
        this.show(false);
        this.#baseCanvas.on('user:imgChange', e => {
            this.calcLimit();
            this.draw();
            const {width, height} = this.#baseCanvas.backgroundImage;
            // 当图片有宽高，即有图片在编辑时，显示裁剪控件
            if (width && height) {
                if (this.#isRunning) {
                    this.show();
                    this.positionBtn();
                }
            }
            else {
                this.show(false);
            }
        });
    }

    /**
    * @ignore
    * @desc 是否显示裁剪框的dom，由于裁剪功能独立于编辑器，定位在编辑器上方，当关闭时需要使其dom隐藏掉
    * @param {*} param 变量描述
    * @returns {*} return 返回描述
    */
    show(isShow = true) {
        this.#canvas.wrapperEl.style.display = (isShow ? 'block' : 'none');
    }

    /**
    * @ignore
    * @desc 显示按钮并在duration后隐藏，0表示不自动关闭
    * @param {number} duration 延时，单位毫秒
    */
    showBtn(duration = 0) {
        this.btn.style.display = 'block';
        clearTimeout(this.timer);
        if (duration) {
            this.timer = setTimeout(() => {
                this.btn.style.display = 'none';
            }, duration);
        }
    }

    /**
    * @ignore
    * @desc 立即隐藏按钮
    */
    hideBtn() {
        clearTimeout(this.timer);
        this.btn.style.display = 'none';
    }

    /**
    * @ignore
    * @desc 零件标准方法之一，运行零件
    */
    run() {
        this.#isRunning = true;
        this.calcLimit();
        this.draw();
        const {width, height} = this.#baseCanvas.backgroundImage;
        // 当图片有宽高，即有图片在编辑时，显示裁剪控件
        if (width && height) {
            this.show();
            this.positionBtn();
        }
        else {
            this.show(false);
        }
    }

    /**
     * @desc 设置裁剪比例
     * @param {float} r 裁剪比例，当为0时，表示自由比例
     */
    setRatio(r) {
        if (r) {
            this.#clipRatio = r;
            this.#canvas.uniformScaling = true;
            this.#rect.setControlsVisibility({mt: false, mr: false, mb: false, ml: false});
            this.draw();
        }
        else {
            this.#canvas.uniformScaling = false;
            this.#rect.setControlsVisibility({mt: true, mr: true, mb: true, ml: true});
            this.#canvas.renderAll();
        }
        // 当图片不存在时，不显示按钮
        const {width, height} = this.#baseCanvas.backgroundImage;
        if (this.#isRunning && width && height) {
            this.positionBtn();
        }
        // let img = this.#baseCanvas.backgroundImage;
        // let originalRatio = img.width / img.height;
        // if (this.#clipRatio !== originalRatio) {
        //     this.positionBtn();
        // }
        // else {
        //     this.hideBtn();
        // }
    }

    /**
    * @ignore
    * @desc 零件标准方法之一，停止零件
    */
    stop() {
        this.show(false);
        this.hideBtn();
        this.#isRunning = false;
    }

    /**
    * @ignore
    * @desc 绘制裁剪矩形
    */
    draw() {
        let img = this.#baseCanvas.backgroundImage;
        let originalRatio = img.width / img.height;

        let width;
        let height;
        if (originalRatio > this.#clipRatio) {
            height = img.height * img.scaleY;
            width = formatFloat(height * this.#clipRatio);
        }
        else {
            width = img.width * img.scaleX;
            height = formatFloat(width / this.#clipRatio);
        }

        // 当有最小尺寸要求时，限制尺寸
        let minScaleXLimit = 0.2;
        let minScaleYLimit = 0.2;
        if (this.#minWidth) {
            minScaleXLimit = this.#minWidth * img.scaleX / width;
        }
        if (this.#minHeight) {
            minScaleYLimit = this.#minHeight * img.scaleY / height;
        }
        // 有可能给定的最小值比目前的图片都大，这里要限制minScaleLimit最大为1，否则渲染会出错；此情况下相当于只保证了比例
        let minScaleLimit = Math.min(Math.max(minScaleXLimit, minScaleYLimit, 0.2), 1);
        // 限制尺寸结束

        const left = formatFloat((this.#width - width) / 2);
        const top = formatFloat((this.#height - height) / 2);
        this.#rect.set({left, top, width, height, scaleX: 1, scaleY: 1, minScaleLimit});
        this.#canvas.setActiveObject(this.#rect);
        this.#canvas.renderAll();
        // console.log(height, this.#clipRatio, height * this.#clipRatio);
    }

    /**
    * @ignore
    * @desc 改变默认的控制器
    */
    _changeRectControls() {
        // 顶部的旋转一直隐藏
        this.#rect.setControlsVisibility({mtr: false, mt: false, mr: false, mb: false, ml: false});

        // 所有fabric对象的控件都源自原型上的控件，为了不影响其他对象，这里要先对controls做个深拷贝，主要是改对应角的render函数
        const controls = Object.assign({}, this.#rect.controls);
        const {br, mt, mb, ml, mr} = this.#rect.controls;

        controls.tl = new fabric.Control(tl);
        controls.tr = new fabric.Control(tr);
        controls.br = new fabric.Control(br);
        controls.bl = new fabric.Control(bl);
        controls.mt = new fabric.Control(mt);
        controls.mb = new fabric.Control(mb);
        controls.ml = new fabric.Control(ml);
        controls.mr = new fabric.Control(mr);

        controls.tl.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            left = left - LINE_WIDTH / 2;
            top = top - LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left, top + size);
            ctx.lineTo(left, top);
            ctx.lineTo(left + size, top);
            ctx.stroke();
            ctx.restore();
        };
        controls.tr.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            left = left + LINE_WIDTH / 2;
            top = top - LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left - size, top);
            ctx.lineTo(left, top);
            ctx.lineTo(left, top + size);
            ctx.stroke();
            ctx.restore();
        };
        controls.br.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            left = left + LINE_WIDTH / 2;
            top = top + LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left, top - size);
            ctx.lineTo(left, top);
            ctx.lineTo(left - size, top);
            ctx.stroke();
            ctx.restore();
        };
        controls.bl.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            left = left - LINE_WIDTH / 2;
            top = top + LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left, top - size);
            ctx.lineTo(left, top);
            ctx.lineTo(left + size, top);
            ctx.stroke();
            ctx.restore();
        };
        controls.mt.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            top = top - LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left - size / 2, top);
            ctx.lineTo(left + size / 2, top);
            ctx.stroke();
            ctx.restore();
        };
        controls.mb.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            top = top + LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left - size / 2, top);
            ctx.lineTo(left + size / 2, top);
            ctx.stroke();
            ctx.restore();
        };
        controls.ml.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            left = left - LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left, top - size / 2);
            ctx.lineTo(left, top + size / 2);
            ctx.stroke();
            ctx.restore();
        };
        controls.mr.render = function (ctx, left, top, styleOverride = {}, fabricObject) {
            const size = styleOverride.cornerSize || fabricObject.cornerSize;
            left = left + LINE_WIDTH / 2;
            ctx.save();
            ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(left, top - size / 2);
            ctx.lineTo(left, top + size / 2);
            ctx.stroke();
            ctx.restore();
        };
        this.#rect.controls = controls;
    }

    /**
    * @ignore
    * @desc 重新计算四个限制角的坐标
    */
    calcLimit() {
        const img = this.#baseCanvas.backgroundImage;
        // 为何不用getScaledWidth()？尝试过，会有误差，原因未知
        const imgWidth = img.width * img.scaleX;
        const imgHeight = img.height * img.scaleY;
        this.#limit = {
            tl: new fabric.Point((this.#width - imgWidth) / 2, (this.#height - imgHeight) / 2),
            tr: new fabric.Point((this.#width + imgWidth) / 2, (this.#height - imgHeight) / 2),
            br: new fabric.Point((this.#width + imgWidth) / 2, (this.#height + imgHeight) / 2),
            bl: new fabric.Point((this.#width - imgWidth) / 2, (this.#height + imgHeight) / 2)
        };
    }

    /**
    * @ignore
    * @desc 绑定事件
    */
    _bindEvent() {
        const scaleHandler = (e, originPoint) => {
            const {scaleX, scaleY} = e.transform.original;
            const {corner} = e.transform;
            const limitScaleX = (Math.abs(originPoint.x - this.#limit[corner].x) + this.#rect.width * scaleX)
            / this.#rect.width;
            const limitScaleY = (Math.abs(originPoint.y - this.#limit[corner].y) + this.#rect.height * scaleY)
            / this.#rect.height;
            const limitScale = Math.min(limitScaleX, limitScaleY);
            const curScale = this.#rect.getObjectScaling();

            if (this.#canvas.uniformScaling) {
                if (curScale.scaleX > limitScale) {
                    this.#rect.locaScalingX = true;
                    this.#rect.scale(limitScale);
                    this.#rect.lockScalingX = false;
                }
            }
            else {
                if (curScale.scaleX > limitScaleX) {
                    this.#rect.locaScalingX = true;
                    this.#rect.set({
                        scaleX: limitScaleX
                    });
                    this.#rect.lockScalingX = false;
                }

                if (curScale.scaleY > limitScaleY) {
                    this.#rect.locaScalingY = true;
                    this.#rect.set({
                        scaleY: limitScaleY
                    });
                    this.#rect.lockScalingY = false;
                }
            }

            // 获取当前所选区域对应的图片尺寸，如果业务有需要，可以取消注释
            // let img = this.#baseCanvas.backgroundImage;
            // let curSize = [this.#rect.width * this.#rect.scaleX / img.scaleX, this.#rect.height * this.#rect.scaleY / img.scaleY];
            // console.log('curSize=', curSize);
        };
        this.#canvas.on('mouse:down', () => {
            this.#canvas.setActiveObject(this.#rect);
        });
        this.#rect.on({
            moving: e => {
                const curHeight = this.#rect.height * this.#rect.scaleY;
                const curWidth = this.#rect.width * this.#rect.scaleX;
                const limitTop = this.#limit.tl.y;
                const limitBottom = this.#limit.bl.y - curHeight;
                const limitLeft = this.#limit.tl.x;
                const limitRight = this.#limit.tr.x - curWidth;
                // console.log('< ', this.#rect.top, limitTop);
                if (this.#rect.top < limitTop) {
                    this.#rect.set({
                        top: limitTop
                    });
                }

                if (this.#rect.top > limitBottom) {
                    this.#rect.set({
                        top: limitBottom
                    });
                }

                if (this.#rect.left < limitLeft) {
                    this.#rect.set({
                        left: limitLeft
                    });
                }

                if (this.#rect.left > limitRight) {
                    this.#rect.set({
                        left: limitRight
                    });
                }
                // console.log('move this.#rect.top = ', this.#rect.top, limitTop);
                this.positionBtn();
            },
            scaling: e => {
                const {
                    top,
                    left,
                    scaleX,
                    scaleY
                } = e.transform.original;
                switch (e.transform.corner) {
                case 'tl': {
                    const originPoint = new fabric.Point(left, top);
                    scaleHandler(e, originPoint);
                    break;
                }
                case 'tr': {
                    const originPoint = new fabric.Point(left + this.#rect.width * scaleX, top);
                    scaleHandler(e, originPoint);
                    break;
                }
                case 'br': {
                    const originPoint = new fabric.Point(left + this.#rect.width * scaleX,
                        top + this.#rect.height * scaleY);
                    scaleHandler(e, originPoint);
                    break;
                }
                case 'bl': {
                    const originPoint = new fabric.Point(left, top + this.#rect.height * scaleY);
                    scaleHandler(e, originPoint);
                    break;
                }
                case 'mt': {
                    const limitScaleY = (Math.abs(top - this.#limit.tl.y) + this.#rect.height * scaleY)
                        / this.#rect.height;
                    const curScale = this.#rect.getObjectScaling();
                    if (curScale.scaleY > limitScaleY) {
                        this.#rect.lockScalingY = true;
                        this.#rect.set({
                            scaleY: limitScaleY
                        });
                        this.#rect.lockScalingY = false;
                    }

                    break;
                }
                case 'mb': {
                    const limitScaleY = (Math.abs(top - this.#limit.bl.y)) / this.#rect.height;
                    const curScale = this.#rect.getObjectScaling();
                    if (curScale.scaleY > limitScaleY) {
                        this.#rect.lockScalingY = true;
                        this.#rect.set({
                            scaleY: limitScaleY
                        });
                        this.#rect.lockScalingY = false;
                    }

                    break;
                }
                case 'ml': {
                    const limitScaleX = (Math.abs(left - this.#limit.tl.x) + this.#rect.width * scaleX)
                        / this.#rect.width;
                    const curScale = this.#rect.getObjectScaling();
                    if (curScale.scaleX > limitScaleX) {
                        this.#rect.lockScalingX = true;
                        this.#rect.set({
                            scaleX: limitScaleX
                        });
                        this.#rect.lockScalingX = false;
                    }

                    break;
                }
                case 'mr': {
                    const limitScaleX = (Math.abs(left - this.#limit.tr.x)) / this.#rect.width;
                    const curScale = this.#rect.getObjectScaling();
                    if (curScale.scaleX > limitScaleX) {
                        this.#rect.lockScalingX = true;
                        this.#rect.set({
                            scaleX: limitScaleX
                        });
                        this.#rect.lockScalingX = false;
                    }

                    break;
                }
                }
                this.positionBtn();
            }
        });
    }

    /**
    * @ignore
    * @desc 获取完成按钮并绑定完成函数
    */
    _createCompletedBtn(id) {
        // 与document.getElementById有何不同？getById作了层包装，如果id不是字符串，则直接返回id
        this.btn = fabric.util.getById(id);
        if (!this.btn) {
            throw('请务必配置裁剪确定按钮的id');
        }
        this.btn.onclick =  this._completeClip.bind(this);
    }

    /**
    * @ignore
    * @desc 第一个版本的裁剪实现，利用clipPath，能够做到快速的裁剪效果，要不是有旋转、翻转的操作，就使用这个思路了
    */
    // completeClip2() {
    //     this.hideBtn();
    //     // absolutePositioned为true的情况与默认的false的计算方式不一样，但都会有黑边问题，这里使用默认的false的计算方式
    //     // 计算出一个裁剪路径，基于当前裁剪框，映射到img后的实际裁剪路径对象，这里假设已经被裁剪过一次，当然第一次的裁剪框路径（this.clipRect）就是图片本身的大小，已在init里设置
    //     // 这里不用getScaledWidth()计算，是因为有坑，曾经计算出的结果是364，而实际应该是363
    //     const rect = new fabric.Rect({
    //         top: this.#clipRect.top + (this.#rect.top - this.#limit.tl.y) / this.#imgHeight * this.#clipRect.height,
    //         left: this.#clipRect.left + (this.#rect.left - this.#limit.tl.x) / this.#imgWidth * this.#clipRect.width,
    //         width: this.#rect.width * this.#rect.scaleX / this.#imgWidth * this.#clipRect.width,
    //         height: this.#rect.height * this.#rect.scaleY / this.#imgHeight * this.#clipRect.height
    //         // absolutePositioned: true
    //         // originX: 'right',
    //         // originY: 'bottom',
    //         // inverted: true
    //     });
    //     // 当前裁剪比例
    //     let ratio;
    //     if (this.#canvas.uniformScaling) {
    //         // 当是等比缩放时，直接将当前的clipRatio赋值，防止js计算的不准确性导致的微小差异
    //         ratio = this.#clipRatio;
    //     }
    //     else {
    //         ratio = rect.width / rect.height;
    //     }
    //     if (this.#width / this.#height > ratio) {
    //         this.#imgHeight = this.#height - this.#padding * 2;
    //         this.#imgWidth = ratio * this.#imgHeight;
    //     }
    //     else {
    //         this.#imgWidth = this.#width - this.#padding * 2;
    //         this.#imgHeight = this.#imgWidth / ratio;
    //     }

    //     let dScaleX = this.#imgWidth / (this.#rect.width * this.#rect.scaleX);
    //     const imgOriginalScale = this.#img.scaleX;
    //     let imgScale = imgOriginalScale * dScaleX;

    //     // 当图片scale超过1时，限制其最大为1
    //     if (imgScale > 1) {
    //         imgScale = 1;
    //         dScaleX = imgScale / imgOriginalScale;
    //         this.#imgWidth = dScaleX * (this.#rect.width * this.#rect.scaleX);
    //         this.#imgHeight = this.#imgWidth / ratio;
    //     }

    //     // 上边有说明，裁剪路径是以被裁剪对象的中心为锚点，上边已经转换到左上角加上了this.img.heignt / 2，这里要减去
    //     const top = (this.#height - this.#imgHeight) / 2 - (rect.top + this.#img.height / 2) * imgScale;
    //     const left = (this.#width - this.#imgWidth) / 2 - (rect.left + this.#img.width / 2) * imgScale;
    //     this.#img.set({clipPath: rect, top, left, scaleX: imgScale, scaleY: imgScale});
    //     // console.log('确定裁剪 ', imgScale, left);
    //     this.#clipRatio = this.#originalRatio = ratio;
    //     this.#clipRect = rect;
    //     this.draw();
    //     this.calcLimit();
    //     this.#canvas.renderAll();
    //     this.#baseCanvas.renderAll();

    //     typeof this.complete === 'function' && this.complete({
    //         ratio
    //     });
    // }

    /**
    * @ignore
    * @desc 完成裁剪，被绑定在完成按钮上
    */
    _completeClip() {
        // 获得当前图片
        const img = this.#baseCanvas.backgroundImage;
        // 将滤镜单独剥离出来，裁剪完成后在附加到新图上
        let filters = img.filters;
        img.filters = [];
        img.applyFilters();

        this.#baseCanvas.fire('user:loading', {show: true});
        if (!this.#offscreenCanvas) {
            // 创建一个离屏canvas，专门用于导出图片，这样可以保证图片不模糊，性能高，优点多多
            const offscreenCanvas = fabric.util.createCanvasElement();
            this.#offscreenCanvas = new fabric.Canvas(offscreenCanvas);
        }

        const top = (this.#rect.top - this.#limit.tl.y) / img.scaleY;
        const left = (this.#rect.left - this.#limit.tl.x) / img.scaleX;
        const width = this.#rect.width * this.#rect.scaleX / img.scaleX;
        const height = this.#rect.height * this.#rect.scaleY / img.scaleY;

        this.#offscreenCanvas.width = width;
        this.#offscreenCanvas.height = height;

        const img2 = new fabric.Image(img.getElement(), {
            top: -top,
            left: -left
        });

        this.#offscreenCanvas.setBackgroundImage(img2);

        const base64 =  this.#offscreenCanvas.toDataURL({
            // format: this.format,
            quality: 1,
            // left: left,
            // top: top,
            // width,
            // height
            // enableRetinaScaling: true // 默认是false，如果true，在mac上的输出图片会根据retina倍率放大，同时图片大小也会变大
        });
        this.loadImg(base64, filters)
            .then(({ratio}) => {
                if (this.#canvas.uniformScaling) {
                    // 当是等比缩放时，直接将当前的clipRatio赋值，防止js计算的不准确性导致的微小差异
                    ratio = this.#clipRatio;
                }
                this.#clipRatio = ratio;
                this.calcLimit();
                this.draw();
                this.#canvas.renderAll();
                this.#baseCanvas.renderAll();

                this.#baseCanvas.fire('user:pushHistory');

                typeof this.complete === 'function' && this.complete({
                    ratio
                });

                this.#baseCanvas.fire('user:imgChange', {});
                this.#baseCanvas.fire('user:loading', {show: false});
                this.hideBtn();
            });
    }

    /**
    * @ignore
    * @desc 加载图片
    * @param {string} url 图片地址
    * @param {object[]} filters 需要应用的滤镜效果数组
    * @returns {Promise}
    */
    loadImg(url, filters = []) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(url, (img, isError) => {
                if (isError) {
                    reject('图片加载失败');
                }

                const ratio = img.width / img.height;
                let imgHeight;
                let imgWidth;
                if (this.#width / this.#height > ratio) {
                    imgHeight = this.#height - this.#padding * 2;
                    imgWidth = imgHeight * ratio;
                    // 这里确保原始图片缩放因子不超过1
                    if (imgHeight > img.height) {
                        imgHeight = img.height;
                        imgWidth = img.width;
                    }
                    else {
                        img.scaleToHeight(imgHeight);
                    }
                }
                else {
                    imgWidth = this.#width - this.#padding * 2;
                    imgHeight = imgWidth / ratio;
                    // 这里确保原始图片缩放因子不超过1
                    if (imgWidth > img.width) {
                        imgWidth = img.width;
                        imgHeight = img.height;
                    }
                    else {
                        // 其实这里的scaleToWidth跟scaleToHeight是一样的效果，因为是等比缩放
                        img.scaleToWidth(imgWidth);
                    }
                }

                img.set({
                    top: (this.#height - imgHeight) / 2,
                    left: (this.#width - imgWidth) / 2,
                });
                if (filters.length) {
                    img.filters = filters;
                    img.applyFilters();
                }
                this.#baseCanvas.setBackgroundImage(img, this.#baseCanvas.renderAll.bind(this.#baseCanvas));
                // this.#img = img;
                resolve({ratio});
            }, {
                crossOrigin: 'Anonymous'
            });
        });
    }
    // restore() {
    //     this.hideBtn();
    //     const {
    //         imgWidth,
    //         imgHeight,
    //         originalRatio,
    //         top,
    //         left,
    //         scaleX,
    //         imgElement
    //     } = this.#initData;
    //     // this.#imgWidth = imgWidth;
    //     // this.#imgHeight = imgHeight;
    //     this.#clipRatio = originalRatio;
    //     // this.#clipRect = new fabric.Rect({
    //     //     top: 0 - this.#img.height / 2,
    //     //     left: 0 - this.#img.width / 2,
    //     //     width: this.#img.width,
    //     //     height: this.#img.height
    //     // });
    //     // this.#img.set({clipPath: null, top, left, scaleX, scaleY: scaleX});
    //     const img = new fabric.Image(imgElement, {
    //         top,
    //         left,
    //         scaleX,
    //         scaleY: scaleX
    //     });
    //     this.#baseCanvas.setBackgroundImage(img, this.#baseCanvas.renderAll.bind(this.#baseCanvas));
    //     this.calcLimit();
    //     this.draw();
    //     return Promise.resolve({
    //         ratio: originalRatio
    //     });
    // }

    /**
    * @ignore
    * @desc 定位完成按钮，使其始终保持在右下角
    * @param {number} duration 多少毫秒后隐藏按钮
    */
    positionBtn(duration = 0) {
        this.showBtn(duration);
        const point = this.#rect.getCoords()[2];
        // 必须在显示按钮后才能获取其offsetWith
        this.btn.style.left = point.x - this.btn.offsetWidth + 'px';
        this.btn.style.top = point.y + LINE_WIDTH + 0 + 'px';
    }

}

export default Clip;
