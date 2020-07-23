import { parse } from "./deps.ts";
import { parseEpub } from "./app/epub-parser.ts";
import { Zip } from "./app/zip.ts";
import { debug, info } from "./app/alert.ts";
import helpText from "./app/help.ts";
import { serveBook, openWindow } from "./app/worker/worker.ts";

const parseArgs = parse(Deno.args, {
  boolean: [
    "debug",
    "help",
  ],
});

debug(parseArgs.debug as boolean);

if (parseArgs.help) {
  console.log(helpText);
  Deno.exit(0);
}

if (!parseArgs._.length) {
  console.log(helpText);
  Deno.exit(1);
}

for (const book of parseArgs._) {
  info("Reading file: " + book);
  const zip = new Zip();
  await zip.initialize(book.toString());
  const epub = await parseEpub(zip);

  // create http server
  const worker = await serveBook(3000, zip.dir, epub);

  info("Opening window...");

  await openWindow(
    "Xepub",
    "http://localhost:3000/" + epub.spine[0],
    async () => {
      worker.terminate();
      await zip.clear();
      info("Safely terminated");
    },
  );
}
