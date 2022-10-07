import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs, createReadStream } from "fs";
import path, { format } from "path";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import XMLFormatter from "xml-formatter";
import formidable, { File } from "formidable";

/* Don't miss that! */
export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedFiles = Array<[string, File]>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let status = 200,
    resultBody = { status: "ok", message: "Files were uploaded successfully" };
  const files = await new Promise<ProcessedFiles | undefined>(
    (resolve, reject) => {
      const form = new formidable.IncomingForm();
      const files: ProcessedFiles = [];
      form.on("file", function (field, file) {
        files.push([field, file]);
      });
      form.on("end", () => resolve(files));
      form.on("error", (err) => reject(err));
      form.parse(req);
    }
  ).catch((e) => {
    console.log(e);
    status = 500;
    resultBody = {
      status: "fail",
      message: "Upload error",
    };
  });
  if (files?.length) {
    for (let file of files) {
      if (file[1].mimetype === "text/xml") {
        const xml = await fs.readFile(file[1].filepath, "utf8");
        const parser = new XMLParser({
          ignoreDeclaration: true,
          transformTagName: (tagName) => tagName.toLowerCase(),
          tagValueProcessor(
            tagName,
            tagValue,
            jPath,
            hasAttributes,
            isLeafNode
          ) {
            return tagValue.trim().replace(/\n+/g, "\n");
          },
        });
        const result = parser.parse(xml);
        const builder = new XMLBuilder({});
        const xml2 = builder.build(result);
        const formatted = XMLFormatter(xml2, {});
        res.setHeader("Content-Type", "text/xml");
        res.status(200).send(formatted);
      }
    }
  }
};

export default handler;
