// Shared
export type IntakeMode = "role" | "company";

export interface ScoreBreakdownComponent {
  score: number;
  note: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  why: string;
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface TailoredBullet {
  original: string;
  rewritten: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  dates: string;
  location?: string;
  bullets: TailoredBullet[];
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface InterviewPrep {
  likelyQuestions: string[];
  starStoriesToPrep: string[];
  weakSpotResponses: string[];
}

// Role mode (existing JD-matching flow)
export type Verdict = "GO" | "FIX_FIRST" | "PASS";

export interface ScoreBreakdown {
  keywordMatch: ScoreBreakdownComponent;
  experienceRelevance: ScoreBreakdownComponent;
  trajectoryFit: ScoreBreakdownComponent;
  atsParsing: ScoreBreakdownComponent;
}

export interface Diagnosis {
  matchScore: number;
  verdict: Verdict;
  verdictReasoning: string;
  scoreBreakdown: ScoreBreakdown;
  topMatches: string[];
  criticalGaps: string[];
  atsParsingFlags: string[];
  trajectoryNote: string;
}

export interface TailoredOutput {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  keywordsIntegrated: string[];
  keywordsMissed: string[];
  interviewPrep: InterviewPrep;
}

// Company mode (new proactive cold-outreach flow)
export interface CompanyFit {
  companyName: string;
  valuesObserved: string[];
  rolesLikelyHired: string[];
  whereBackgroundMaps: string[];
  outreachGaps: string[];
  confidenceNote: string;
}

export interface ColdOutreachAngle {
  positioning: string;
  draftMessage: string;
}

export interface CompanyTailoredOutput {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  companyHooksUsed: string[];
  coldOutreachAngle: ColdOutreachAngle;
  interviewPrep: InterviewPrep;
}

export interface FetchedCompanyContent {
  url: string;
  fetchedAt: number;
  text: string;
  charCount: number;
  warning?: string;
}

// Target-person discovery (proactive cold-outreach extension)
export interface TargetPersonArchetype {
  roleTitle: string;
  whyThisRole: string;
  openingLine: string;
  linkedinSearchString: string;
  salesNavSearchHint: string;
}

export interface TargetPersonsResponse {
  archetypes: TargetPersonArchetype[];
}

// Session — discriminated by mode, but flattened for simple localStorage shape.
export interface SessionState {
  mode: IntakeMode;
  resume: string;

  // Role mode fields
  jd: string;
  diagnosis?: Diagnosis;

  // Company mode fields
  companyUrl: string;
  desiredRole: string;
  companyContent?: FetchedCompanyContent;
  companyFit?: CompanyFit;

  // Shared
  questions?: QuestionsResponse;
  answers: Record<string, string>;
  tailored?: TailoredOutput;
  companyTailored?: CompanyTailoredOutput;
  targetPersons?: TargetPersonsResponse;

  updatedAt: number;
}

export const EMPTY_SESSION: SessionState = {
  mode: "role",
  resume: "",
  jd: "",
  companyUrl: "",
  desiredRole: "",
  answers: {},
  updatedAt: 0,
};
