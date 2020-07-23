// This is for forking child process

import { Epub } from "../epub-parser.ts";

const createWorker = (
  url: string,
  data: { [key: string]: any },
  onclose?: Function,
): Promise<Worker> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(url, import.meta.url).href, {
      type: "module",
      deno: true,
    });
    worker.onmessage = (e) => {
      if (e.data === "launched") {
        worker.postMessage(data);
        resolve(worker);
      } else if (e.data === "closed") {
        onclose && onclose();
      }
    };
  });
};

export const serveBook = (
  port: number,
  root: string,
  epub: Epub,
  onclose?: Function,
): Promise<Worker> => {
  return createWorker("serve-book.worker.ts", {
    port,
    root,
    epub,
  }, onclose);
};

export const openWindow = (
  title: string,
  url: string,
  onclose?: Function,
): Promise<Worker> => {
  return createWorker("open-window.worker.ts", {
    title,
    url,
  }, onclose);
};
