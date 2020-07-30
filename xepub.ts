import { parse } from "./deps.ts";
import { parseEpub } from "./app/epub-parser.ts";
import { Zip } from "./app/zip.ts";
import { debug, info } from "./app/alert.ts";
import helpText from "./app/help.ts";
import { serveBook, openWindow } from "./app/worker/worker.ts";
import { openExternalLink } from "./app/open.ts";
import VERSION from "./version.ts";
import { listenWs } from "./app/ws.ts";

const parseArgs = parse(Deno.args, {
  boolean: [
    "debug",
    "help",
    "version",
    "browser",
  ],
});

debug(parseArgs.debug as boolean);

if (parseArgs.version) {
  console.log(`Xepub ${VERSION}`);
  Deno.exit(0);
}

if (parseArgs.help) {
  console.log(helpText);
  Deno.exit(0);
}

if (!parseArgs._.length) {
  console.log(helpText);
  Deno.exit(1);
}

const book = parseArgs._[0];
info("Reading file: " + book);
const zip = new Zip();
await zip.initialize(book.toString());
const epub = await parseEpub(zip);

// create http server
const worker = await serveBook(3000, zip.dir, epub);

const safeQuit = async () => {
  worker.terminate();
  await zip.clear();
  info("Safely terminated");
  Deno.exit(0);
};

if (parseArgs.browser) {
  info("Opening http://localhost:3000");
  listenWs(8080, safeQuit);
  openExternalLink("http://localhost:3000");
} else {
  info("Opening window...");
  await openWindow(
    "Xepub",
    "http://localhost:3000/",
    safeQuit,
  );
}

for await (const _ of Deno.signals.interrupt()) {
  safeQuit();
}
