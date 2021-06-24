// import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
const buildPath = require('./paths').appBuild;

export default {
    input: [buildPath + '/js/react.editor.js', buildPath + '/js/core.editor.js', buildPath + '/js/main.js'],
    output: {
        dir: buildPath + '/es',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [
        // resolve(), // 不能开启这个，否则会对引入对应本来不想加入到包的内容，比如会把react引入到react.editor.js文件里
        commonjs(), // 转换到ES modules
        terser() // minify
    ]
};
