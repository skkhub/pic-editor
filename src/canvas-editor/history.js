/**
* @file 编辑器内部用，历史操作记录类，目前是单例模式
* @author sunkeke
* @date 2021-02-01
*/

class History {
    #maxLength = 10
    #records = [];
    #curIndex = -1;
    #curMax = -1;
    push(record) {
        // 当是回退后新修改时，将此步骤之后的记录都删掉
        if (this.#curIndex < this.#curMax) {
            this.#records.splice(this.#curIndex + 1, this.#maxLength, record);
        }
        else {
            if (this.#records.length >= this.#maxLength) {
                this.#records.shift();
            }
            this.#records.push(record);
        }
        this.#curIndex = this.#curMax = Math.min(this.#curIndex + 1, this.#maxLength - 1);
        return {
            record,
            showBack: this.#curIndex > 0, // 只有1条记录时，不显示后退按钮
            showForward: false
        };
    }
    back() {
        if (this.#curIndex === 0) {
            return null;
        }
        this.#curIndex = Math.max(this.#curIndex - 1, 0);
        return {
            record: this.#records[this.#curIndex],
            showBack: this.#curIndex > 0,
            showForward: true
        };
    }
    forward() {
        if (this.#curIndex === this.#curMax) {
            return null;
        }
        this.#curIndex = Math.min(this.#curIndex + 1, this.#curMax);

        return {
            record: this.#records[this.#curIndex],
            showBack: true,
            showForward: this.#curIndex != this.#curMax
        };;
    }
    getRecords() {
        return this.#records;
    }
    clear() {
        this.#records.length = 0;
        this.#curIndex = -1;
        this.#curMax = -1;
    }
}
const hist = new History();
// window.ce = {
//     history: hist
// };

export default hist;
