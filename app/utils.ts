import { KeyMap } from "./types";

export abstract class Option<T> {
  abstract unwrap(errorMessage?: string): T;
  abstract unwrapOr(t: T): T;
  abstract append<R>(f: (t: T) => R): Option<R>;
}

export class None<T> extends Option<T> {
  unwrap(msg?: string): T { throw new Error(msg ?? "unwrap None"); }
  unwrapOr(t: T) { return t; }
  append<R>(): Option<R> { return new None(); }
}

export class Some<T> extends Option<T> {
  private value: T;
  constructor(t: T) { super(); this.value = t; }
  unwrap() { return this.value; }
  unwrapOr() { return this.value; }
  append<R>(f: (t: T) => R): Option<R> { return new Some(f(this.value)); }
}

export class OptionMap<V> {
  private map: KeyMap<V> = { };
  get(key: string): Option<V> {
    const v = this.map[key];
    return typeof v === 'undefined'
      ? new None()
      : new Some(v);
  }
  set(key: string, value: V) {
    this.map[key] = value;
  }
  toObject() {
    return this.map;
  }
}
