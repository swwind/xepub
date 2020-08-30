'use strict';

import * as url from 'url';
import { imageSize } from 'image-size';
import { Node } from 'xml-parser';
import * as alert from './alert';
import Zip from './zip';
import { EpubInfo, NavPoint, Size } from './types';
import { OptionMap, None } from './utils';

const resolvePath = (absolute: string, filename: string) => {
  return url.resolve(absolute,
    // fuck those epub creators
    filename.replace(/\\/g, '/'));
}

const getAttribute = (attr: string) => (a: Node) => {
  return a.attributes[attr];
}

const getContent = (a: Node) => {
  return a.content;
}

export default async (zip: Zip): Promise<EpubInfo> => {
  const metainf = (await zip.readAsXML("META-INF/container.xml")).unwrap(
    "metainf missing",
  );

  const rootfile = metainf
    .$("container", "rootfiles", "rootfile")
    .append(getAttribute('full-path'))
    .unwrap("rootfile missing");
  alert.debug(`rootfile: ${rootfile}`);

  const content = (await zip.readAsXML(rootfile)).unwrap("rootfile invalid");

  const getMetadata = (name: string) => {
    return content
      .$("package", "metadata", "dc:" + name)
      .append(getContent)
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
  const sizes = new OptionMap<Size>();

  const items = content
    .$$("package", "manifest", "item")
    .unwrap("manifest missing");
  for (const item of items) {
    const url = decodeURIComponent(resolvePath(rootfile, item.attributes.href));
    manifest.set(item.attributes.id, url);
    if (/\.(?:png|jpe?g|gif|webp)$/i.test(url)) {
      try {
        const buf = (await zip.readAsBuffer(url)).unwrap('File in manifest missing');
        sizes.set(url, imageSize(buf));
      } catch (e) {
        alert.unstable();
      }
    }
  }
  alert.debug("manifest is ok");

  const spine = content.$$("package", "spine", "itemref")
    .unwrap("spine missing")
    .map((itemref) => {
      const result = manifest.get(itemref.attributes.idref);
      if (result instanceof None) {
        alert.unstable();
      }
      return result.unwrapOr("");
    });
  alert.debug("spine is ok");

  const tocfilename = manifest.get("ncx").unwrap("tocfile missing");
  const toc = (await zip.readAsXML(tocfilename)).unwrap("tocfile invalid");

  const docTitle = toc.$("ncx", "docTitle", "text")
    .append(getContent).unwrapOr("");
  const docAuthor = toc.$("ncx", "docAuthor", "text")
    .append(getContent).unwrapOr("");

  alert.debug(`docTitle = ${docTitle}`);
  alert.debug(`docAuthor = ${docAuthor}`);

  const handleNavPoint = (navPoint: Node): NavPoint => {
    const result: NavPoint = {
      label: "",
      src: "",
      child: [],
    };

    for (const elem of navPoint.children) {
      if (elem.name === "navLabel" && elem.children[0]?.name === "text") {
        result.label = elem.children[0]?.content;
      }
      if (elem.name === "content") {
        result.src = resolvePath(tocfilename, elem.attributes.src);
      }
      if (elem.name === "navPoint") {
        result.child.push(handleNavPoint(elem));
      }
    }

    return result;
  };

  const navMap = toc.$$("ncx", "navMap", "navPoint")
    .unwrap("navPoint missing")
    .map(handleNavPoint);

  alert.debug("navMap is ok");

  return {
    metadata,
    manifest: manifest.toObject(),
    sizes: sizes.toObject(),
    spine,
    docTitle,
    docAuthor,
    navMap,
  };
};