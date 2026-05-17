import React, { useState, useEffect } from "react";
import { Copy, Check, AlertCircle, ArrowLeft, ArrowRight, X, Info, ExternalLink, FileText, Sparkles, RotateCcw } from "lucide-react";

// ============================================================================
// Carbon Forge palette — light mode, canonical hex values
// ============================================================================
const FORGE = {
  carbonCore: "#121010",
  forgeRed: "#D43B2A",
  forgeRedHover: "#B8301F",
  forgeGold: "#FFB400",
  forgeDark: "#333130",
  ashWhite: "#F2F0EE",
  pureWhite: "#FFFFFF",
  echo: "#878E88",
  softGray: "#E5E3E0",
};

const STORAGE_KEY = "ai-resume-advisor-v1";

const STAGES = {
  INTAKE: "intake",
  DIAGNOSING: "diagnosing",
  DIAGNOSIS: "diagnosis",
  GENERATING_QUESTIONS: "generating_questions",
  QUESTIONS: "questions",
  GENERATING_OUTPUT: "generating_output",
  RESULT: "result",
  ABOUT: "about",
};

// ============================================================================
// API helpers (artifact API — claude-sonnet-4-20250514)
// ============================================================================
const stripFences = (s) => s.replace(/```json\n?|```\n?/g, "").trim();

const callClaude = async (systemPrompt, userPrompt) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await response.json();
  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  return text;
};

