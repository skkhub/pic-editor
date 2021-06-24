/**
* @file 编辑器主文件
* @author sunkeke
* @date 2020-12-23
*/
import {fabric} from 'fabric';
import history from './history';
import changeCorner from './change-corner';

// 让文字在添加描边后能看清本来的颜色而不被描边遮挡，默认是fill
fabric.Object.prototype.paintFirst = 'stroke';
// 这里不能将挂到全局的fabric变量消除，因为框架内部有些判断挂在了fabric上。比如，判断是否是retina屏幕，用到了fabric.devicePixelRatio
// window.fabric = null;

/** 编辑器类 */
class CanvasEditor {
    #isReady
    #running
    #machines
    #canvas
    #offscreenCanvas
    #machineParams
    #width
    #height
    #ratio
    #loadingIcon
    #toolbar
    #img
    #history
    #currentFilter
    #layer
    #layerInner
    #backgroundColor
    #padding
    #quality
    #format
    /**
    * @desc 编辑器构造函数
    * @param {object} options 配置项
    * @param {HTMLElement|string} options.id canvas挂载的dom或其id
    * @param {number} options.width canvas宽
    * @param {number} options.height canvas高
    * @param {number} options.padding padding值，单位px
    * @param {string} options.url 初始图片地址
    * @param {float} options.quality 压缩比，范围0-1，默认0.92，与canvas原生一致
    * @param {string} options.format 输出图片格式，jpeg或者png
    * @param {string} options.loadingId 执行加载动画的dom或其id，在适当时机，会显示它
    * @param {string} options.theme 主题色，默认是#55f
    * @param {string} options.backgroundColor canvas背景色，默认黑色
    * @param {string} options.layerColor 蒙层颜色，默认没有，目前用在2个地方：元素超出图片区域的地方，裁剪框外
    * @param {number} options.limitCount 添加元素上限，超过这个数会提示元素过多，默认30
    * @param {object[]} options.machines 编辑器要配备的“零件”，目前有模板、裁剪、文字、贴纸、滤镜
    */
    constructor(options) {
        // 初始化是否完成，包括图片加载完毕
        this.#isReady = false;
        // 当前正在运行的功能
        this.#running = null;
        // 加载的所有功能
        this.#machines = [];
        this.#history = history;
        options && this.init(options);
    }

