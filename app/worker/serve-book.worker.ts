import { Epub } from "../epub-parser.ts";
import { Application, send, path } from "../../deps.ts";
import VERSION from '../../version.ts';

self.onmessage = async (e) => {
  await serveBook(e.data.port, e.data.root, e.data.epub);
  self.postMessage("closed");
  setTimeout(() => self.close());
};

const publicRoot = new URL('../../public', import.meta.url).href.slice(7);

const serveBook = async (port: number, root: string, epub: Epub) => {
  const app = new Application();
  app.use(async (ctx, next) => {
    if (ctx.request.url.pathname === '/api/epub') {
      ctx.response.status = 200;
      ctx.response.type = 'json';
      ctx.response.body = JSON.stringify(epub);
    } else if (ctx.request.url.pathname === '/api/version') {
      ctx.response.status = 200;
      ctx.response.type = 'txt';
      ctx.response.body = VERSION;
    } else {
      await next();
    }
  });
  app.use(async (ctx, next) => {
    try {
      await send(ctx, ctx.request.url.pathname, {
        root: publicRoot,
        index: 'index.html'
      });
    } catch (e) { } // ignore error
    if (ctx.response.status === 404) {
      await next();
    }
  });
  app.use(async (ctx) => {
    await send(ctx, ctx.request.url.pathname, { root });
  });
  await app.listen({ port });
};

self.postMessage("launched");
