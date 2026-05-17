import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import fs from "node:fs";

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  sections: [{
    properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Jane Doe", font: "Calibri", size: 36, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "San Francisco, CA  |  (555) 123-4567  |  jane.doe@example.com", font: "Calibri", size: 22 })] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "PROFESSIONAL SUMMARY", font: "Calibri", size: 28, bold: true })] }),
      new Paragraph({ children: [new TextRun({ text: "Test summary.", font: "Calibri", size: 22 })] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "WORK EXPERIENCE", font: "Calibri", size: 28, bold: true })] }),
      new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Owned the payments backend.", font: "Calibri", size: 22 })] }),
    ],
  }],
});
const buf = await Packer.toBuffer(doc);
fs.writeFileSync("/tmp/test-output.docx", buf);
console.log("size=", buf.length);
