import { chromium, devices } from "playwright";

const URL_BASE = process.env.URL_BASE || "https://ats-resume-advisor-v2.vercel.app";
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
  const smallInputs = await page.evaluate(() => {
    const all = Array.from(
      document.querySelectorAll("input, textarea, select"),
    );
    return all
      .map((el) => ({ fs: parseFloat(getComputedStyle(el).fontSize), tag: el.tagName }))
      .filter((x) => x.fs < 16);
  });
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button"))
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { h: Math.round(r.height), w: Math.round(r.width), text: (el.textContent || "").trim().slice(0, 40) };
      });
  });
  results.push({
    label,
    viewportW,
    docW,
    horizontalScroll: horizontal,
    smallInputs,
    buttonHeights: buttons.map((b) => ({ h: b.h, t: b.text })),
  });
  await page.screenshot({ path: `/tmp/v2-qa-${label}.png`, fullPage: true });
}

await check("home-role", "/");

// Flip to company mode by clicking the radio
await page.goto(URL_BASE + "/", { waitUntil: "networkidle" });
await page.locator('input[value="company"]').click();
await page.screenshot({ path: "/tmp/v2-qa-home-company.png", fullPage: true });
results.push({
  label: "home-company-toggled",
  via: "click radio",
  url: page.url(),
});

// Seed a company-fit session to test /diagnose for company mode
await page.evaluate(() => {
  const s = {
    mode: "company",
    resume: "Real resume content 60+ chars padded for the test of the diagnose page in company mode flow.",
    jd: "",
    companyUrl: "https://example.com",
    desiredRole: "Director of Sales",
    companyContent: { url: "https://example.com", fetchedAt: Date.now(), text: "Company text " + "x".repeat(400), charCount: 414 },
    companyFit: {
      companyName: "Example Inc",
      valuesObserved: ["Stated focus on customer success", "Mentions automation"],
      rolesLikelyHired: ["Sales Manager", "Account Executive"],
      whereBackgroundMaps: ["a", "b", "c"],
      outreachGaps: ["No direct industry experience"],
      confidenceNote: "Read 414 chars from homepage; about page not accessed."
    },
    answers: {},
    updatedAt: Date.now(),
  };
  localStorage.setItem("ai-resume-advisor-v3", JSON.stringify(s));
});
await check("diagnose-company", "/diagnose");

await browser.close();
console.log(JSON.stringify(results, null, 2));
