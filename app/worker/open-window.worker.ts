import { WebView } from "../../deps.ts";

self.onmessage = async (e) => {
  await openWindow(e.data.title, e.data.url);
  self.postMessage("closed");
  setTimeout(() => self.close());
};

const openWindow = async (title: string, url: string) => {
  const window = new WebView({
    title,
    url,
    height: 720,
    width: 1280,
    resizable: true,
  });
  await window.run();
};

self.postMessage("launched");