    /**
    * @desc 编辑器初始化函数，在构造函数里自动调用，也可手动调用
    * @param {object} options 同构造函数的参数
    */
    async init({
        id,
        width = 653,
        height = 371,
        padding = 4,
        url,
        quality = 0.92,
        format = 'png',
        loadingId,
        // toolbarId,
        theme = '#55f',
        backgroundColor = '#000000',
        layerColor,
        limitCount = 30,
        machines
    }) {
        this.#width = width;
        this.#height = height;
        this.#backgroundColor = backgroundColor;
        this.#padding = padding;
        this.#quality = quality;
        this.#format = format;
        if (loadingId) {
            this.#loadingIcon = fabric.util.getById(loadingId);
            if (this.#loadingIcon) {
                this.#loadingIcon.style.display = 'none';
                this.#loadingIcon.style.position = 'absolute';
            }
        }
        // if (toolbarId) {
        //     this.#toolbar = fabric.util.getById(toolbarId);
        //     if (this.#toolbar) {
        //         this.#toolbar.style.display = 'none';
        //         // this.#toolbar.style.position = 'absolute';
        //     }
        // }

        this.#canvas = new fabric.Canvas(id, {
            // 去掉默认的组选择，只能单选
            selection: false,
            backgroundColor,
            // uniScaleKey默认值是shift，当按下时，会切换等比或不等比，这里取消此按键，不让用户切换
            uniScaleKey: 'none',
            // 让激活的元素保持原来的层级，默认是false，会跑到顶层
            preserveObjectStacking: true,
            controlsAboveOverlay: true
        });

        changeCorner(fabric.Object.prototype, this.#canvas, theme);

        // 离屏画布，用于overlayImage新图片和旋转、翻转时新图片的生成
        const offscreenCanvas = fabric.util.createCanvasElement();
        this.#offscreenCanvas = new fabric.StaticCanvas(offscreenCanvas);

        if (layerColor) {
            this.#layer = new fabric.Rect({
                top: 0,
                left: 0,
                width,
                height,
                fill: layerColor
            });
            this.#layerInner = new fabric.Rect({
                top: height / 2,
                left: width / 2,
                originX: 'center',
                originY: 'center',
                globalCompositeOperation: 'destination-out'
            });
        }

        document.addEventListener('keydown', e => {
            if (e.isTrusted && e.key.toLowerCase() === 'backspace') {
                let activeObject = this.#canvas.getActiveObject();
                if (activeObject && !(activeObject.type === 'i-text' && activeObject.isEditing)) {
                    this.#canvas.remove(activeObject);
                    this.pushHistory();
                }
            }
        });
        // 带user:前缀表示自定义的事件
        this.#canvas.on({
            'user:message': info => {
                // console.log('canvas info = ', info);
                if (info.type == 'error' && info.errno === 10003) {
                    info.message = '您添加的元素过多';
                }
                this.onMessage(info);
            },
            'user:imgChange': info => {
                if (layerColor) {
                // 每当图片改变时，重新设置overlayImage尺寸。overlayIamge就是顶级的蒙层，其作用是提示用户超出图片的部分元素不会被导出
                    this.#offscreenCanvas.clear();
                    this.#offscreenCanvas.set({
                        width,
                        height,
                        backgroundColor: 'transparent'
                    });
                    this.#layerInner.set({
                        width: this.#canvas.backgroundImage.getScaledWidth(),
                        height: this.#canvas.backgroundImage.getScaledHeight(),
                    });
                    this.#offscreenCanvas.add(this.#layer, this.#layerInner);
                    const url = this.#offscreenCanvas.toDataURL();
                    this.#canvas.setOverlayImage(url, this.#canvas.renderAll.bind(this.#canvas));
                }
            },
            'user:loading': e => {
                this.loading(e.show);
            },
            'user:pushHistory': e => {
                this.pushHistory();
            },
            'before:selection:cleared': e => {
                this._checkTextIsEmpty(e.target);
                this.beforeSelectionCleared(e);
                // this.#toolbar.style.display = 'none';
            },
            'selection:updated': e => {
                // console.log('updated', e.target.type);
                const type = e.target.type;
                if (type === 'image') {
                    fabric.Object.prototype.setControlsVisibility({mtr: false, mt: true, mr: true, mb: true, ml: true});
                }
                else if (type === 'i-text') {
                    fabric.Object.prototype.setControlsVisibility({mtr: false, mt: false, mr: false, mb: false, ml: false});
                }
                this.onSelectionCreated(e);
                // this.#toolbar.style.display = 'block';
                // this.positionToolbar(e.target);
            },
            'selection:created': e => {
                // console.log('created', e.target.type);
                const type = e.target.type;
                if (type === 'image') {
                    fabric.Object.prototype.setControlsVisibility({mtr: false, mt: true, mr: true, mb: true, ml: true});
                }
                else if (type === 'i-text') {
                    fabric.Object.prototype.setControlsVisibility({mtr: false, mt: false, mr: false, mb: false, ml: false});
                }
                this.onSelectionCreated(e);
                // this.#toolbar.style.display = 'block';
                // this.positionToolbar(e.target);
            },
            'object:moving': function(e) {
                // 限制元素拖动的范围
                if (e.target.top < 0) {
                    e.target.top = 0;
                }
                if (e.target.left < 0) {
                    e.target.left = 0;
                }
                if (e.target.left > width) {
                    e.target.left = width;
                }
                if (e.target.top > height) {
                    e.target.top = height;
                }
                // this.positionToolbar(e.target);
            },
            'object:moved': e => {
                // console.log('moved', e);
                // this.positionToolbar(e.target);
                this.pushHistory();
                this.onObjectMoved(e);
            },
            'object:scaled': e => {
                // console.log('scaled', e);
                // this.positionToolbar(e.target);
                this.pushHistory();
                this.onObjectScaled(e);
            },
            'object:rotated': e => {
                // console.log('rotated', e);
                // this.positionToolbar(e.target);
                this.pushHistory();
                this.onObjectRotated(e);
            },
            'mouse:down': e => {
                // console.log('mousedown', e);
                // this.positionToolbar(e.target);
                if (e.target) {
                    // this.#toolbar.style.display = 'none';
                    this.onObjectMouseDown(e);
                }
            },
            'mouse:up': e => {
                // console.log('mouseup', e);
                if (e.target && !e.target.isRemoved) {
                    // this.#toolbar.style.display = 'block';
                    // this.positionToolbar(e.target);
                    this.onObjectMouseUp(e);
                }
            },
            // 'object:scaling': e => {
            //     // console.log('moving', e);
            //     // this.positionToolbar(e.target);
            //     this.#toolbar.style.display = 'none';
            // }
        });
        // 加上这个在图文封面场景里会报错，原因未知，待排查
        // fabric.IText.prototype.on({
        //     'editing:exited': e => {
        //         console.log('exited');
        //         // this.pushHistory();
        //     }
        // });
        // console.log('class.main init');
        await this.loadImg(url);

        // 各个功能的初始化所需要的数据
        this.#machineParams = {
            canvas: this.#canvas,
            img: this.#img,
            originalRatio: this.#ratio,
            width,
            height,
            padding,
            theme,
            limitCount
        };
        this.#isReady = true;
        this.use(machines);

        // this.pushHistory();
        this.ready && this.ready();
    }

    /**
    * @func
    * @desc 先加载图片，再应用滤镜，然后设置为画布背景，最后返回Promise，异步方法
    * @param {string} url 图片地址
    * @param {Filter[]} filters 图片加载完成后，需要附加上的滤镜效果
    * @returns {Promise} 返回一个Promise对象
    */
    loadImg(url, filters = []) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(url, 
                (img, isError) => {
                    if (isError) {
                        // reject('图片加载失败');
                        this.#canvas.fire('user:message', {
                            type: 'error',
                            errno: '10002',
                            message: '图片加载失败'
                        });
                    }
                    // console.log('init img: "', img);
                    const ratio = img.width / img.height;
                    let imgWidth = 0;
                    let imgHeight = 0;
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

                    const curImg = this.#canvas.backgroundImage;
                    if (!curImg || !curImg.width || !curImg.height) {
                        this.clearHistory();
                    }
                    this.#canvas.setBackgroundImage(img, () => {
                        this.#canvas.renderAll.bind(this.#canvas);
                        this.pushHistory();
                        this.#img = img;
                        this.#ratio = ratio;
                        this.#canvas.fire('user:imgChange');
                        this.onSizeChange && this.onSizeChange.call(this, {ratio});
                        resolve();
                    });
                }, {
                    crossOrigin: 'Anonymous'
                    // crossOrigin: 'use-credentials'
                });
        });
    }

    /**
    * @desc ready钩子函数，外部在此定义初次运行的machine（目前没有默认初始machine，因为machine是外部配置的）
    */
    ready() {}

    /**
    * @desc 尺寸改变的钩子函数，比如loadImg loadHistory时，会调用此方法
    * @param {object} info 尺寸信息
    * @param {number} info.ratio 图片宽高比
    */
    onSizeChange(info) {}

    /**
    * @desc 配置要使用的machine
    * @param {object[]} machines 要使用的零件的列表
    * @returns {Editor} Editor实例
    */
    use(machines) {
        if (!this.#isReady) {
            console.warn('canvasEditor尚未初始化完成，请在ready钩子中调用');
            return;
        }
        machines = Array.isArray(machines) ? machines : [machines];
        machines.forEach(m => {
            m.init(this.#machineParams);
            this.#machines.push(m);
        });
        return this;
    }

    /**
    * 运行给定的一个machine
    * @param {number} machine 零件序号
    */
    run(machine) {
        if (!this.#isReady) {
            console.warn('canvasEditor尚未初始化完成，请稍后再试');
            return;
        }
        if (machine >= this.#machines.length) {
            console.warn('canvasEditor尚未配置该功能');
            return;
        }
        if (this.#running === machine) {
            return;
        }

        this.#machines[this.#running] && this.#machines[this.#running].stop();
        // 取消所有已选对象
        this.#canvas.discardActiveObject();
        this.#machines[machine].run();
        this.#running = machine;
        this.#canvas.requestRenderAll();
    }

    /**
    * @desc 获取序号对应的零件对象
    * @param {number} index 零件序号
    * @returns {object} machine零件对象
    */
    getMachine(index) {
        if (!this.#isReady) {
            console.warn('CanvasEditor尚未配置完成，请稍后再试！');
            return;
        }

        return this.#machines[index];
    }

    /**
    * @desc 加载动画，依赖于外部传入的dom，这里只控制其显示隐藏
    * @param {boolean} show 是否显示
    */
    loading(show = true) {
        if (this.#loadingIcon) {
            if (show) {
                this.#loadingIcon.style.display = 'block';
                this.#loadingIcon.style.top = this.#height / 2 - this.#loadingIcon.offsetHeight / 2 + 'px';
                this.#loadingIcon.style.left = this.#width / 2 - this.#loadingIcon.offsetWidth / 2 + 'px';
            }
            else {
                this.#loadingIcon.style.display = 'none';
            }
        }
    }

    /**
    * @ignore
    * @desc 检查文本是否为空，用于文本失去焦点时做检查，为空则删掉
    * @param {object} obj 待检查元素
    * @returns {boolean} 是否删除成功
    */
    _checkTextIsEmpty(obj) {
        // 如果文本元素无文本，则删去
        if (obj.type === 'i-text' && obj.text === '') {
            this.#canvas.remove(obj);
            return true;
        }
        return false;
    }
    /**
    * @desc 导出base64图片
    * @param {object} options 配置对象
    * @param {number} options.quality 图片输出质量，范围0-1，只对jpeg有效
    * @param {string} options.format 图片输出格式，jpeg或者png
    * @param {boolean} options.similarRatio 是否与画布保持相似比例，默认false，以图片为边界输出。true，当 图片宽高比 > 画布比例*4/3 或者 图片宽高比 < 画布比例*3/4，则以画布比例为边界导出图片
    * @returns {string} base64格式的图片
    */
    exportBase64(options = {}) {
        let baseOptions = {
            quality: this.#quality,
            format: this.#format,
            similarRatio: false
        };
        options = Object.assign({}, baseOptions, options);
        const {quality, format, similarRatio} = options;
        // 获得当前图片
        const img = this.#canvas.backgroundImage;
        this.#offscreenCanvas.clear();

        const imgRatio = img.width / img.height;
        const canvasRatio = this.#width / this.#height;
        if (!similarRatio ||
            imgRatio < canvasRatio * 4 / 3 &&
            imgRatio > canvasRatio * 3 / 4
        ) {
            this.#offscreenCanvas.width = img.width;
            this.#offscreenCanvas.height = img.height;

            const img2 = new fabric.Image(img.getElement());

            this.#offscreenCanvas.setBackgroundImage(img2);

            // 将元素按比例缩放后添加到离屏canvas上
            let list = [];
            this.#canvas.forEachObject(obj => {
                if (obj.type === 'image') {
                // 图片使用clone函数复制出来在离屏canvas上无法显示，原因未知
                    obj.cloneAsImage(copyObj => {
                        copyObj.set({...obj});
                        list.push(copyObj);
                    });
                }
                else {
                    obj.clone(copyObj => {
                        list.push(copyObj);
                    });
                }

            });
            // 每个元素的top、left都是基于this.#canvas的，要先转换为基于图片，然后基于离屏canvas计算其缩放比例值
            list.forEach(obj => {
                let top = obj.top - img.top;
                let left = obj.left - img.left;
                top = top / img.scaleY;
                left = left / img.scaleX;
                let scaleX = obj.scaleX / img.scaleX;
                let scaleY = obj.scaleY / img.scaleY;
                obj.set({
                    top,
                    left,
                    scaleX,
                    scaleY
                });
            });
            this.#offscreenCanvas.add(...list);
            // 对离屏canvas做导出图片操作。如果format为'jpeg'，导出的图片有黑边；建议设置png格式，但quality只对jpeg生效，详见http://fabricjs.com/docs/fabric.Canvas.html，搜索'toDataURL'
            const base64 =  this.#offscreenCanvas.toDataURL({
                format,
                quality,
                // enableRetinaScaling: true // 默认是false，如果true，在mac上的输出图片会根据retina倍率放大，同时图片大小也会变大
            });
            return base64;
        }
        else {
            if (img.scaleX === 1) {
                // 如果format为'jpeg'，导出的图片有黑边；建议设置png格式，但quality只对jpeg生效，详见http://fabricjs.com/docs/fabric.Canvas.html，搜索'toDataURL'
                const result = this.#canvas.toDataURL({
                    format,
                    quality,
                    left: this.#padding,
                    top: this.#padding,
                    width: this.#width - this.#padding * 2,
                    height: this.#height - this.#padding * 2
                    // enableRetinaScaling: true // 默认是false，如果true，在mac上的输出图片会根据retina倍率放大，同时图片大小也会变大
                });
                return result;
            }
            // 当图片需要放大的情况
            else {
                // 计算图片放大到原大小所需的scale增量
                let dScale = 1 / img.scaleX;
                this.#offscreenCanvas.width = this.#width * dScale;
                this.#offscreenCanvas.height = this.#height * dScale;
                const img2 = new fabric.Image(img.getElement(), {
                    top: img.top * dScale,
                    left: img.left * dScale
                });
                this.#offscreenCanvas.setBackgroundImage(img2);
                // 将每个元素拷贝一份按比例缩放后添加到离屏canvas上
                let list = [];
                this.#canvas.forEachObject(obj => {
                    if (obj.type === 'image') {
                        // 图片使用clone函数复制出来在离屏canvas上无法显示，原因未知
                        obj.cloneAsImage(copyObj => {
                            copyObj.set({...obj});
                            list.push(copyObj);
                        });
                    }
                    else {
                        obj.clone(copyObj => {
                            list.push(copyObj);
                        });
                    }

                });
                // 计算每个元素的top、left、width、height
                list.forEach(obj => {
                    let top = obj.top * dScale;
                    let left = obj.left * dScale;
                    let scaleX = obj.scaleX * dScale;
                    let scaleY = obj.scaleY * dScale;
                    obj.set({
                        top,
                        left,
                        scaleX,
                        scaleY
                    });
                });
                this.#offscreenCanvas.add(...list);
                this.#offscreenCanvas.backgroundColor = this.#backgroundColor;
                const result = this.#offscreenCanvas.toDataURL({
                    format,
                    quality,
                    left: this.#padding * dScale,
                    top: this.#padding * dScale,
                    width: (this.#width - this.#padding * 2) * dScale,
                    height: (this.#height - this.#padding * 2) * dScale
                    // enableRetinaScaling: true // 默认是false，如果true，在mac上的输出图片会根据retina倍率放大，同时图片大小也会变大
                });
                return result;
            }
        }
    }
    /**
    * @desc 输出当前图片信息
    * @param {stirng[]} keys 所需要的信息的key，可以是width,height等，所有可用的key就是backgroundImage的key
    * @returns {object} 对应信息
    */
    exportImgInfo(keys) {
        let result = {};
        let img = this.#canvas.backgroundImage;
        for (let key of keys) {
            if (img[key]) {
                result[key] = img[key];
            }
        }
        return result;
    }

    /**
    * @desc 输出当前画布的对象表示
    * @returns {object} 当前画布的对象表示
    */
    exportObject() {
        const content = this.#canvas.toObject(['tempId']);
        return content;
    }
    // saveAsTemp() {
    //     const content = this.#canvas.toObject();
    //     const preview = this.exportBase64();
    //     delete content.backgroundImage;
    //     return {
    //         preview,
    //         content
    //     };
    // }
    /**
    * @ignore
    * @desc 输出当前画布的JSON表示
    */
    toJSON() {
        // this.#canvas.includeDefaultValues = false;
        // const result = this.#canvas.toJSON(
        //     ['tempId']
        // );
        this.destroy();
        const result = this.#canvas.toObject(
            ['tempId']
        );
        console.log('toJSON', result);
        console.log('toJSON', JSON.stringify(result));
        // console.log('toObject:', this.#canvas.toObject());
        // console.log('toDatalessJSON:', this.#canvas.toDatalessJSON());
        // let data = '{"version":"4.2.0","objects":[{"type":"i-text","version":"4.2.0","originX":"center","originY":"center","left":326.5,"top":185.5,"width":120,"height":27.12,"fill":"#ff0","stroke":"#333","text":"请输入文字","fontSize":24,"fontFamily":"cFangJunTi","textAlign":"center","styles":{}}]}';
        // let data = '{"version":"4.2.0","objects":[{"type":"image","version":"4.2.0","originX":"center","originY":"center","left":233.5,"top":132,"width":39,"height":39,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"userType":"img","src":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAYAAACMo1E1AAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAJ6ADAAQAAAABAAAAJwAAAAAd/OCSAAAO6UlEQVRYCZVYCWwc13n+5tr74E1KIinxkEhRtg5S1h041uXYUty6jRI3aFohaooiRZw0AQojRtO0QGAgBYq4RgLFToukjiE7SopakmtZR+VY1i3ZJqmDBCUeokiKh5bc5d47s9Pvn13KjO2k8AOHszP73v++//vPtwo+5djz9b01jz/6xGqvqn1uQVX15rxpNuVtOwTY2qcU9bHptg0Eg0HkEsn+F3/60z9TPjbjk18oP3vtlc+0NC/bW2opD+t3pxoDYxHYt8fgnk1CsyjVGXIXkXN3eTn/szxzBlGolsWvbCiaBlNV+daWR6R8LpT83V68fPj1Cd2Z/Qf+/ev+/Ws3rX/o2VAksbvk5Pu6t7MPvqkZ6HkFCnEUtON/lZdIl5dyd0bh2/t4i0AndAXDq1bAkqmD/Vg/Gec6ApTnTBZ3Tl9CIByq+kPgXG+cOvntRl/omZK3LoX973bCnzahugxAd4melFUE4mCY/3lOW/miyNwc8Hwe13wqAl/9S4CsDf/ql+h4+wp0Bxzn64Rk5WHZFoTPj40tW7aUvnPpwivLE/nngv/yn+HSo+cRpEspAszZj8DmyJHN5bOd5z+55Pn+l/M/Ovv8NhvBy+44DE7x2gr6kcXbuRnnO1HYGbIHx8eYe3TPo2X/+MwPDtRdHdqZ/vdfY8LM4q6moiGroszlLYATZPQZk1dUdWGMOk7rPpjU3mdlUGnLZVOhLH3KVVhDrTKWiTe9GZi+EkxHpmCaJrK6ijc9aWzmZ69YRID9HnCeZ//+n/fXdg/uDL38P4il0vD87VMA/WD0xYMoq6kDzBwmKOGdQD1uLFyJoVAdlNKFyKuip+K4npWKITB9B43T/egY68IGMmNoOjJ5C0naSqMS2UwKGcoV08UJJkfmvcK4kFck8HeYO3Ty2DcXjcf2lL56DAG3Gy63C6lDp0iShSp/ACmy+GZoCU40bUdqYRtdzwOfKgzmCYsRyGDgR7g8lbAqFqDLWosPZnfg+MA5PDn0DtYoJpakgctWDpVVC6HS5zq7z9IqCuUUoRRZI8QPzfr8Sy91NPlLvlvy0qsIKJzIjRrC5RidisJNM6Z8YTy3ZDuG2nbAT+BBOizoL2bOJisKcnkbJi+dnx1Hs7LwiX2CIdxdvQv/VrsGW7t+jT0TCaRilpNCorNRlCdz2J0PMw6YJucBmw/O6Ghf/b3SY1dCJVMxwOOmb9vQmB7qgmH0MRheeOBLSDWtQwks7m06ri/00x3pS3AAyvycKflKgTFnE5rKw/kGmTy5+a8Ru/QqdiU7HXNGY1EsID91hu/DIJoXTI6Ilw4e2FA2k3w8eIaLyIozJF9xDDPBvvDgHqSb1sObzxCUQtyFNCK515J/nDqbsfleIXM0h2rTvAX/M4QQTZJuHgFG++WOpzDS58KX6WMK95D4lnynixDZsriv7O2AW9rQ9NXS//1A96dzAP2sMMtGOpvFLxp2kLGN8NKEAkzW2txYMGVo0lTWIVmCl0QW2BbBbkp2URQNAIPrBKTFHOel/GjzBlhOVZCZHE4gcKJEB29zQ/+b73+/qty0H5HMX8hjAp+DkfV2sA43l+9ESMk5653XVNUksngGBC9saQSqEjClErkirkgfNQkklc3D7ykwwkd4XQwbrlUkJzrTi3uJYAEmms97pa9fubLdNRWt905GqSKTrCDnhBilHWt4GF6v+AN9jPLEnGKuaNJG1pQg0OHLD2FF+RW0VA3BZ2QxHg+je6wVA4kOqEYQcVYVIcZLb8mYTlFwKpUoU1FZjQmde86ni09zQw+4jcf8d6YUo0itg42fz3uqEa1dBT+j0iGFK8TRE0wFAsyyVLQFjmLfpuNoWUwa58ykjCCT7MbJzjP4ZedTSCjNSGZNqVRODtSZdKUMCyAX7a7IOtlU9v+IWdWqyqqN0l04lHKV46TMQ1drVtBx/Fwj0SeMiY8VTJWzNLT6j+AfPn8YLc20o0LnsuhkxcvtdeHxzeP41uafwWXe5lqVSuUd9jM0tYAr4JH/HGJOefkRs6rsx5ql7XGKuFBEf0gxId5m5vcZhaQqgMXZHeene3utXux76FUEwwZmIl7MxGizIhtpMjsx5YeZdmHdylk83nQIOSplMiRz1EOUNBSWNQkvVop8OkV/cXymwJ4wWByM8HzY6ccEgGzAe4Lg4iFm+ZzJ1GA7QmWNCBYW2gJkrD6GqelyHDy1HE//0yzev8pNqP210XX44X+U4Acv3EHe1LC17SZC+jBV05AlQCsbRbVvgmbWcXf8Lm72Tjj9nay1HeYcLR14EmZ84s7873Qa/BghCsUT4quCOWW6KCdRKnotK71Cz5ZU48GFSwM4dPgD9PWzs2DyHpvScOz4FZw5N4lM2saiiizK3WNUSnGitxw3sbK1ni6q4Nx7/ZgOrmZaLwxpQh3fKz7rpDaRV9WAeD0zQgGQYFU1R0Ce2oo7WKIVh5jCZyTpgDOoLpnEl3epWNe6GJ9dG0R0IIo1S7rwzX1leKDJDa+PkUi5upJxmNMyI2htMFGzsB49N7oxNLsITV5S4IAirsIWRWhMwobLGMl4jBaZIL4lI8yIymcSsHwBdhBMG0XVBKRNCieSCxmynTC8aWzdRNO1V+KNpwcx0ZfElu/Ese8vykkz2ysyPRszkcyXwjJTaF8cR3v7SjKaxMWrU0BgNTyjfTQ4zcK9ZXfHtA4Kekksnui0ayoKdBZpDfHuSkw57Mk8MYEAk6iX+9VpdiXxGdjJ61yns49TsGh9AMseLkFwMUHlOJFBAC2PvvEyKlMHl5JAVQm7D68XXd1XMZlfSmZUhBMRMutoLdAKOIrg9MnI1AmzvvqLNnd1iCO3XjaMC2fHcYcmFD+U4i45zkNhZt7EYGYnTvRuwufXnKO/6ND9y7H6awtIVJ4scDKTrfhkNh7Bb97bAksrZ7018W6/ipHJLkxH8/CU1CFF6yyauc250vYXmCvicm5qDtrZVHk4nnAzSwqx/DOYMZsnb7AZZHLls2ikEKWHvbXG+qS6Qnjl5g9xpqcZWuoMy8lxdoy3oKUjNDev/B2k713Gi28uwHuRXcIHXEyDBoNsJNMKK9hOV1Shz4xiVaKYY2UfYcdhSPYk5u6LF2ef3Pvnu0KD47XeCUac2I6MhRLTuFC1nH5BrR1w9EPuYtAfs0xYWX0RLo1tRWwmjpDaC491FZrJ6JscQNct4MWzX8Lpme+gMmxiacUwA9lA2vQh5NORzRtI0R1WXDuKnfFBbkfk4vOCiB1EbM0yDLDF1wcHB9OTyeSRqo7W9eHrgzQhJ3LU0wwdfadwprwBfuIV+0ojKYoF6VazbOFzRiP+a+wnODHehzK9j0okkbarME52TKMWlaEIvrvt52hm3Y0kS3Dh9mZ21FOUk8TlwaXYaLNFUwv13CljsvE85hwk3d3XXqtb3fHtYFmgtGSWphQnYze8e6ILXcMfILOkA25q4tQ+6udh5RCg8ZTJJwVptGA4T5bJLElnT8haymZhRWUvWkouko0AKv1Z7F5xiLtTDruc9voLwIOsLANc8IqNe8MZhL30XwFYHOJoOH7kSGTP1/Y1BH2+tf7uW1Dl7MhNA2waQ1P9eL+qjW1F2An5OfYkKXnYAslp0WBUsnEiYIt9nAW/y2Yrr+GJpgOodV9BNpWEnU0in8uic7QJF/pXsNZqqKmKQKnXMcJK9KNoA87SqzrSs8iua0U/yXDACcDmZct6F29Z95TeM+D3zaadhMgEgnqLgidv4Qb9zzYCfCOFm4FRXCl+Irq4GCzSYLp5mpfUE3bHsGvJL5yELQEBO4f/7nkSNw+2oO7KDG70tKDfU4bllbcQbHVj3QaeJ9rdKI+nkakkOCbu++BOHT8e2fGFP7bK2loeNc53wy02dKKHHUhmGq67vegJ1yEXqOI3ctIiKJpf2nIXTWwQlJvBIkyqTA3LyzuxecERp3uWCL+dasPIuUfwSGgcl1o2YMFwD0bGFqKk8RZKcYfNQAa1dWQ+pSGaW4oBrXBsFL2c8Sdf/8aPRytDr09/YSt7NrbsQotDjQufS4/j6XM/xqKrbyDJDJ+Ci1GnMO/RpaQ8y1QyKnlcorkp+D4MlS0KBUgHci9bi3oW/Yu1HTjrasTR0CpUxyKYSlTQ5DMwU9NITw4j3ykdaUHefeYc6ZGIVVNR8dvGx7ZtY/dV47kxVDiyyZestZV08o2TPaga7UY0EUXUFYBJlvg7E93cQIZXko2ooaXwpy0H4dfvOWAFXNoOYOzeBpSODSFleLEt0YPYkkV4cPnbzAYx1nUqEdOgHQljto2dNKX9LjhiOH36dHxhff27jbu378hpSrmrZ4iUcxoXS5XQ6WCLcwlsjPRh5e0LqBjpRs30ACqmbqF6ohcNI51Ym72M1dt1GOFFZFOyv4agOoZBowFqvBoPxIdxj0fFilVX0Bo+T+iULye0W0FoZ8KItTcX8pzD2Ef+fe+ZZ66xCfij3bt3/VypLl8XPPAWStjBKuJg4t1M1AavBhqsgebG6CirgpxneViWA/kk5x1id7zGDa1uMbRQI3+4SWE7gfRU1yMSYx32voUlvmtM7AUTSgSqvQH6SPGZ21DKJ49TJ05MXe/ufn39V75YrTz04Kr0PRbo0Unn16FCseU6BoxgVYRZjQdASahsItkJwL7G9xfoP5d4cOIpXzK/VhpC9QIbS2qmUBGgsxa3t/nDD9Jk+mg1S6FN5hgQTCUfwvxkjPJWOXj48FfampueDdwcWeY5dg7+vjvw8mSvCpNzrYrMdJB+5C7tllzMfXRadqoEtZInumYPUMFfa/n7SR788bDrHtQfke2kieG9j+GkHf/9zFHc/XHwwIHOlKq+Vr+x4569aXWttbatIs0aJnsmZuNQUhn+0smN5WQtLfPc3Tkb8B2jmG00EOX9JnU4zypxjmxeY5MQk/MLf/s7Q8avZ5Bm15PZvh5DOXn/Kce2bdvK/+pb33iksbHxST+0NfpMvNFv2W41zmQ9m6DrCeT/ZxCjw/Lc1ABfMOtIGtLKw6j87Eb8ZP/+M58a3Pxt6+vrS597/vnFvb3XP5PPmntqa2tXedzuILvqTydXwBZXaCw9k2N3Tx8+dOiJ/wNfT3eWJedNIAAAAABJRU5ErkJggg==","crossOrigin":null,"filters":[]}],"backgroundImage":{"type":"image","version":"4.2.0","originX":"left","originY":"top","left":41.02,"top":4,"width":1200,"height":798,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":0.32,"scaleY":0.32,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"src":"https://p1.pstatp.com/origin/dfic-imagehandler/fa00d42f-d50e-4439-bab6-2c310e908e1d?timestamp=1608101875695","crossOrigin":"anonymous","filters":[]}}';
        // this.#canvas.loadFromJSON(data, this.#canvas.renderAll.bind(this.#canvas));
    }

    /**
    * @ignore
    * @desc 获取变形后的图片
    * @param {string} type 变形类型，可以为：rotate flipX flipY
    * @param {boolean} dir 当type为rotate时有用，表示旋转方向，默认false，逆时针
    * @returns {Promise} 返回一个Promise对象
    */
    _getTransformImg(type, dir = false) {
        if (!this.#offscreenCanvas) {
            // 创建一个离屏canvas，专门用于导出图片，这样可以保证图片不模糊，性能高，优点多多
            const offscreenCanvas = fabric.util.createCanvasElement();
            this.#offscreenCanvas = new fabric.StaticCanvas(offscreenCanvas);
        }
        else {
            // transform和获取overlayImage所用到的离屏canvas是同一个，绘制前要做清除
            this.#offscreenCanvas.clear();
        }

        // transform之前先将滤镜剥离，之后再应用于新图
        const img = this.#canvas.backgroundImage;
        let filters = img.filters;
        img.filters = [];
        img.applyFilters();

        let copyImg;
        if (type === 'rotate') {
            this.#offscreenCanvas.width = img.height;
            this.#offscreenCanvas.height = img.width;
            copyImg = new fabric.Image(img.getElement(), {
                top: img.width / 2 - img.height /2,
                left: -(img.width / 2 - img.height / 2)
            });
            const angle = dir ? -90 : 90;
            copyImg.rotate(angle);
        }
        else if (type === 'flipX') {
            this.#offscreenCanvas.width = img.width;
            this.#offscreenCanvas.height = img.height;
            copyImg = new fabric.Image(img.getElement(), {
                top: 0,
                left: 0,
                flipX: true
            });
        }
        else if (type === 'flipY') {
            this.#offscreenCanvas.width = img.width;
            this.#offscreenCanvas.height = img.height;
            copyImg = new fabric.Image(img.getElement(), {
                top: 0,
                left: 0,
                flipY: true
            });
        }
        this.#offscreenCanvas.setBackgroundImage(copyImg);
        const base64 =  this.#offscreenCanvas.toDataURL({
            quality: 1,
            // left: left,
            // top: top,
            // width,
            // height
            // enableRetinaScaling: true // 默认是false，如果true，在mac上的输出图片会根据retina倍率放大，同时图片大小也会变大
        });
        return this.loadImg(base64, filters);
    }
    /**
    * @desc 旋转
    * @param {Boolean} dir 旋转方向，默认false表示逆时针
    */
    rotate(dir = false) {
        if (this.isBusy) {
            return;
        }
        this.isBusy = true;
        this._getTransformImg('rotate', dir).then(() => {
            this.#canvas.fire('user:imgChange');
            this.isBusy = false;
        }).catch(err => {
            this.isBusy = false;
        });
    }
    /**
    * @desc 左右翻转
    */
    flipX() {
        if (this.isBusy) {
            return;
        }
        this.isBusy = true;
        this._getTransformImg('flipX').then(() => {
            this.#canvas.fire('user:imgChange');
            this.isBusy = false;
        }).catch(err => {
            this.isBusy = false;
        });
    }
    /**
    * @desc 上下翻转
    */
    flipY() {
        if (this.isBusy) {
            return;
        }
        this.isBusy = true;
        this._getTransformImg('flipY').then(() => {
            this.#canvas.fire('user:imgChange');
            this.isBusy = false;
        }).catch(err => {
            this.isBusy = false;
        });
    }
    /**
    * @desc 历史操作的前进
    */
    async forward() {
        const info = this.#history.forward();
        if (info && !this.isBusy) {
            this.isBusy = true;
            await this.loadHistory(info);
            this.isBusy = false;
            this.#canvas.fire('user:imgChange');
        }
    }
    /**
    * @desc 历史操作的后退
    */
    async back() {
        const info = this.#history.back();
        if (info && !this.isBusy) {
            this.isBusy = true;
            await this.loadHistory(info);
            this.isBusy = false;
            this.#canvas.fire('user:imgChange');
        }
    }

    /**
    * @ignore
    * @desc 将当前画布状态保存历史
    */
    pushHistory() {
        const {showBack, showForward} = this.#history.push(this.#canvas.toJSON(['getElement', 'tempId']));
        this.onHistoryChange && this.onHistoryChange({showBack, showForward});
    }
    /**
    * @ignore
    * @desc 加载历史记录
    * @param {object} param
    * @param {object} param.record 要加载的记录
    * @param {boolean} param.showBack 是否允许后退
    * @param {boolean} param.showForward 是否允许前进
    * @returns {Promise} 一个Promise对象
    */
    loadHistory({record, showBack, showForward}) {
        return new Promise((resolve, reject) =>  {
            this.#canvas.loadFromJSON(JSON.stringify(record), () => {
                // 当历史回退时，有可能图片的尺寸变了，这里触发sizeChange事件
                const ratio = this.#canvas.backgroundImage.width / this.#canvas.backgroundImage.height;
                this.onSizeChange && this.onSizeChange.call(this, {ratio});

                this.onHistoryChange && this.onHistoryChange({showBack, showForward});
                resolve();
            });
        });
    }

    /**
    * @ignore
    * @desc 清空历史记录
    * @param {boolean} isPushCurrent 是否在清空后，push一个当前的状态到历史中，当销毁时不需要保留
    */
    clearHistory(isPushCurrent = false) {
        this.#history.clear();
        if (isPushCurrent) {
            this.pushHistory();
        }
        else {
            this.onHistoryChange && this.onHistoryChange({showBack: false, showForward: false});
        }
    }

    /**
    * @desc 销毁编辑器
    */
    destroy() {
        this.#canvas.clear();
        this.#canvas.setBackgroundColor(this.#backgroundColor);
        this.clearHistory();
    }
    /**
    * @desc 当“回退历史到某一步后，做了其他的操作，产生了新的历史”时的钩子函数，主要供外部操作前进、后退按钮
    * @param {Object} info 描述后退或前进的对象
    * @param {Boolean} info.showBack 显示后退按钮
    * @param {Boolean} info.showForward 显示前进按钮
    */
    onHistoryChange() {}

    /**
    * @desc 对象选择时触发的方法
    */
    onSelectionCreated() {}
    /**
    * @desc 对象失活时触发的方法
    */
    beforeSelectionCleared() {}
    /**
    * @desc 对象移动完毕触发的方法
    * @param {object} e event对象
    */
    onObjectMoved() {}
    /**
    * @desc 对象缩放完毕触发的方法
    * @param {object} e event对象
    */
    onObjectScaled() {}
    /**
    * @desc 对象旋转完毕触发的方法
    * @param {object} e event对象
    */
    onObjectRotated() {}
    /**
    * @desc 对象鼠标按下触发的方法
    * @param {object} e event对象
    */
    onObjectMouseDown() {}
    /**
    * @desc 对象鼠标弹起触发的方法
    * @param {object} e event对象
    */
    onObjectMouseUp() {}

    /**
    * @desc 处理信息，外部可通过这个方法传入对应的弹窗方法
    * @param {object} info 信息
    * @param {string} info.type 信息类型
    * @param {string} info.message 信息文本
    */
    onMessage(info) {}
    /**
    * @ignore
    * @desc 删除对象，目前没有用到的地方
    */
    delete(obj) {
        let activeObject = obj ? obj : this.#canvas.getActiveObject();
        if (activeObject) {
            this.#canvas.remove(activeObject);
        }
        // 手动销毁对象
        activeObject = null;
    }

    /**
    * @desc 定位toolbar
    * @param {object} activeObject 依赖的定位对象，会定位到它的下方
    */
    // positionToolbar(activeObject) {
    //     const point = activeObject.getCoords()[3];
    //     // 必须在显示按钮后才能获取其offsetWith
    //     // this.#canvas._offset.left是相对于body的距离，top同样
    //     this.#toolbar.style.left = point.x + activeObject.getScaledWidth() / 2 + this.#canvas._offset.left - this.#toolbar.offsetWidth / 2 + 'px';
    //     this.#toolbar.style.top = point.y + this.#canvas._offset.top + 20 + 'px';
    //     this.#toolbar.dataset.offsetY = point.y + 20;
    //     const json = JSON.stringify({
    //         fontFamily: activeObject.fontFamily,
    //         fontWeight: activeObject.fontWeight === '700' ? 1 : 0,
    //         fontStyle: activeObject.fontStyle === 'italic' ? 1 : 0,
    //         underline: activeObject.underline,
    //         linethrough: activeObject.linethrough,
    //         fill: activeObject.fill,
    //         strokeWidth: activeObject.strokeWidth,
    //         strokeColor: activeObject.strokeColor,
    //     });
    //     this.#toolbar.dataset.activeInfo = json;
    // }
    /**
    * @desc 改变当前选中元素的样式
    * @param {object} rules 规则
    */
    changeStyle(rules) {
        // console.log('main接收到的rules: ', rules);
        let activeObject = this.#canvas.getActiveObject();
        if (activeObject) {            
            activeObject.set({
                ...rules
            });
            this.#canvas.requestRenderAll();
            return Promise.resolve();
        }
        return Promise.reject();
    }
    /**
    * @desc 改变当前选中元素的层级
    * @param {number|string} num 要改变的层级，'top'表示置顶，'bottom'表示置底，1表示上移一层，-1表示下移一层
    */
    changeIndex(num) {
        let activeObject = this.#canvas.getActiveObject();
        if (activeObject) {            
            switch(num) {
            case 'bottom': activeObject.sendToBack(); break;
            case 1: activeObject.bringForward(); break;
            case -1: activeObject.sendBackwards(); break;
            case 'top': activeObject.bringToFront(); break;
            }
            // this.#canvas.requestRenderAll();
            // return Promise.resolve();
        }
        this.pushHistory();
    }

    /**
    * @desc 对比
    * @param {boolean} show 显示还是隐藏
    */
    contrast(show = true) {
        this.#canvas.forEachObject((obj, index) => {
            obj.visible = show;
            this.#canvas.discardActiveObject();
        });
        if (show) {
            this.#canvas.backgroundImage.filters[0] = this.#currentFilter;
        }
        else {
            this.#currentFilter = this.#canvas.backgroundImage.filters[0];
            this.#canvas.backgroundImage.filters[0] = null;
        }

        this.#canvas.backgroundImage.applyFilters();
        this.#canvas.renderAll();
    }

    /**
    * @desc 获取当前画布中元素的数量
    */
    getSize() {
        return this.#canvas.size();
    }
}

export default CanvasEditor;
