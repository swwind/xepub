import { parseXML } from "./xml.ts";
import { Option, Some, None } from "./utils.ts";
import { path } from "../deps.ts";

export class Zip {
  dir: string = "";

  async initialize(zippath: string) {
    this.dir = await Deno.makeTempDir({ prefix: "xepub_" });
    const result = await Deno.run({
      cmd: ["unzip", "-q", zippath, "-d", this.dir],
    }).status();
    if (result.code) {
      throw new Error("file invalid");
    }
  }

  async readAsText(filepath: string): Promise<Option<string>> {
    if ("" === this.dir) {
      throw new Error("read zip uninitialized");
    }
    try {
      const result = await Deno.readTextFile(path.resolve(this.dir, filepath));
      return new Some(result);
    } catch (e) {
      return new None();
    }
  }

  async readAsXML(filepath: string) {
    return (await this.readAsText(filepath)).append(parseXML);
  }

  async clear() {
    await Deno.remove(this.dir, { recursive: true });
  }
}
