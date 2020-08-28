import * as WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';
import { EpubInfo } from './types';
import * as csstree from 'css-tree';
import { resolve } from 'url';
import { debug } from './alert';

export class Socket extends EventEmitter {
  ws: WebSocket;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;

    ws.on('message', (data) => {
      if (typeof data === 'string') {
        const res = JSON.parse(data);
        this.emit(res.event, ...res.args);
      }
    });

    ws.on('close', () => {
      this.emit('close');
    });
  }
  
  remote(event: string, ...args: any[]) {
    this.ws.send(JSON.stringify({ event, args }));
  }
}

export const bindSocket = (server: HTTPServer, epub: EpubInfo) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const socket = new Socket(ws);
    debug(`New connection from ${req.socket.remoteAddress}`);

    socket.remote('initialize', epub);
    socket.on('css', (url, css) => {
      const ast = csstree.parse(css);
      csstree.walk(ast, (node) => {
        if (node.type === 'Selector') {
          node.children.prependData({
            type: 'WhiteSpace',
            loc: null,
            value: ' '
          });
          node.children.prependData({
            type: 'ClassSelector',
            name: 'fake-body'
          });
        }
        if (node.type === 'Url') {
          // from another place
          const value = node.value.value.startsWith('"') && node.value.value.endsWith('"')
                     || node.value.value.startsWith("'") && node.value.value.endsWith("'")
                      ? node.value.value.slice(1, -1)
                      : node.value.value;
          if (!/^[a-zA-Z]+:\/\//gi.test(value)) {
            node.value.value = resolve(url, value);
          }
        }
      });
      const res = csstree.generate(ast);
      socket.remote('css', res);
    });

    socket.on('close', () => {
      debug('Connection closed');
    });
  });
}
