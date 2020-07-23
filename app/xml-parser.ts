// copy from https://github.com/segmentio/xml-parser/blob/master/index.js

export interface Declaration {
  attributes: {
    [key: string]: string;
  };
}

export interface XMLTag {
  name: string;
  attributes: {
    [key: string]: string;
  };
  children: XMLTag[];
  content: string;
}

export interface XMLObject {
  declaration: Declaration;
  root?: XMLTag;
}

interface Attribute {
  name: string;
  value: string;
}

/**
 * Strip quotes from `val`.
 */

function strip(val: string): string {
  return val.replace(/^['"]|['"]$/g, "");
}

export default class XMLParser {
  private xml: string = "";

  /**
   * end of source
   */
  private eos(): boolean {
    return 0 == this.xml.length;
  }

  /**
   * Check for `prefix`.
   */
  private is(prefix: string): boolean {
    return 0 == this.xml.indexOf(prefix);
  }

  /**
   * Match `re` and advance the string.
   */
  private match(re: RegExp): RegExpMatchArray | null {
    var m = this.xml.match(re);
    if (!m) return null;
    this.xml = this.xml.slice(m[0].length);
    return m;
  }

  /**
   * Attribute.
   */
  private attribute(): Attribute | null {
    var m = this.match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
    if (!m) return null;
    return { name: m[1], value: strip(m[2]) };
  }

  /**
   * Declaration.
   */
  private declaration(): Declaration {
    var m = this.match(/^<\?xml\s*/);

    // tag
    var node: Declaration = {
      attributes: {},
    };

    if (!m) return node;

    // attributes
    while (!(this.eos() || this.is("?>"))) {
      var attr = this.attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    this.match(/\?>\s*/);

    return node;
  }

  /**
   * Text content.
   */
  private content(): string {
    var m = this.match(/^([^<]*)/);
    if (m) return m[1];
    return "";
  }

  /**
   * Tag.
   */
  private tag(): XMLTag | undefined {
    var m = this.match(/^<([\w-:.]+)\s*/);
    if (!m) return;

    // name
    var node: XMLTag = {
      name: m[1],
      attributes: {},
      children: [],
      content: "",
    };

    // attributes
    while (!(this.eos() || this.is(">") || this.is("?>") || this.is("/>"))) {
      var attr = this.attribute();
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
    var child;
    while (child = this.tag()) {
      node.children.push(child);
    }

    // closing
    this.match(/^<\/[\w-:.]+>\s*/);

    return node;
  }

  /**
   * parse the object
   */
  parse(xml: string): XMLObject {
    this.xml = xml.trim()
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<!DOCTYPE[\s\S]*?>/g, "");

    const declaration = this.declaration();
    const root = this.tag();
    if (root) {
      return { declaration, root };
    } else {
      return { declaration };
    }
  }
}
