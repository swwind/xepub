export default `xepub - a lightweight epub reader

Also a comic reader, just put all images in one folder.

USAGE

  $ xepub [options] <file|folder>

  Available options:

  -p, --port               http port (default 23333, random if electron)
  -o, --open               open browser automaticly
  -e, --electron           open electron automaticly
  -h, --help               show help document and exit
  -v, --version            show xepub version and exit
      --debug              show debug messages

EXAMPLE

  $ xepub erohon.epub
  $ xepub -e erohon.epub
  $ xepub erohon/

CONTRIBUTOR

  - swwind <swwind233@gmail.com>

`;
