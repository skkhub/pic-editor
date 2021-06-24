
module.exports = function(param, req, res) {
    console.log(param);
    if (param.type === 'cover' && param.tag === 'personal') {
        return require('./template3');
    }
    if (param.type === 'cover' && param.tag === 'recent') {
        return require('./template2');
    }
    else if (param.type === 'cover') {
        return require('./template');
    }
    else if (param.type === 'element') {
        if (param.element === 'font') {
            return require('./font2');
        }
        else if (param.element === 'stroke') {
            return require('./stroke');
        }
        else if (param.element === 'paster') {
            return require('./paster');
        }
    }
    return {
        errno: 0,
        errmsg: '自定义参数错误'
    };
};