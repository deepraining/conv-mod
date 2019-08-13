# conv-mod

[中文文档](./README.md)

Convert JavaScript module from AMD or CommonJs to ES6.

## quick start

Install:

```
npm install conv-mod -g
```

Usage:

```
conv-mod [options] <dir> [extraDirs...]
```

## options

- `-f, --filter <filter>`: a query string to filter files
- `-r, --regular`: regard query string as regular expression to filter files
- `--amd`: convert AMD modules
- `--cjs`: convert CommonJs modules

## currently can not convert

```
const a = require('a').default;
const {a, b} = require('a');
const a, {b, c} = require('a');
```
