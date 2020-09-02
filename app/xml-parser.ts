// mainly based on https://github.com/segmentio/xml-parser

export interface Document {
  declaration?: Declaration;
  root: Node;
}

export interface Declaration {
  attributes: Attributes;
}

export interface Node {
  name: string;
  attributes: Attributes;
  children: Node[];
  content?: string;
}

export interface Attributes {
  [name: string]: string;
}

export default class XMLParser {
  xml: string;

  constructor(xml: string) {
    this.xml = xml.trim();
  }

  parse(): Document {
    // strip comments
    this.xml = this.xml.trim().replace(/<!--[\s\S]*?-->/g, '');

    const declaration = this.declaration();
    // skip doctype
    this.match(/^<!DOCTYPE[^>]+>\s*/);
    const root = this.tag();
    return {
      declaration,
      root,
    }
  }

  declaration(): Declaration {
    const m = this.match(/^<\?xml\s*/);
    if (!m) return;

    // tag
    const node = {
      attributes: {}
    };

    // attributes
    while (!(this.eos() || this.is('?>'))) {
      const attr = this.attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    this.match(/\?>\s*/);

    return node;
  }

  tag(): Node {
    const m = this.match(/^<([\w-:.]+)\s*/);
    if (!m) return;

    // name
    const node: Node = {
      name: m[1],
      attributes: {},
      children: []
    };

    // attributes
    while (!(this.eos() || this.is('>') || this.is('?>') || this.is('/>'))) {
      const attr = this.attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    // self closing tag
    if (this.match(/^\s*\/>\s*/)) {
      return node;
    }

    this.match(/\??>\s*/);

    // content
    node.content = this.content();

    // children
    let child: Node;
    while (child = this.tag()) {
      node.children.push(child);
    }

    // closing
    this.match(/^<\/[\w-:.]+>\s*/);

    return node;
  }

  content() {
    const n = this.match(/^<!\[CDATA\[([\s\S]*?)]]>\s*/);
    if (n) return n[1];
    const m = this.match(/^([^<]*)/);
    if (m) return m[1];
    return '';
  }

  attribute(): Attributes {
    var m = this.match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
    if (!m) return;
    return { name: m[1], value: this.strip(m[2]) }
  }

  /**
   * Strip quotes from `val`.
   */
  strip(val: string) {
    return val.replace(/^['"]|['"]$/g, '');
  }

  match(re: RegExp) {
    const m = this.xml.match(re);
    if (!m) return;
    this.xml = this.xml.slice(m[0].length);
    return m;
  }

  eos() {
    return 0 === this.xml.length;
  }

  is(prefix: string) {
    return 0 === this.xml.indexOf(prefix);
  }
}
