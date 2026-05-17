import { chromium, devices } from "playwright";
const URL_BASE = process.env.URL_BASE || "https://ats-resume-advisor.vercel.app";
const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone SE"] });
const page = await context.newPage();

// Seed state on home
await page.goto(URL_BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const s = {
    resume: "Jane Doe Senior Software Engineer with 60+ chars of content here for the persistence test cycle through reload behavior verification.",
    jd: "Looking for a Senior Backend Engineer 60+ chars of JD text here for the persistence test cycle through reload behavior verification.",
    answers: {},
    diagnosis: { matchScore: 80, verdict: "GO", verdictReasoning: "ok", topMatches: ["a"], criticalGaps: ["b"], atsParsingFlags: ["None"], trajectoryNote: "n" },
    updatedAt: Date.now(),
  };
  localStorage.setItem("ai-resume-advisor-v1", JSON.stringify(s));
});

// Navigate to /diagnose, then reload, then verify state still loads
await page.goto(URL_BASE + "/diagnose", { waitUntil: "networkidle" });
const scoreBefore = await page.locator("text=80").first().textContent();
await page.reload({ waitUntil: "networkidle" });
const scoreAfter = await page.locator("text=80").first().textContent();
console.log("scoreBefore=", scoreBefore, "scoreAfter=", scoreAfter, "match=", scoreBefore === scoreAfter);
await browser.close();
