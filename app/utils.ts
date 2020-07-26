export class None<T> {
  unwrap(errorMessage?: string): T {
    throw new Error(errorMessage ?? "unwrap None");
  }
  unwrapOr(t: T) {
    return t;
  }
  append<R>(f: (t: T) => R): Option<R> {
    return new None();
  }
  isNone() {
    return true;
  }
}

export class Some<T> {
  private value: T;
  constructor(t: T) {
    this.value = t;
  }
  unwrap(errorMessage?: string) {
    return this.value;
  }
  unwrapOr(t: T) {
    return this.value;
  }
  append<R>(f: (t: T) => R): Option<R> {
    return new Some(f(this.value));
  }
  isNone() {
    return false;
  }
}

export type Option<T> = Some<T> | None<T>;

export class OptionMap<V> {
  private map: { [key: string]: V | undefined } = {};
  get(key: string): Option<V> {
    const v = this.map[key];
    if (undefined === v) return new None();
    else return new Some(v);
  }
  set(key: string, value: V) {
    this.map[key] = value;
  }
}
