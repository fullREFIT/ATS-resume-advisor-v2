import { chromium, devices } from "playwright";

const URL_BASE = process.env.URL_BASE || "https://ats-resume-advisor.vercel.app";
const dev = devices["iPhone SE"];
const browser = await chromium.launch();
const context = await browser.newContext({ ...dev });
const page = await context.newPage();

const results = [];
async function check(label, path) {
  await page.goto(URL_BASE + path, { waitUntil: "networkidle" });
  const horizontal = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  const viewportW = page.viewportSize().width;
  const docW = await page.evaluate(() => document.documentElement.scrollWidth);
  // Check input font sizes (must be >=16 to prevent iOS zoom)
  const smallInputs = await page.evaluate(() => {
    const all = Array.from(
      document.querySelectorAll("input, textarea, select"),
    );
    return all
      .map((el) => ({ fs: parseFloat(getComputedStyle(el).fontSize), tag: el.tagName }))
      .filter((x) => x.fs < 16);
  });
  // Identify all buttons + primary CTAs, capture their text + heights
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const tt = (el.textContent || "").trim().slice(0, 40);
        return { h: Math.round(r.height), w: Math.round(r.width), text: tt };
      });
  });
  const ctaH = buttons
    .filter((b) => /Diagnose|Refine|Generate|Download/i.test(b.text))
    .map((b) => b.h);
  results.push({
    label,
    path,
    viewportW,
    docW,
    horizontalScroll: horizontal,
    smallInputs,
    primaryCtaHeights: ctaH,
    buttonHeights: buttons.map((b) => ({ h: b.h, t: b.text })),
  });
  await page.screenshot({ path: `/tmp/qa-${label}.png`, fullPage: true });
}

await check("home", "/");
await check("about", "/about");
// Seed localStorage to land on /diagnose
await page.goto(URL_BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const fake = {
    resume: "Jane Doe Software Engineer with valid 60-character minimum resume content here, lots of text.",
    jd: "Senior Backend Engineer minimum 60 characters of JD content here for the test of the diagnose page.",
    answers: {},
    diagnosis: {
      matchScore: 72,
      verdict: "GO",
      verdictReasoning: "Strong fit on core systems and payments. Some staff-leadership gaps.",
      topMatches: ["Go expertise", "Payments scale", "Distributed systems"],
      criticalGaps: ["Direct reports", "OpenTelemetry", "Two-page experience claim"],
      atsParsingFlags: ["None visible in plain text"],
      trajectoryNote: "Clean upward trajectory with one lateral move.",
    },
    updatedAt: Date.now(),
  };
  localStorage.setItem("ai-resume-advisor-v1", JSON.stringify(fake));
});
await check("diagnose", "/diagnose");

await browser.close();
console.log(JSON.stringify(results, null, 2));
