# Xepub

Xepub is a lightwight cross-platform epub reader written in NodeJS, which need a modern browser like *Google Chrome* or *Firefox*.

It opens a http service so as to diliver contents to browser.

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

Avaliable options:

name | default | usage
---- | ------- | ---------
`-p` | 23333   | http port
`-6` |         | use ipv6
`-o` |         | open browser automaticly
