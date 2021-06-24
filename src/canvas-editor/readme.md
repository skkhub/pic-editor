# 可能用到的api
- utils.toDataURL(canvasEL, format: String<'jpeg', 'png'>, quality<0-1>): dataURL
- utils.getSvgAttributes(type)
- utils.request(url, optionsopt)
# 兼容性说明
## 文本
- 文本用到了FontFace API，其不支持IE11及一下（等于IE全系不支持）
