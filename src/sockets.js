'use strict';

class EventEmitter {
  constructor() {
    this.event = {};
  }
}

module.exports = (ws) => {

  const event = {};

  const on = (type, fn) => {
    event[type] = fn;
  }
  const emit = (type, ...args) => {
    event[type] && event[type](...(args || []));
  }

  ws.on('message', (data) => {
    const obj = JSON.parse(data);
    emit(obj.type, ...obj.args);
  });

  const remote = (type, ...args) => {
    args = args || [];
    ws.send(JSON.stringify({ type, args }));
  }

  return { on, emit, remote };

}

