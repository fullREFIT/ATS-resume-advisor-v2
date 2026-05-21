import type { TailoredOutput } from "./types";

export function formatTailoredAsPlainText(output: TailoredOutput): string {
  const lines: string[] = [];

  if (output.contact) {
    if (output.contact.name) lines.push(output.contact.name);
    if (output.contact.email) lines.push(output.contact.email);
    if (output.contact.phone) lines.push(output.contact.phone);
    if (output.contact.location) lines.push(output.contact.location);
    if (output.contact.linkedin) lines.push(output.contact.linkedin);
    lines.push("");
  }

  if (output.summary) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(output.summary);
    lines.push("");
  }

  if (output.experience?.length) {
    lines.push("PROFESSIONAL EXPERIENCE");
    for (const role of output.experience) {
      lines.push(`${role.title} — ${role.company}`);
      if (role.dates) lines.push(role.dates);
      if (role.location) lines.push(role.location);
      for (const bullet of role.bullets || []) {
        lines.push(`• ${bullet.rewritten}`);
      }
      lines.push("");
    }
  }

  if (output.skills?.length) {
    lines.push("SKILLS");
    lines.push(output.skills.join(", "));
    lines.push("");
  }

  return lines.join("\n").trim();
}
