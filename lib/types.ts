export type Verdict = "GO" | "FIX_FIRST" | "PASS";

export interface ScoreBreakdownComponent {
  score: number;
  note: string;
}

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

export interface TailoredOutput {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  keywordsIntegrated: string[];
  keywordsMissed: string[];
  interviewPrep: InterviewPrep;
}

export interface SessionState {
  resume: string;
  jd: string;
  diagnosis?: Diagnosis;
  questions?: QuestionsResponse;
  answers: Record<string, string>;
  tailored?: TailoredOutput;
  updatedAt: number;
}

export const EMPTY_SESSION: SessionState = {
  resume: "",
  jd: "",
  answers: {},
  updatedAt: 0,
};
