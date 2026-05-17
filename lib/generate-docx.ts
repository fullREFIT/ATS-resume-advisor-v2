"use client";

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  type IRunOptions,
} from "docx";
import type { TailoredOutput } from "./types";

interface BuildArgs {
  tailored: TailoredOutput;
}

const FONT = "Calibri";
const BODY_PT = 11;
const HEADING_PT = 14;
const NAME_PT = 18;

function bodyRun(text: string, opts: Partial<IRunOptions> = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: BODY_PT * 2,
    ...opts,
  });
}

function headingPara(text: string) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: HEADING_PT * 2,
        bold: true,
      }),
    ],
    heading: HeadingLevel.HEADING_2,
  });
}

function roleHeaderPara(company: string, title: string, location?: string) {
  const left = `${company} — ${title}`;
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [
      bodyRun(left, { bold: true }),
      ...(location ? [bodyRun(`  |  ${location}`)] : []),
    ],
  });
}

function roleDatesPara(dates: string) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [bodyRun(dates, { italics: false })],
  });
}

function bulletPara(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [bodyRun(text)],
  });
}

export function suggestFileName(name: string): string {
  const safe = (name || "Candidate").replace(/[^A-Za-z\s-]/g, "").trim();
  const parts = safe.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[parts.length - 1]}_Resume.docx`;
  }
  return `${safe || "Candidate"}_Resume.docx`;
}

export async function buildResumeDocx({
  tailored,
}: BuildArgs): Promise<{ blob: Blob; fileName: string }> {
  const contact = tailored.contact;
  const fileName = suggestFileName(contact.name || "Candidate");

  const children: Paragraph[] = [];

  // Contact info in document BODY (not Word header).
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: contact.name || "Candidate",
          font: FONT,
          size: NAME_PT * 2,
          bold: true,
        }),
      ],
    }),
  );
  const contactBits = [
    contact.location,
    contact.phone,
    contact.email,
    contact.linkedin,
  ].filter(Boolean);
  if (contactBits.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [bodyRun(contactBits.join("  |  "))],
      }),
    );
  }

  // Professional Summary
  children.push(headingPara("PROFESSIONAL SUMMARY"));
  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [bodyRun(tailored.summary)],
    }),
  );

  // Work Experience — each role with company/title/dates header + bullets
  children.push(headingPara("WORK EXPERIENCE"));
  for (const role of tailored.experience ?? []) {
    children.push(roleHeaderPara(role.company, role.title, role.location));
    children.push(roleDatesPara(role.dates));
    for (const b of role.bullets ?? []) {
      children.push(bulletPara(b.rewritten));
    }
  }

  // Skills
  if (tailored.skills && tailored.skills.length > 0) {
    children.push(headingPara("SKILLS"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [bodyRun(tailored.skills.join(", "))],
      }),
    );
  }

  const doc = new Document({
    creator: contact.name || "Candidate",
    title: `${contact.name || "Candidate"} Resume`,
    description: "ATS-optimized resume",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY_PT * 2 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return { blob, fileName };
}
