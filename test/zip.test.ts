import { assertThrowsAsync } from "./deps.ts";
import { Zip } from "../app/zip.ts";

Deno.test("Zip read without initialize", () => {
  assertThrowsAsync(async () => {
    const zip = new Zip();
    (await zip.readAsText("hello.txt")).unwrap();
  });
});
