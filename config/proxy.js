/**
* @file proxy
* @author sunkeke
* @date 2020-11-25
*/

module.exports = {
    openProxy: 0, // 1表示开启后端代理，0表示使用本地mock数据
    myProxy: {
        '/pcui/': {
            target: 'http://172.24.209.169:8859',
            secure: false, // https的才需要配置此
            changeOrigin: true,
            headers: {
                origin: 'http://172.24.209.169:8859',
            }
        },
        '/builder/': {
            target: 'http://172.24.209.169:8859',
            changeOrigin: true,
            headers: {
                origin: 'http://172.24.209.169:8859',
            }
        }
    }
};
