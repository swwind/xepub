export default `
A lightweight cross-platform epub reader.

USAGE:
    xepub [OPTIONS] [FILENAME]...

OPTIONS:
    --debug       Print debug informations
    --help        Show this help
    --version     Show xepub version
    --browser     Run in browser mode

EXAMPLE:
    $ xepub book.epub             # read book in webview
    $ xepub book.epub --browser   # read book in browser
`;
