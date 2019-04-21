# Xepub

Xepub is a ~~lightweight~~ cross-platform epub reader written in NodeJS, which need a modern browser like *Google Chrome* or *Firefox*.

It opens a http(or https) server so as to deliver contents to browser.

## Install

```bash
npm install -g xepub
# or
yarn global add xepub
```

## Usage

```bash
xepub [options] mybook.epub
```

> **If you want to enable HTTPS in localhost:**
> 
> ```bash
> xepub --gencert
> ```
> 
> **Then add root CA to your system.**

For more infomations, use `xepub --help`

