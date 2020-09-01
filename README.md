# Xepub

Xepub is a ~~lightweight~~ cross-platform(major linux) epub reader written in NodeJS, which need a modern browser like *Chrome*, *Firefox* or *Electron*.

It can also open a comic directory as a comic reader.

## Install

Get the stable release:

```bash
npm install -g xepub
```

Get the unstable version:

```bash
npm install -g xepub@alpha
```

Install as desktop application: (You need to install electron first)

```
% echo "
[Desktop Entry]
Name=Xepub
Comment=An epub reader
Exec=$(which xepub) -e %f
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

P.S. As a comic reader:

    .
    |
    +- erohon/
       |
       +- ep1/
       |  |
       |  +- 1.png
       |  +- 2.png
       |
       +- ep2/
       |  |
       |  +- 1.png
       |  +- 2.png
       |
       +- ep3/
          |
          +- 1.png
          +- 2.png

```bash
xepub erohon/      # read all episodes
xepub erohon/ep1/  # read ep1 only
```

## Development

```bash
git clone https://github.com/swwind/xepub
cd xepub
yarn && yarn link
yarn dev
```

## TODOs
