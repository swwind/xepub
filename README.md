# Xepub

**This branch has been archived**

Xepub is a ~~lightweight~~ cross-platform epub reader written in NodeJS, which need a modern browser like *Google Chrome* or *Firefox*.

It can also open a comic directory as a comic reader.

See its UI here: [Online Demo](https://hk.swwind.me:23333)

It opens a http(or https) server so as to deliver contents to browser.

## Install

```bash
# if you use npm
npm install -g xepub
# if you use yarn (recommand)
yarn global add xepub
# install the latest version
yarn global add xepub@alpha
```

## Usage

```bash
# open a .epub file
xepub [options] mybook.epub
# open a comic directory
xepub [options] dirname/
```

> **If you want to enable HTTPS in localhost(~~although this is useless~~):**
> 
> ```bash
> xepub --gencert
> ```
> 
> **Then add root CA to your system.**

For more usage and infomations, use `xepub --help`

## Development

```bash
git clone https://github.com/swwind/xepub
cd xepub
yarn link
yarn dev
```
