import { EventEmitter } from "events";

export class Socket extends EventEmitter {
  ws: WebSocket;
  url: string;
  connected: boolean = false;

  constructor(url: string) {
    super();
    this.url = url;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener('close', (e) => {
      this.emit('close', e);
    });
    this.ws.addEventListener('error', (e) => {
      this.emit('close', e);
    });
    this.ws.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      this.emit(data.event, ...data.args);
    });
    this.ws.addEventListener('open', (e) => {
      if (this.connected) {
        // reconnect, auto flush
        location.reload();
      }
      this.connected = true;
    });
  }

  remote(event: string, ...args: any[]) {
    this.ws.send(JSON.stringify({
      event, args
    }));
  }
}
