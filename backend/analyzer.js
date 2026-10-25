import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { SKILLS } from "./skills.js";

// A PDF is not plain text. It is a set of drawing instructions, so pdf.js
// rebuilds the strings for us from each page's text items.
export async function extractText(buffer) {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;

  let text = "";
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

// Whole-word, case-insensitive match. Escaping keeps "." in "node.js" from
// being read as a regex wildcard.
function containsTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i");
  return pattern.test(text);
}

function skillIn(text, skill) {
  return skill.terms.some((term) => containsTerm(text, term));
}

// Score the resume against the skills the JD asks for. If the JD names none
// of the tracked skills, score against the whole list and say so.
export function analyse(resumeText, jdText) {
  const jdSkills = SKILLS.filter((skill) => skillIn(jdText, skill));
  const basis = jdSkills.length > 0 ? "jd" : "general";
  const targets = basis === "jd" ? jdSkills : SKILLS;

  const present = [];
  const missing = [];
  for (const skill of targets) {
    (skillIn(resumeText, skill) ? present : missing).push(skill.label);
  }

  const score = Math.round((present.length / targets.length) * 100);
  return { score, basis, present, missing };
}
