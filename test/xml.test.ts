import { parseXML, XMLQuery } from "../app/xml.ts";
import { assertEquals, assertThrows } from "./deps.ts";

const xml = `
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

let query: XMLQuery;

Deno.test("XML parser", () => {
  query = parseXML(xml);
});

Deno.test("XML query $", () => {
  assertEquals(
    query.$("soapenv:Envelope", "soapenv:Body").unwrap("nothing found"),
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
  );
});

Deno.test("XML query $$", () => {
  assertEquals(
    query.$$("soapenv:Envelope", "soapenv:Body", "createResponse", "result")
      .unwrap("nothing found"),
    [
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
  );
});

Deno.test("XML query nothing", () => {
  assertThrows(() => query.$("no", "path", "found").unwrap("error!!!"));
  assertThrows(() => query.$$("no", "path", "found").unwrap("error!!!"));
});