const parseJson = (text) => {
  try { return JSON.parse(stripFences(text)); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
};

// ============================================================================
// Persistence note
// ============================================================================
// NOTE: Production version uses localStorage for cross-refresh persistence
// (see Claude Code build brief). Claude.ai artifacts cannot use browser storage
// APIs, so the prototype keeps state in React memory only. State will reset
// on artifact reload — this is a prototype-only limitation, not a product spec.

// ============================================================================
// System prompts (ATS deep-dive 2026 deltas integrated)
// ============================================================================
const DIAGNOSIS_SYSTEM = `You are a hiring manager and career strategist who has reviewed thousands of resumes. Analyze the gap between a candidate's resume and a target job description.

Be honest, not encouraging. Refuse to flatter. Name real gaps. NEVER fabricate experience the candidate didn't claim.

Modern ATS reality (2026):
- ATS rarely auto-rejects. The real problem is being ranked too low to be seen by a recruiter.
- Parsing failure causes about 30% of low rankings — the single biggest cause. Multi-column layouts, tables, text boxes, graphics, headers/footers, image-based PDFs (Canva/Figma exports) destroy parse accuracy.
- Modern ATS (Workday, Greenhouse, Lever) uses semantic scoring AND skill taxonomies. Exact keyword match still wins, but vocabulary depth matters.
- Career trajectory signals — upward progression, gaps, lateral moves — are read by an AI co-pilot layer that summarizes resumes for recruiters.
- Workday and some iCIMS configs cross-reference resume titles/dates against the candidate's LinkedIn profile.

Return STRICT JSON only, no commentary, no markdown fences:
{
  "matchScore": <integer 0-100>,
  "verdict": "GO" | "FIX_FIRST" | "PASS",
  "verdictReasoning": "<2 blunt sentences>",
  "topMatches": ["<match 1>", "<match 2>", "<match 3>"],
  "criticalGaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "atsParsingFlags": ["<formatting issue in plain English, or 'None visible in plain text'>"],
  "trajectoryNote": "<1 sentence on career progression / gaps / lateral moves>"
}

GO = match >= 70, no disqualifiers — apply with tailoring
FIX_FIRST = match 50-70 — add a project, cert, or experience first
PASS = match < 50 or hard disqualifier — recommend not applying`;

const QUESTIONS_SYSTEM = `You are a career strategist running a Socratic intake. Given a resume, JD, and diagnosed gaps, generate exactly 5 targeted questions that surface STAR stories, hidden experience, or quantified outcomes the candidate has but didn't write on their resume.

Each question must be specific to THIS candidate and THIS job — never generic. Target the gaps and weakest bullets. Ask for evidence the candidate likely has but didn't highlight.

Modern ATS compares claimed skills versus demonstrated experience. Every skill on the resume should be substantiated in Experience. Use questions to surface evidence for claimed skills that lack proof.

Return STRICT JSON only, no fences:
{
  "questions": [
    {"id": "q1", "category": "<gap area>", "question": "<specific question>", "why": "<1 sentence — what this surfaces>"},
    {"id": "q2", "category": "...", "question": "...", "why": "..."},
    {"id": "q3", "category": "...", "question": "...", "why": "..."},
    {"id": "q4", "category": "...", "question": "...", "why": "..."},
    {"id": "q5", "category": "...", "question": "...", "why": "..."}
  ]
}`;

const OUTPUT_SYSTEM = `You are an expert resume writer and ATS optimization specialist. Produce ATS-optimized resume content using ONLY information from the candidate's original resume and their intake answers. NEVER fabricate experience, tools, metrics, or outcomes the candidate did not provide.

ATS rules (2026):
- Keywords weighted heaviest in Summary and FIRST BULLET of each role.
- Mirror exact JD language for primary keywords. Exact match beats semantic equivalent.
- Include spelled-out plus abbreviated form on first use: "Search Engine Optimization (SEO)".
- Every claimed skill must be demonstrated in Experience bullets.
- Quantify outcomes ONLY when the candidate provided numbers. Never invent metrics.
- Reverse chronological order. Two pages is fine for 10+ years of experience.
- Strong action verbs. Past tense for past roles.

Return STRICT JSON only, no fences:
{
  "summary": "<3-4 sentence professional summary with primary keywords woven in naturally>",
  "tailoredBullets": [
    {"original": "<original bullet text, or 'NEW from intake'>", "rewritten": "<ATS-optimized bullet, max 30 words>"},
    {"original": "...", "rewritten": "..."}
  ],
  "keywordsIntegrated": ["<keyword 1>", "<keyword 2>", "..."],
  "interviewPrep": {
    "likelyQuestions": ["<q1>", "<q2>", "<q3>"],
    "starStoriesToPrep": ["<story prompt 1>", "<story prompt 2>"],
    "weakSpotResponses": ["<how to address gap 1 in interview, 1 sentence>"]
  }
}

Aim for 5-7 tailored bullets total. Keep each bullet under 30 words.`;

// ============================================================================
// Reusable styles
// ============================================================================
const fontStack = "'Outfit', system-ui, -apple-system, sans-serif";
const monoStack = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const buttonPrimary = {
  backgroundColor: FORGE.forgeRed,
  color: FORGE.pureWhite,
  border: "none",
  borderRadius: "0.5rem",
  padding: "0.875rem 1.5rem",
  fontFamily: fontStack,
  fontWeight: 600,
  fontSize: "0.9375rem",
  letterSpacing: "0.02em",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  minHeight: "48px",
};

const buttonSecondary = {
  backgroundColor: "transparent",
  color: FORGE.carbonCore,
  border: `1px solid ${FORGE.softGray}`,
  borderRadius: "0.5rem",
  padding: "0.75rem 1.25rem",
  fontFamily: fontStack,
  fontWeight: 500,
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  minHeight: "44px",
};

const cardStyle = {
  backgroundColor: FORGE.pureWhite,
  border: `1px solid ${FORGE.softGray}`,
  borderRadius: "0.75rem",
  padding: "1.5rem",
};

const labelStyle = {
  fontFamily: monoStack,
  fontWeight: 600,
  fontSize: "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: FORGE.forgeRed,
  marginBottom: "0.5rem",
  display: "block",
};

const inputStyle = {
  width: "100%",
  backgroundColor: FORGE.pureWhite,
  border: `1px solid ${FORGE.softGray}`,
  borderRadius: "0.5rem",
  padding: "0.875rem 1rem",
  fontFamily: fontStack,
  fontSize: "0.9375rem",
  color: FORGE.carbonCore,
  resize: "vertical",
  outline: "none",
};

// ============================================================================
// UI Components
// ============================================================================
function ProgressBar({ stage }) {
  const steps = [
    { key: "intake", label: "INTAKE", n: 1 },
    { key: "diagnosis", label: "DIAGNOSIS", n: 2 },
    { key: "refine", label: "REFINE", n: 3 },
    { key: "result", label: "RESULT", n: 4 },
  ];
  const stageMap = {
    [STAGES.INTAKE]: "intake",
    [STAGES.DIAGNOSING]: "diagnosis",
    [STAGES.DIAGNOSIS]: "diagnosis",
    [STAGES.GENERATING_QUESTIONS]: "refine",
    [STAGES.QUESTIONS]: "refine",
    [STAGES.GENERATING_OUTPUT]: "result",
    [STAGES.RESULT]: "result",
  };
  const current = stageMap[stage] || "intake";
  const currentIdx = steps.findIndex(s => s.key === current);

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", width: "100%" }}>
      {steps.map((s, i) => {
        const isActive = s.key === current;
        const isDone = i < currentIdx;
        const bgColor = isActive ? FORGE.forgeRed : isDone ? FORGE.carbonCore : FORGE.softGray;
        const textColor = (isActive || isDone) ? FORGE.pureWhite : FORGE.echo;
        return (
          <React.Fragment key={s.key}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
              <div style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "50%",
                backgroundColor: bgColor,
                color: textColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: monoStack,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}>
                {s.n}
              </div>
              <span className="step-label" style={{
                fontFamily: monoStack,
                fontSize: "0.6875rem",
                letterSpacing: "0.12em",
                fontWeight: 600,
                color: isActive ? FORGE.carbonCore : FORGE.echo,
              }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: "1px",
                backgroundColor: isDone ? FORGE.carbonCore : FORGE.softGray,
                margin: "0 0.5rem",
                minWidth: "0.5rem",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Header({ onAbout, onReset }) {
  return (
    <header style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontFamily: fontStack,
            fontWeight: 700,
            fontSize: "1.625rem",
            color: FORGE.carbonCore,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            AI Resume Advisor
          </h1>
          <p style={{
            fontFamily: fontStack,
            fontSize: "0.9375rem",
            color: FORGE.echo,
            margin: "0.375rem 0 0 0",
            lineHeight: 1.4,
          }}>
            Honest diagnosis. No fabrication. ATS-optimized.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button onClick={onAbout} style={{
            ...buttonSecondary,
            padding: "0.5rem 0.875rem",
            fontSize: "0.8125rem",
            minHeight: "36px",
          }}>
            <Info size={14} />
            How it works
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      marginTop: "3rem",
      paddingTop: "2rem",
      borderTop: `1px solid ${FORGE.softGray}`,
      textAlign: "center",
    }}>
      <p style={{
        fontFamily: fontStack,
        fontSize: "0.9375rem",
        color: FORGE.carbonCore,
        margin: "0 0 0.75rem 0",
      }}>
        Find this useful? Learn more at{" "}
        <a href="https://fullrefit.com" target="_blank" rel="noopener noreferrer" style={{
          color: FORGE.forgeRed,
          fontWeight: 600,
          textDecoration: "none",
          borderBottom: `1px solid ${FORGE.forgeRed}`,
        }}>
          fullREFIT.com
        </a>
      </p>
      <p style={{
        fontFamily: monoStack,
        fontSize: "0.6875rem",
        letterSpacing: "0.08em",
        color: FORGE.echo,
        margin: 0,
        textTransform: "uppercase",
      }}>
        Built with Claude Code
      </p>
    </footer>
  );
}

function InfoBlock({ icon: Icon, children, color = FORGE.forgeRed }) {
  return (
    <div style={{
      backgroundColor: FORGE.pureWhite,
      border: `1px solid ${FORGE.softGray}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: "0.5rem",
      padding: "1rem 1.25rem",
      display: "flex",
      gap: "0.75rem",
      marginBottom: "1.25rem",
    }}>
      {Icon && <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: "0.125rem" }} />}
      <div style={{
        fontFamily: fontStack,
        fontSize: "0.875rem",
        color: FORGE.carbonCore,
        lineHeight: 1.55,
      }}>
        {children}
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button onClick={handleCopy} style={{
      ...buttonSecondary,
      padding: "0.375rem 0.75rem",
      fontSize: "0.75rem",
      minHeight: "32px",
    }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ============================================================================
// Screen: INTAKE
// ============================================================================
function IntakeScreen({ resume, setResume, jd, setJd, onSubmit }) {
  const canSubmit = resume.trim().length > 50 && jd.trim().length > 50;
  return (
    <>
      <InfoBlock icon={AlertCircle}>
        <strong style={{ color: FORGE.carbonCore }}>97.8% of Fortune 500 companies use applicant tracking systems (ATS).</strong>{" "}
        The software ranks resumes before any human sees them, and formatting alone can kill a strong candidate. This tool diagnoses where your resume stands, fixes what's broken, and tells you honestly when the gap is too wide to apply.
      </InfoBlock>

      <InfoBlock icon={Info} color={FORGE.echo}>
        Your work is saved in this browser only. Clearing browser data or switching devices will erase it. Nothing is sent to any server beyond the AI model that analyzes your text.
      </InfoBlock>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle}>Your resume (paste plain text)</label>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your current resume here. Plain text works best."
          style={{ ...inputStyle, minHeight: "200px", fontFamily: fontStack }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Target job description</label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description for the role you're targeting."
          style={{ ...inputStyle, minHeight: "180px", fontFamily: fontStack }}
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{
          ...buttonPrimary,
          opacity: canSubmit ? 1 : 0.4,
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        Diagnose fit <ArrowRight size={18} />
      </button>
    </>
  );
}

// ============================================================================
// Screen: DIAGNOSIS
// ============================================================================
function DiagnosisScreen({ diagnosis, onContinue, onReset }) {
  if (!diagnosis) return null;
  const verdictColors = {
    GO: FORGE.forgeRed,
    FIX_FIRST: FORGE.forgeGold,
    PASS: FORGE.echo,
  };
  const verdictLabels = {
    GO: "GO — Apply with tailoring",
    FIX_FIRST: "FIX FIRST — Real chance, but add evidence",
    PASS: "PASS — Recommend not applying",
  };
  const verdictColor = verdictColors[diagnosis.verdict] || FORGE.echo;
  const canContinue = diagnosis.verdict === "GO" || diagnosis.verdict === "FIX_FIRST";

  return (
    <>
      <div style={{ ...cardStyle, borderTop: `3px solid ${verdictColor}`, marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div>
            <span style={labelStyle}>Match score</span>
            <div style={{
              fontFamily: monoStack,
              fontSize: "2.75rem",
              fontWeight: 700,
              color: FORGE.carbonCore,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              {diagnosis.matchScore}<span style={{ fontSize: "1.25rem", color: FORGE.echo, fontWeight: 400 }}>/100</span>
            </div>
          </div>
          <div style={{
            backgroundColor: verdictColor,
            color: FORGE.pureWhite,
            fontFamily: monoStack,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "0.5rem 0.875rem",
            borderRadius: "0.375rem",
            alignSelf: "flex-start",
          }}>
            {verdictLabels[diagnosis.verdict]}
          </div>
        </div>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.6, margin: 0 }}>
          {diagnosis.verdictReasoning}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Top matches</span>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: FORGE.carbonCore, fontFamily: fontStack, fontSize: "0.875rem", lineHeight: 1.7 }}>
            {(diagnosis.topMatches || []).map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Critical gaps</span>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: FORGE.carbonCore, fontFamily: fontStack, fontSize: "0.875rem", lineHeight: 1.7 }}>
            {(diagnosis.criticalGaps || []).map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      </div>

      {diagnosis.atsParsingFlags && diagnosis.atsParsingFlags.length > 0 && diagnosis.atsParsingFlags[0] !== "None visible in plain text" && (
        <div style={{ ...cardStyle, borderLeft: `3px solid ${FORGE.forgeGold}`, marginBottom: "1rem" }}>
          <span style={{ ...labelStyle, color: FORGE.forgeDark }}>ATS parsing flags — fix these first</span>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: FORGE.carbonCore, fontFamily: fontStack, fontSize: "0.875rem", lineHeight: 1.7 }}>
            {diagnosis.atsParsingFlags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {diagnosis.trajectoryNote && (
        <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
          <span style={labelStyle}>Career trajectory</span>
          <p style={{ margin: 0, fontFamily: fontStack, fontSize: "0.875rem", color: FORGE.carbonCore, lineHeight: 1.6 }}>
            {diagnosis.trajectoryNote}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {canContinue && (
          <button onClick={onContinue} style={{ ...buttonPrimary, flex: 1, minWidth: "200px" }}>
            Refine my resume <ArrowRight size={18} />
          </button>
        )}
        <button onClick={onReset} style={{ ...buttonSecondary, flex: canContinue ? "0 0 auto" : 1 }}>
          <RotateCcw size={14} /> Start over
        </button>
      </div>
    </>
  );
}

// ============================================================================
// Screen: QUESTIONS
// ============================================================================
function QuestionsScreen({ questions, answers, setAnswers, onBack, onSubmit }) {
  if (!questions) return null;
  const allAnswered = questions.questions.every(q => (answers[q.id] || "").trim().length > 20);
  return (
    <>
      <InfoBlock icon={Sparkles}>
        Answer these to surface real stories the AI can use. The more specific you are about outcomes, numbers, and tools, the stronger the tailored bullets become. Vague answers produce vague output.
      </InfoBlock>

      {questions.questions.map((q, i) => (
        <div key={q.id} style={{ ...cardStyle, marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div style={{
              backgroundColor: FORGE.carbonCore,
              color: FORGE.pureWhite,
              fontFamily: monoStack,
              fontSize: "0.75rem",
              fontWeight: 700,
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", fontWeight: 600, color: FORGE.carbonCore, margin: "0 0 0.25rem 0", lineHeight: 1.5 }}>
                {q.question}
              </p>
              <p style={{ fontFamily: fontStack, fontSize: "0.8125rem", color: FORGE.echo, margin: 0 }}>
                {q.why}
              </p>
            </div>
          </div>
          <textarea
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            placeholder="Be specific. Numbers, tools, outcomes."
            style={{ ...inputStyle, minHeight: "100px" }}
          />
        </div>
      ))}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ ...buttonSecondary, flex: "0 0 auto" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          style={{
            ...buttonPrimary,
            flex: 1,
            minWidth: "200px",
            opacity: allAnswered ? 1 : 0.4,
            cursor: allAnswered ? "pointer" : "not-allowed",
          }}
        >
          Generate tailored resume <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
}

// ============================================================================
// Screen: RESULT
// ============================================================================
function ResultScreen({ output, onReset }) {
  if (!output) return null;
  return (
    <>
      <InfoBlock icon={Check} color={FORGE.forgeRed}>
        Tailored content below. In the production app, this exports as an ATS-safe .docx file (single column, standard headings, Calibri 11pt). Here in the prototype, copy what you need.
      </InfoBlock>

      <div style={{ ...cardStyle, marginBottom: "1rem", borderTop: `3px solid ${FORGE.forgeRed}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={labelStyle}>Professional summary</span>
          <CopyButton text={output.summary} />
        </div>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.65, margin: 0 }}>
          {output.summary}
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <span style={labelStyle}>Tailored bullets (original → rewritten)</span>
        {(output.tailoredBullets || []).map((b, i) => (
          <div key={i} style={{
            marginTop: "1rem",
            paddingTop: i === 0 ? 0 : "1rem",
            borderTop: i === 0 ? "none" : `1px solid ${FORGE.softGray}`,
          }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <span style={{
                fontFamily: monoStack,
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                color: FORGE.echo,
                textTransform: "uppercase",
                fontWeight: 600,
              }}>Original</span>
              <p style={{ fontFamily: fontStack, fontSize: "0.875rem", color: FORGE.echo, margin: "0.25rem 0 0 0", textDecoration: b.original === "NEW from intake" ? "none" : "line-through" }}>
                {b.original}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <span style={{
                  fontFamily: monoStack,
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                  color: FORGE.forgeRed,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}>Rewritten</span>
                <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, margin: "0.25rem 0 0 0", fontWeight: 500, lineHeight: 1.55 }}>
                  {b.rewritten}
                </p>
              </div>
              <CopyButton text={b.rewritten} />
            </div>
          </div>
        ))}
      </div>

      {output.keywordsIntegrated && output.keywordsIntegrated.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: "1rem" }}>
          <span style={labelStyle}>Keywords integrated</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {output.keywordsIntegrated.map((kw, i) => (
              <span key={i} style={{
                backgroundColor: FORGE.ashWhite,
                color: FORGE.carbonCore,
                fontFamily: monoStack,
                fontSize: "0.75rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "0.25rem",
                border: `1px solid ${FORGE.softGray}`,
              }}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {output.interviewPrep && (
        <div style={{ ...cardStyle, marginBottom: "1.5rem", borderTop: `3px solid ${FORGE.carbonCore}` }}>
          <span style={labelStyle}>Interview prep</span>

          {output.interviewPrep.likelyQuestions && (
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ fontFamily: fontStack, fontSize: "0.8125rem", fontWeight: 600, color: FORGE.carbonCore, margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Likely questions
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", color: FORGE.carbonCore, fontFamily: fontStack, fontSize: "0.875rem", lineHeight: 1.65 }}>
                {output.interviewPrep.likelyQuestions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          )}

          {output.interviewPrep.starStoriesToPrep && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontFamily: fontStack, fontSize: "0.8125rem", fontWeight: 600, color: FORGE.carbonCore, margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                STAR stories to prep
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", color: FORGE.carbonCore, fontFamily: fontStack, fontSize: "0.875rem", lineHeight: 1.65 }}>
                {output.interviewPrep.starStoriesToPrep.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {output.interviewPrep.weakSpotResponses && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontFamily: fontStack, fontSize: "0.8125rem", fontWeight: 600, color: FORGE.carbonCore, margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                How to address weak spots
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", color: FORGE.carbonCore, fontFamily: fontStack, fontSize: "0.875rem", lineHeight: 1.65 }}>
                {output.interviewPrep.weakSpotResponses.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <button onClick={onReset} style={buttonSecondary}>
        <RotateCcw size={14} /> Start over with a new resume
      </button>
    </>
  );
}

// ============================================================================
// Screen: ABOUT
// ============================================================================
function AboutScreen({ onBack }) {
  return (
    <>
      <button onClick={onBack} style={{ ...buttonSecondary, marginBottom: "1.5rem" }}>
        <ArrowLeft size={14} /> Back to tool
      </button>

      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <span style={labelStyle}>How it works</span>
        <h2 style={{ fontFamily: fontStack, fontSize: "1.25rem", fontWeight: 700, color: FORGE.carbonCore, margin: "0.5rem 0 1rem 0" }}>
          Honest diagnosis, then real tailoring
        </h2>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.65, margin: "0 0 1rem 0" }}>
          Most resume tools do one of two things badly. They stuff keywords into whatever you upload until it sounds wrong, or they tell you everything is fine when it isn't. This one is different on purpose.
        </p>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.65, margin: "0 0 1rem 0" }}>
          First it diagnoses the gap between your resume and the job. If the gap is too wide, it tells you to fix something or pass on the role — not to apply with a tailored coat of paint. If the gap is real but workable, it asks you targeted questions to surface evidence you have but didn't write down. Then it tailors using only what you actually told it.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <span style={labelStyle}>How applicant tracking systems actually work</span>
        <h3 style={{ fontFamily: fontStack, fontSize: "1.0625rem", fontWeight: 700, color: FORGE.carbonCore, margin: "0.5rem 0 0.75rem 0" }}>
          The 75% auto-rejection number is a myth
        </h3>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.65, margin: "0 0 1rem 0" }}>
          A 2026 analysis of actual ATS pipeline data found that 92% of ATS configurations do not auto-reject based on resume content. The systems parse and rank. Recruiters make the call from inside that ranked list. The real problem isn't auto-rejection — it's being ranked too low to be seen before the recruiter fills their shortlist.
        </p>
        <h3 style={{ fontFamily: fontStack, fontSize: "1.0625rem", fontWeight: 700, color: FORGE.carbonCore, margin: "1rem 0 0.75rem 0" }}>
          Parsing failure is the #1 cause of low rankings
        </h3>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.65, margin: 0 }}>
          About 30% of low rankings come from the ATS failing to read your resume correctly. Multi-column layouts, tables, text boxes, graphics, headers and footers, and PDFs exported from Canva or Figma all destroy parsing accuracy. The fanciest resume design is often the worst one. This tool's downloaded output is deliberately plain because plain works.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <span style={labelStyle}>The no-fabrication promise</span>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, lineHeight: 1.65, margin: 0 }}>
          Three layers keep the AI honest. The system prompt forbids inventing experience. The Socratic intake forces you to supply real evidence before tailoring runs. A final fact-check pass compares every tailored bullet against your original resume and your answers — anything the AI made up gets caught and removed before you see it. If the bullet isn't in the source, it doesn't make the resume.
        </p>
      </div>

      <div style={{
        ...cardStyle,
        backgroundColor: FORGE.carbonCore,
        color: FORGE.ashWhite,
        marginBottom: "1.5rem",
      }}>
        <span style={{
          fontFamily: monoStack,
          fontWeight: 600,
          fontSize: "0.6875rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: FORGE.forgeGold,
          marginBottom: "0.5rem",
          display: "block",
        }}>About the builder</span>
        <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.ashWhite, lineHeight: 1.65, margin: "0.5rem 0" }}>
          This tool is built by full/REFIT — we build operational AI systems and equip teams to use them. If a free tool can solve a problem this specific, imagine what a custom system inside your company could do.
        </p>
        <a href="https://fullrefit.com" target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "0.5rem",
          backgroundColor: FORGE.forgeRed,
          color: FORGE.pureWhite,
          fontFamily: fontStack,
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "0.625rem 1rem",
          borderRadius: "0.5rem",
          textDecoration: "none",
        }}>
          See what we build <ExternalLink size={14} />
        </a>
      </div>
    </>
  );
}

// ============================================================================
// Loading state
// ============================================================================
function LoadingScreen({ message }) {
  return (
    <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 1.5rem" }}>
      <div style={{
        width: "2.5rem",
        height: "2.5rem",
        margin: "0 auto 1rem auto",
        border: `3px solid ${FORGE.softGray}`,
        borderTopColor: FORGE.forgeRed,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ fontFamily: fontStack, fontSize: "0.9375rem", color: FORGE.carbonCore, margin: 0, fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function AIResumeAdvisor() {
  const [stage, setStage] = useState(STAGES.INTAKE);
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [previousStage, setPreviousStage] = useState(STAGES.INTAKE);

  // Note: production has localStorage hydration here (see build brief).
  // Artifacts can't use browser storage, so prototype is in-memory only.

  const handleDiagnose = async () => {
    setError("");
    setStage(STAGES.DIAGNOSING);
    try {
      const text = await callClaude(DIAGNOSIS_SYSTEM, `Resume:\n${resume}\n\n---\n\nJob description:\n${jd}`);
      const parsed = parseJson(text);
      if (!parsed) throw new Error("Could not parse diagnosis response. Try again with more detail in your resume and JD.");
      setDiagnosis(parsed);
      setStage(STAGES.DIAGNOSIS);
    } catch (e) {
      setError(e.message || "Diagnosis failed. Try again.");
      setStage(STAGES.INTAKE);
    }
  };

  const handleContinueToQuestions = async () => {
    setError("");
    setStage(STAGES.GENERATING_QUESTIONS);
    try {
      const text = await callClaude(QUESTIONS_SYSTEM, `Resume:\n${resume}\n\nJD:\n${jd}\n\nDiagnosis:\n${JSON.stringify(diagnosis)}`);
      const parsed = parseJson(text);
      if (!parsed || !parsed.questions) throw new Error("Could not generate questions. Try again.");
      setQuestions(parsed);
      setAnswers({});
      setStage(STAGES.QUESTIONS);
    } catch (e) {
      setError(e.message || "Question generation failed.");
      setStage(STAGES.DIAGNOSIS);
    }
  };

  const handleGenerateOutput = async () => {
    setError("");
    setStage(STAGES.GENERATING_OUTPUT);
    try {
      const intake = questions.questions.map(q => `Q: ${q.question}\nA: ${answers[q.id] || ""}`).join("\n\n");
      const text = await callClaude(OUTPUT_SYSTEM, `Resume:\n${resume}\n\nJD:\n${jd}\n\nIntake answers:\n${intake}`);
      const parsed = parseJson(text);
      if (!parsed) throw new Error("Could not generate tailored output. Try again.");
      setOutput(parsed);
      setStage(STAGES.RESULT);
    } catch (e) {
      setError(e.message || "Generation failed.");
      setStage(STAGES.QUESTIONS);
    }
  };

  const handleReset = () => {
    setResume("");
    setJd("");
    setDiagnosis(null);
    setQuestions(null);
    setAnswers({});
    setOutput(null);
    setError("");
    setStage(STAGES.INTAKE);
  };

  const handleAbout = () => {
    setPreviousStage(stage);
    setStage(STAGES.ABOUT);
  };

  const handleBackFromAbout = () => {
    setStage(previousStage);
  };

  return (
    <div style={{
      backgroundColor: FORGE.ashWhite,
      minHeight: "100vh",
      fontFamily: fontStack,
      color: FORGE.carbonCore,
      padding: "1rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus, input:focus {
          border-color: ${FORGE.forgeRed} !important;
          box-shadow: 0 0 0 3px ${FORGE.forgeRed}20;
        }
        button:hover:not(:disabled) { filter: brightness(0.95); }
        button[style*="${FORGE.forgeRed}"]:hover:not(:disabled) {
          background-color: ${FORGE.forgeRedHover} !important;
        }
        @media (max-width: 640px) {
          .step-label { display: none; }
        }
      `}</style>

      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "1rem 0.25rem",
      }}>
        <Header onAbout={handleAbout} onReset={handleReset} />

        {stage !== STAGES.ABOUT && <ProgressBar stage={stage} />}

        {error && (
          <div style={{
            backgroundColor: FORGE.pureWhite,
            border: `1px solid ${FORGE.forgeRed}`,
            borderLeft: `3px solid ${FORGE.forgeRed}`,
            borderRadius: "0.5rem",
            padding: "0.875rem 1.125rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}>
            <AlertCircle size={16} color={FORGE.forgeRed} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
            <p style={{ fontFamily: fontStack, fontSize: "0.875rem", color: FORGE.carbonCore, margin: 0, lineHeight: 1.5 }}>
              {error}
            </p>
          </div>
        )}

        {stage === STAGES.INTAKE && (
          <IntakeScreen resume={resume} setResume={setResume} jd={jd} setJd={setJd} onSubmit={handleDiagnose} />
        )}
        {stage === STAGES.DIAGNOSING && <LoadingScreen message="Diagnosing the gap..." />}
        {stage === STAGES.DIAGNOSIS && (
          <DiagnosisScreen diagnosis={diagnosis} onContinue={handleContinueToQuestions} onReset={handleReset} />
        )}
        {stage === STAGES.GENERATING_QUESTIONS && <LoadingScreen message="Generating targeted questions..." />}
        {stage === STAGES.QUESTIONS && (
          <QuestionsScreen
            questions={questions}
            answers={answers}
            setAnswers={setAnswers}
            onBack={() => setStage(STAGES.DIAGNOSIS)}
            onSubmit={handleGenerateOutput}
          />
        )}
        {stage === STAGES.GENERATING_OUTPUT && <LoadingScreen message="Tailoring your resume..." />}
        {stage === STAGES.RESULT && <ResultScreen output={output} onReset={handleReset} />}
        {stage === STAGES.ABOUT && <AboutScreen onBack={handleBackFromAbout} />}

        <Footer />
      </div>
    </div>
  );
}
