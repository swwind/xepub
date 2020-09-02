import { exec } from "child_process";
import { error } from "./alert";

const map = {
  linux: "xdg-open",
  darwin: "open",
  win32: "start",
}

export const openExternalLink = (url: string) => {
  const command = map[process.platform];

  if (!command) {
    error('Error: --open');
    error('  Xepub does not support your platform,');
    error('  please open the link by your self.');
    return;
  }

  return exec(`${command} ${url}`);
}
