# Xepub

Xepub is a lightweight cross-platform epub reader written in NodeJS, which need a modern browser like *Google Chrome* or *Firefox*.

It opens a http service so as to deliver contents to browser.

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

Available options:

name              | default | usage
----------------- | ------- | ---------------------------
`-p`, `--port`    | 23333   | http port
`-6`, `--ipv6`    |         | use ipv6 (fake)
`-o`, `--open`    |         | open browser automaticly
`-h`, `--help`    |         | show help document and exit
`-v`, `--version` |         | show xepub version and exit
