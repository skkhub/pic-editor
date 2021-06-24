/**
* @file 滤镜零件类
* @author sunkeke
* @date 2020-12-22
*/
import {fabric} from 'fabric';
// bug: 使用滤镜，再裁剪，则滤镜已经作为原图的一部分，无法撤销。可以这样做：裁剪前，先取消滤镜，裁剪后，再应用之前的滤镜。解决于：2021-4-14

/** 滤镜零件类 */
class Filter {
    #canvas
    /**
    * @ignore
    * @desc 零件标准方法之一，初始化零件
    * @param {object} options 配置对象
    * @param {object} options.canvas 主canvas对象
    */
    init({canvas}) {
        this.#canvas = canvas;
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
    * @desc 设置滤镜
    * @param {string}} type 滤镜类型，具体值可参照http://fabricjs.com/image-filters
    * @param {object|number}} value 滤镜值，根据滤镜类型不同，传入的值也不同
    */
    setFilter(type, value) {
        let filter = null;
        if (type && typeof value === 'object') {
            filter = new fabric.Image.filters[type]({
                ...value
            });
        }
        else if (type) {
            filter = new fabric.Image.filters[type]({
                [type.toLowerCase()]: value
            });
        }
        this.#canvas.backgroundImage.filters[0] = filter;
        this.#canvas.backgroundImage.applyFilters();
        this.#canvas.renderAll();
        this.#canvas.fire('user:pushHistory');
    }

    /**
    * @desc 预留的滤镜全功能
    * @param {Array} filters 滤镜数组，具体可参照http://fabricjs.com/image-filters
    */
    set(filters) {
        this.#canvas.backgroundImage.filters = filters;
        this.#canvas.backgroundImage.applyFilters();
        this.#canvas.renderAll();
        this.#canvas.fire('user:pushHistory');
    }
}

export default Filter;
