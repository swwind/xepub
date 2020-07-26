import { path } from "../deps.ts";
import * as alert from "./alert.ts";
import { Zip } from "./zip.ts";
import { OptionMap } from "./utils.ts";
import { XMLTag } from "./xml-parser.ts";

export interface NavPoint {
  label: string;
  src: string;
  children: NavPoint[];
}
export type NavMap = NavPoint[];
export interface Epub {
  metadata: {
    // required
    title: string;
    language: string;
    identifier: string;

    // optional
    creator?: string;
    contributor?: string;
    subject?: string;
    description?: string;
    date?: string;
    type?: string;
    format?: string;
    source?: string;
    relation?: string;
    coverage?: string;
    rights?: string;
  };
  manifest: OptionMap<string>;
  spine: string[];
  docTitle: string;
  docAuthor: string;
  navMap: NavMap;
}

const joinPath = (absolute: string, filename: string) => {
  if (!absolute || !filename) {
    alert.unstable();
  }
  return path.join(
    path.dirname(absolute),
    filename.replace(/\\/g, "/"),
  );
};

export const parseEpub = async (zip: Zip): Promise<Epub> => {
  const metainf = (await zip.readAsXML("META-INF/container.xml")).unwrap(
    "metainf not found",
  );

  const rootfile = metainf
    .$("container", "rootfiles", "rootfile")
    .append((t) => t.attributes["full-path"])
    .unwrap("rootfile not found");
  alert.debug("rootfile found");

  const content = (await zip.readAsXML(rootfile)).unwrap("rootfile is invalid");

  const getMetadata = (name: string) => {
    return content.$("package", "metadata", "dc:" + name)
      .append((x) => x.content)
      .unwrapOr("");
  };

  const metadata = {
    // required
    title: getMetadata("title"),
    language: getMetadata("language"),
    identifier: getMetadata("identifier"),

    // optional
    creator: getMetadata("creator"),
    contributor: getMetadata("contributor"),
    subject: getMetadata("subject"),
    description: getMetadata("description"),
    date: getMetadata("date"),
    type: getMetadata("type"),
    format: getMetadata("format"),
    source: getMetadata("source"),
    relation: getMetadata("relation"),
    coverage: getMetadata("coverage"),
    rights: getMetadata("rights"),
  };
  alert.debug("metadata is ok");

  const manifest = new OptionMap<string>();

  const items = content.$$("package", "manifest", "item").unwrap(
    "manifest not found",
  );
  for (const item of items) {
    const url = decodeURIComponent(
      joinPath(rootfile, item.attributes.href),
    );
    manifest.set(item.attributes.id, url);
  }
  alert.debug("manifest is ok");

  const spine = content.$$("package", "spine", "itemref")
    .unwrap("spine not found")
    .map((itemref) => {
      const result = manifest.get(itemref.attributes.idref);
      if (result.isNone()) {
        alert.unstable();
      }
      return result.unwrapOr("");
    });
  alert.debug("spine is ok");

  const tocfilename = manifest.get("ncx").unwrap("tocfile not found");
  const toc = (await zip.readAsXML(tocfilename)).unwrap("tocfile invalid");

  const docTitle = toc.$("ncx", "docTitle", "text").append((x) => x.content)
    .unwrapOr("");
  const docAuthor = toc.$("ncx", "docAuthor", "text").append((x) => x.content)
    .unwrapOr("");

  alert.debug("docTitle = " + docTitle);
  alert.debug("docAuthor = " + docAuthor);

  const handleNavPoint = (navPoint: XMLTag): NavPoint => {
    const result: NavPoint = {
      label: "",
      src: "",
      children: [],
    };

    for (const elem of navPoint.children) {
      if (elem.name === "navLabel" && elem.children[0]?.name === "text") {
        result.label = elem.children[0]?.content;
      }
      if (elem.name === "content") {
        result.src = joinPath(tocfilename, elem.attributes.src);
      }
      if (elem.name === "navPoint") {
        result.children.push(handleNavPoint(elem));
      }
    }

    return result;
  };

  const navMap = toc.$$("ncx", "navMap", "navPoint")
    .unwrap("navPoint not found")
    .map(handleNavPoint);

  alert.debug("navMap is ok");

  return {
    metadata,
    manifest,
    spine,
    docTitle,
    docAuthor,
    navMap,
  };
};
