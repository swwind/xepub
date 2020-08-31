import { socket } from "./utils"
import { KeyMap, EpubInfo } from "../app/types"
import { loadUrl, getNowPage } from "./loader";
import { getPercent } from "./scrolling";

export interface ReadRecord {
  page: string;
  percent: number;
}

export const init = () => {
  socket.on('initialize', (epub: EpubInfo, _, record: KeyMap<ReadRecord>) => {
    const rec = record[epub.metadata.identifier];
    if (rec) {
      loadUrl(rec.page, rec.percent);
    } else {
      loadUrl(epub.spine[0]);
    }

    setInterval(() => {
      socket.remote('record-update', epub.metadata.identifier, getNowPage(), getPercent());
    }, 1000);
  });

}
