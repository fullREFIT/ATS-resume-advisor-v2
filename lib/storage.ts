"use client";

import { EMPTY_SESSION, type SessionState, type IntakeMode, type Verdict } from "./types";

const KEY = "resume-verdict-v1";
const OLD_KEYS = ["ai-resume-advisor-v3", "ai-resume-advisor-v2", "ai-resume-advisor-v1"];

// ── Version History ──────────────────────────────────────────────────────────

const HISTORY_KEY = "resume-verdict-history";
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: string;
  date: number;
  mode: IntakeMode;
  verdict?: Verdict;
  matchScore?: number;
  scoreBreakdown?: {
    keywordMatch: number;
    experienceRelevance: number;
    trajectoryFit: number;
    atsParsing: number;
  };
  jobTitle?: string;
  companyName?: string;
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function pushHistory(entry: Omit<HistoryEntry, "id" | "date">): void {
  if (!isBrowser()) return;
  const history = loadHistory();
  history.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: Date.now(),
  });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* quota */
  }
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadSession(): SessionState {
  if (!isBrowser()) return EMPTY_SESSION;
  try {
    // Migrate: drop any pre-v3 cached state (mode field + new shapes).
    for (const k of OLD_KEYS) {
      if (window.localStorage.getItem(k)) {
        window.localStorage.removeItem(k);
      }
    }
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_SESSION;
    const parsed = JSON.parse(raw) as SessionState;
    return { ...EMPTY_SESSION, ...parsed };
  } catch {
    return EMPTY_SESSION;
  }
}

export function saveSession(state: SessionState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...state, updatedAt: Date.now() }),
    );
  } catch {
    /* quota exceeded or private mode */
  }
}

export function patchSession(partial: Partial<SessionState>): SessionState {
  const current = loadSession();
  const next = { ...current, ...partial };
  saveSession(next);
  return next;
}

export function clearSession() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
