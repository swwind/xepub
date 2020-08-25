# Xepub

Xepub is a ~~lightweight~~ cross-platform epub reader written in NodeJS, which need a modern browser like *Google Chrome* or *Firefox* or *Electron*.

It can also open a comic directory as a comic reader.

## Install

Get the stable release:

```bash
npm install -g xepub
```

Get the newest version:

```bash
git clone https://github.com/swwind/xepub
cd xepub
npm install
npm link
```

## Usage

```bash
xepub book.epub    # open in browser
xepub -e book.epub # open in electron
xepub erohon/      # open a folder
```

Use `xepub --help` for more infomation.

## Development

```bash
git clone https://github.com/swwind/xepub
cd xepub
yarn && yarn link
yarn dev
```

## TODOs

- (bug) Materialize CSS infects book style.
- (feature) Remember last read position.
