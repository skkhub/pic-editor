/**
* @file font-list
* @author sunkeke
* @date 2021-03-01
*/

function loadFrames(context) {
    const frames = [];
    context.keys().forEach(k => {
        frames.push({
            name: 'ce-' + k.slice(2, -4),
            url: context(k).default
        });
    });
    return frames;
}
const context = require.context('@/assets/fonts', false, /\.ttf|\.otf|\.TTF$/i);
const contextImg = require.context('@/assets/fonts', false, /\.png$/i);
const fontList = loadFrames(context);
const fontImgList = loadFrames(contextImg);

// fontList.push({
//     name: 'test-family',
//     img: 'http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071012.png',
//     url: 'http://copyright.bdstatic.com/material/f8b55c9653b13b81db45b42a483615697b653d14.ttf'
// });

for (let obj of fontList) {
    const img = fontImgList.find(item => obj.name === item.name);
    obj.img = img && img.url;
}
let fontListGroup = [];
for (let i = 0, len = fontList.length; i < len; i += 12) {
    fontListGroup.push(fontList.slice(i, i + 12));
}

const styleList = [
    {
        img: require('@/assets/font-style/T0.svg').default,
        rules: {
            fill: '#FF7E7E',
            stroke: '',
        }
    },
    {
        img: require('@/assets/font-style/T1.svg').default,
        rules: {
            fill: "#FF4343",
            stroke: '',
        }
    },
    {
        img: require('@/assets/font-style/T2.svg').default,
        rules: {
            fill: "#FFFFFF",
            stroke: "#D17EFF"
        }
    },
    {
        img: require('@/assets/font-style/T3.svg').default,
        rules: {
            fill: "#FFFFFF",
            stroke: "#000000"
        }
    },
    {
        img: require('@/assets/font-style/T4.svg').default,
        rules: {
            fill: "#D17EFF",
            stroke: ''
        }
    },
    {
        img: require('@/assets/font-style/T5.svg').default,
        rules: {
            fill: '#FF7ED5',
            stroke: ''
        }
    },
    {
        img: require('@/assets/font-style/T6.svg').default,
        rules: {
            fill: "#000000",
            stroke: "#FFFFFF"
        }
    },
    {
        img: require('@/assets/font-style/T7.svg').default,
        rules: {
            fill: '#4D3DE8',
            stroke: ''
        }
    },
    {
        img: require('@/assets/font-style/T8.svg').default,
        rules: {
            fill: '#3DE8D6',
            stroke: ''
        }
    },
    {
        img: require('@/assets/font-style/T9.svg').default,
        rules: {
            fill: '#E0612C',
            // stroke: ''
        }
    },
    {
        img: require('@/assets/font-style/T10.svg').default,
        rules: {
            fill: "#FFFFFF",
            stroke: "#FFCF33"
        }
    },
    {
        img: require('@/assets/font-style/T11.svg').default,
        rules: {
            fill: '',
            stroke: "#E0612C"
        }
    },
    {
        img: require('@/assets/font-style/T12.svg').default,
        rules: {
            fill: '',
            stroke: "#FF4343"
        }
    },
    {
        img: require('@/assets/font-style/T13.svg').default,
        rules: {
            fill: '#FFCF33',
            stroke: ''
        }
    },
    {
        img: require('@/assets/font-style/T14.svg').default,
        rules: {
            fill: "#FFFFFF",
            stroke: "#3DE8D6"
        }
    },
];

let styleListGroup = [];
for (let i = 0, len = styleList.length; i < len; i += 15) {
    styleListGroup.push(styleList.slice(i, i + 15));
}
export {
    fontList,
    fontListGroup,
    styleList,
    styleListGroup
};

