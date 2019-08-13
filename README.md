# conv-mod

[English Documentation](./README.en.md)

把 JavaScript 模块从 AMD 或 CommonJs 规范转化为 ES6 规范.

## 快速开始

安装:

```
npm install conv-mod -g
```

使用:

```
conv-mod [options] <dir> [extraDirs...]
```

## 参数

- `-f, --filter <filter>`: 查询某个字符串，过滤文件
- `-r, --regular`: 当查询某个字符串，过滤文件时，把查询字符串当作正则匹配
- `--amd`: 转化 AMD 模块
- `--cjs`: 转化 CommonJs 模块

## 暂时不支持的转换格式

```
const a = require('a').default;
const {a, b} = require('a');
const a, {b, c} = require('a');
```
