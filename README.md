# Xepub

![](https://github.com/swwind/xepub/workflows/CI/badge.svg?branch=master&event=push)

**~~Still WIP.~~**

**\[Deprecated\] It is painful to maintain such application with deno. Deno community needs more powerful tools.**

Xepub is a lightweight cross-platform epub reader written in Deno.
Read epub book in your favorite browser(or in webview).

Thanks to these open-source projects:

- [denoland/deno](https://github.com/denoland/deno)
- [segmentio/xml-parser](https://github.com/segmentio/xml-parser)
- [webview/webview_deno](https://github.com/webview/webview_deno)
- [oakserver/oak](https://github.com/oakserver/oak)

## Install

You need to install `deno` and `unzip` first.

```bash
git clone https://github.com/swwind/xepub && cd xepub
deno install -A --unstable ./xepub.ts
```

## Usage

```bash
$ xepub book.epub --browser   # read book in browser
$ xepub book.epub             # read book in webview
```

For more infomation, use `xepub --help`
