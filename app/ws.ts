import {
  serve,
  acceptWebSocket,
  isWebSocketCloseEvent,
  WebSocket,
} from "../deps.ts";
import { info } from "./alert.ts";

async function handleWs(onclose: Function, sock: WebSocket) {
  info("ws connected!");
  for await (const ev of sock) {
    if (isWebSocketCloseEvent(ev)) {
      info("ws disconnected, browser closed");
      onclose();
    }
  }
}

export const listenWs = async (port: number, onclose: Function) => {
  info(`websocket server is running on :${port}`);
  for await (const req of serve(`:${port}`)) {
    acceptWebSocket({
      conn: req.conn,
      bufReader: req.r,
      bufWriter: req.w,
      headers: req.headers,
    }).then(handleWs.bind(null, onclose));
  }
};
