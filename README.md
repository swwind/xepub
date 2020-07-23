# Xepub

![](https://github.com/swwind/xepub/workflows/CI/badge.svg?branch=master&event=push)

Xepub is a lightweight cross-platform epub reader written in Deno. **Still WIP.**

Thanks to these open-source projects:

- [denoland/deno](https://github.com/denoland/deno)
- [segmentio/xml-parser](https://github.com/segmentio/xml-parser)
- [webview/webview_deno](https://github.com/webview/webview_deno)
- [oakserver/oak](https://github.com/oakserver/oak)

## Install

You need to install `deno`, `unzip` and `webkit2gtk` first.

```bash
deno install -A ./xepub.ts
```

## Usage

```bash
$ xepub book.epub
```

For more infomation, use `xepub --help`
