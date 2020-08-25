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

Install as desktop application(with electron installed):

```
% echo "
[Desktop Entry]
Name=Xepub
Comment=An epub reader
Exec=$(where xepub) -e %f
Terminal=false
Type=Application
Categories=Epub;Reader;
MimeType=application/epub+zip;
" | sudo tee /usr/share/applications/xepub.desktop
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

- (feature) Remember last read position.
- (feature) Settings
