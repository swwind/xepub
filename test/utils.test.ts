import { assertEquals, assertThrows } from "./deps.ts";
import { Some, Option, None } from "../app/utils.ts";

const some: Option<string> = new Some("hello world");
const none: Option<string> = new None();

Deno.test("Option isNone", () => {
  assertEquals(some.isNone(), false);
  assertEquals(none.isNone(), true);
});

Deno.test("Option unwrap", () => {
  assertEquals(some.unwrap(), "hello world");
  assertThrows(() => none.unwrap());
  assertThrows(() => none.unwrap("errmsg"), Error, "errmsg");
});

Deno.test("Option unwrapOr", () => {
  assertEquals(some.unwrapOr("nothing"), "hello world");
  assertEquals(none.unwrapOr("nothing"), "nothing");
});

Deno.test("Option append", () => {
  assertEquals(some.append((x) => x.toUpperCase()).unwrap(), "HELLO WORLD");
  assertEquals(none.append((x) => x.toUpperCase()).isNone(), true);
});
