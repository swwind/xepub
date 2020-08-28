import { None, Some, Option } from "./utils";
import * as parse from "xml-parser";
import { Document, Node } from 'xml-parser';

export interface XMLQuery {
  xml: Document;
  $(...path: string[]): Option<Node>;
  $$(...path: string[]): Option<Node[]>;
}

/**
 * Request for a value in an XMLObject safely
 * 
 * e.g.
 *  x.$("root", "foo") => <root><foo>result</foo></root>
 *  x.$$("root", "foo") => <root><foo>1</foo><foo>2</foo></root>
 */
export const parseXML = (xmlContent: string): XMLQuery => {
  const xml = parse(xmlContent.replace(/<![\s\S]+?>/g, ''));

  return {
    xml,
    "$": (...path: string[]): Option<Node> => {
      if (path[0] !== xml.root?.name) {
        return new None();
      }
      const dfs = (xml: Node, depth: number): Option<Node> => {
        const ask = path[depth];
        if (!ask) {
          return new Some(xml);
        }
        for (const child of xml.children) {
          if (child.name === ask) {
            const result = dfs(child, depth + 1);
            if (result instanceof Some) {
              return result;
            }
          }
        }
        return new None();
      };
      return dfs(xml.root, 1);
    },

    "$$": (...path: string[]): Option<Node[]> => {
      if (path[0] !== xml.root?.name) {
        return new None();
      }
      const res: Node[] = [];
      const dfs = (xml: Node, depth: number): void => {
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