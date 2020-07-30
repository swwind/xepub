const map = {
  linux: "xdg-open",
  darwin: "open",
  windows: "start",
};

export const openExternalLink = (url: string) => {
  return Deno.run({
    cmd: [map[Deno.build.os], url],
  });
};
