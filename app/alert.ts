import { log } from "../deps.ts";

export const critical = log.critical;
export const warning = log.warning;
export const info = log.info;
export const error = log.error;

const flags = {
  unstable: false,
  broken: false,
  debug: false,
};

export const debug = (t: boolean | string) => {
  if (typeof t === "boolean") {
    flags.debug = t;
  } else if (flags.debug) {
    log.info("[DEBUG] " + t);
  }
};

export const unstable = () => {
  if (!flags.unstable) {
    flags.unstable = true;
    log.warning("Working in unstable mode, something maybe weird");
  }
};

export const broken = () => {
  if (!flags.broken) {
    flags.broken = true;
    log.error("Working in broken mode, xepub may crash");
  }
};
