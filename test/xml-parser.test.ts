import { assertEquals } from "./deps.ts";
import XMLParser from "../app/xml-parser.ts";

const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns="urn:enterprise.soap.sforce.com">
  <soapenv:Body>
      <createResponse>
        <result>
            <id>003D000000OY9omIAD</id>
            <success>true</success>
        </result>
        <result>
            <id>001D000000HTK3aIAH</id>
            <success>true</success>
        </result>
      </createResponse>
  </soapenv:Body>
</soapenv:Envelope>
`;

const result1 = {
  declaration: { attributes: { version: "1.0", encoding: "utf-8" } },
  root: {
    name: "soapenv:Envelope",
    attributes: {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      xmlns: "urn:enterprise.soap.sforce.com",
    },
    children: [
      {
        name: "soapenv:Body",
        attributes: {},
        children: [
          {
            name: "createResponse",
            attributes: {},
            children: [
              {
                name: "result",
                attributes: {},
                children: [
                  {
                    name: "id",
                    attributes: {},
                    children: [],
                    content: "003D000000OY9omIAD",
                  },
                  {
                    name: "success",
                    attributes: {},
                    children: [],
                    content: "true",
                  },
                ],
                content: "",
              },
              {
                name: "result",
                attributes: {},
                children: [
                  {
                    name: "id",
                    attributes: {},
                    children: [],
                    content: "001D000000HTK3aIAH",
                  },
                  {
                    name: "success",
                    attributes: {},
                    children: [],
                    content: "true",
                  },
                ],
                content: "",
              },
            ],
            content: "",
          },
        ],
        content: "",
      },
    ],
    content: "",
  },
};

const xml2 = `
<?xml version="1.0" encoding="utf-8"?>
`;
const result2 = {
  declaration: { attributes: { version: "1.0", encoding: "utf-8" } },
};

Deno.test("XML Parser", (): void => {
  const parser = new XMLParser();
  assertEquals(parser.parse(xml1), result1);
  assertEquals(parser.parse(xml2), result2);
});
