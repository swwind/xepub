xepub
=====

A lightweight epub reader.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/xepub.svg)](https://npmjs.org/package/xepub)
[![Downloads/week](https://img.shields.io/npm/dw/xepub.svg)](https://npmjs.org/package/xepub)
[![License](https://img.shields.io/npm/l/xepub.svg)](https://github.com/swwind/xepub/blob/master/package.json)

## Usage

```bash
npm install xepub -g
xepub novel.epub
```

This will open `http://localhost:15635` by default.

If your 15635 port is occupied, it can automatically choose 15636 port, etc.

If you want to open a specific port, use `-p, --port` flag.

```bash
xepub novel.epub -p 23333
```

## Feature

- Cleanest user interface.
- Automatically save reading progress.
- Automatically camouflage title as other websites.

## License

MIT


