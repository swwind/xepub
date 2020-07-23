import { None, Some, Option } from "./utils.ts";

import XMLParser, { XMLTag, XMLObject } from "./xml-parser.ts";

export interface XMLQuery {
  xml: XMLObject;
  $(...path: string[]): Option<XMLTag>;
  $$(...path: string[]): Option<XMLTag[]>;
}

const xmlparser = new XMLParser();

/**
 * Request for a value in an XMLObject safely
 * 
 * e.g.
 *  x.$("root", "foo") => <root><foo>result</foo></root>
 *  x.$$("root", "foo") => <root><foo>1</foo><foo>2</foo></root>
 */
export const parseXML = (xmlContent: string): XMLQuery => {
  const xml = xmlparser.parse(xmlContent);

  return {
    xml,
    "$": (...path: string[]): Option<XMLTag> => {
      if (path[0] !== xml.root?.name) {
        return new None();
      }
      const dfs = (xml: XMLTag, depth: number): Option<XMLTag> => {
        const ask = path[depth];
        if (!ask) {
          return new Some(xml);
        }
        for (const child of xml.children) {
          if (child.name === ask) {
            const result = dfs(child, depth + 1);
            if (!result.isNone()) {
              return result;
            }
          }
        }
        return new None();
      };
      return dfs(xml.root, 1);
    },

    "$$": (...path: string[]): Option<XMLTag[]> => {
      if (path[0] !== xml.root?.name) {
        return new None();
      }
      const res: XMLTag[] = [];
      const dfs = (xml: XMLTag, depth: number): void => {
        const ask = path[depth];
        if (!ask) {
          res.push(xml);
          return;
        }
        for (const child of xml.children) {
          if (child.name === ask) {
            dfs(child, depth + 1);
          }
        }
      };
      dfs(xml.root, 1);
      if (res.length > 0) {
        return new Some(res);
      } else {
        return new None();
      }
    },
  };
};
