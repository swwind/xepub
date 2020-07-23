import { Epub } from "../epub-parser.ts";
import { Application, send } from "../../deps.ts";

self.onmessage = async (e) => {
  await serveBook(e.data.port, e.data.root, e.data.epub);
  self.postMessage("closed");
  setTimeout(() => self.close());
};

const serveBook = async (port: number, root: string, epub: Epub) => {
  const app = new Application();
  app.use(async (context) => {
    await send(context, context.request.url.pathname, { root });
  });
  await app.listen({ port });
};

self.postMessage("launched");
