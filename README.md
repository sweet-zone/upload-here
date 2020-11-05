# upload here README

A VSCode plugin, right click here, short cut here, upload here!

![upload-here-3.gif](https://kaola-haitao.oss.kaolacdn.com/e423f20c-1881-44ad-90c6-263098979e88_1425x818.gif)

## Features

1. 使用快捷键（默认 shift + alt + p）或者鼠标右键，上传本地图片然后将上传结果插入到光标位置。
2. markdown 文件支持插入markdown 图片语法，对于写文档很便利。
3. 支持上传之前使用 tinypng 压缩，要使用此功能，需要首先配置 tinyPNG key，配置之后，如果图片为 png 或者 jpg格式则会使用 tinyPNG。具体见：https://tinypng.com/developers

## Extension Settings

使用该插件，首先需要配置图片上传接口地址：

`Code -> Preferences -> Settings`

该接口返回值需要满足如下格式：

```json
{
    "data": {
        "url": "https://xxxx.png"
    }
}
```

## Release Notes

### 2.1.1

支持 tinyPNG

### 1.0.0

正式发布了！

### 0.0.3

markdown 文件支持插入markdown 图片语法，对于写文档很便利。(已经用这个功能写 README 了！)

### 0.0.1

Initial release of upload here


**Enjoy!**
