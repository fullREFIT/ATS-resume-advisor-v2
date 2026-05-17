# Claude Code Task: Add Voice Compliance Gate and Humor Mechanic Selection to WF2

## File to modify
`/Users/paul/dev-4/claude-all-products/claude-skills/skill-collection/wf2-video-spec/SKILL.md`

**CONFIRM THIS PATH BEFORE EXECUTING.**

Read the entire file before editing. This file may have already been modified by two earlier prompts in this batch (hook engineering update and lead magnet strategy update). Read the current state of the file, not any cached version. Make surgical additions relative to whatever step numbering currently exists.

## Context

Two additions to WF2:

1. **Humor mechanic selection** added to the Hook Engineering step. When the hook is being engineered, the producer should also select which humor mechanics will be used throughout the script and where. This is a creative pre-production decision that belongs alongside hook archetype selection.

2. **Voice compliance gate** added as a verification step that runs AFTER the script sections are written and BEFORE the video_spec is saved. This is the enforcement mechanism that catches voice drift, AI vocabulary, structural AI tells, and missing personality before the spec exits WF2. Without this gate, a script with 12 em-dashes and zero humor can pass through WF2 unchecked (the exact failure mode that produced the killed bottleneck relocation script).

## Dependency Note

This prompt assumes the hook engineering update (claude-code-wf2-hook-update.md) has already been executed. That update added a Hook Engineering step (Step 3) with sub-sections 3a through 3d. This prompt adds section 3e to that step, and adds a new verification step later in the pipeline.

If the hook engineering update has NOT been executed yet, execute it first. Then execute this prompt.

## Change 1: Add humor mechanic selection to the Hook Engineering step

Find the Hook Engineering step (should be Step 3 after the hook update). Find section 3d (Define the visual hook). After 3d, add:

```markdown
### 3e. Select humor mechanics for the script

Choose which humor mechanics from the Humor Integration Guide v1.2 will appear in this script and where. This is a creative decision made before writing, not an afterthought added later.

Six mechanics are available. Not all will be used in every script. Select based on the topic, the origination stream, and which script section each mechanic fits best.

**Mechanic menu:**

| Mechanic | Best placement | Density limit |
|---|---|---|
| Deadpan Catalog | Framework section (illustrating a process or pattern) | 1 per script |
| Parenthetical Confession | Anywhere (the aside that contains the honest truth) | 2-3 across a long-form script |
| Quiet Reframe | Framework or Context (state belief, then state reality) | 2-3 per long-form |
| Earned Admission | Framework (admitting something about the profession) | 1 per script |
| Straight-Faced Understatement | Anywhere (describing a significant outcome with insufficient emphasis) | 2-4 per long-form |
| Stealing Thunder | Hook only (name the viewer's skepticism before they hold it against you) | 1 per script, always early |

**Selection rules:**

- Straight-Faced Understatement is the safest mechanic. When in doubt, default to it. It reads as dry and specific even if the reader doesn't register it as humor.
- Stealing Thunder is the highest-leverage mechanic for differentiation. Consider it for every hook. It works especially well for Stream A (pain point) and Stream E (counter-intuitive data) topics.
- The Deadpan Catalog is high-impact but one per script maximum. Use it when the framework involves a process or sequence that can be listed with deadpan accuracy.
- Total humor moves for a long-form script: 3-5. For a short: 1-2. These are ceilings, not targets.
- Every selected mechanic must pass the earned wryness test: anchored to a specific, real-world observation. Not a generic quip.

Record the selected mechanics and their planned placement in the video_spec. Example:

```
Humor plan:
- Hook: Stealing Thunder (name the "another AI consultant video" skepticism)
- Framework, Process #2: Earned Admission (admit the status reports were never requested by a client)
- Framework, verdict section: Straight-Faced Understatement (the 78-minute number)
- WTODN: Straight-Faced Understatement ("one process, ten minutes, one email")
Total moves: 4
```

**AI implementation warning:** Do not stack humor moves in adjacent sentences. Do not signal the humor ("The irony is..." / "The funny thing is..."). Do not use elevated vocabulary inside humor moves. The funniest version uses the plainest possible language. Do not generate fake earned admissions (self-deprecation that could apply to anyone). If the admission isn't specific to Paul's actual experience, cut it.
```

## Change 2: Add the Voice Compliance Gate as a new step

Find the verification step (the step that currently checks word count, section lengths, and other quality metrics before saving). This should be the second-to-last step in the pipeline (before the save step).

Add the following as a NEW step immediately before the save step. If the current verification step is Step N and the save step is Step N+1, insert this between them as the new Step N+1 and renumber the save step to N+2.

```markdown
## Step [N+1] — Voice Compliance Gate

This gate runs AFTER all script sections, slide plan, lead magnet spec, and distribution assets are written, and BEFORE the video_spec is saved. It is the enforcement mechanism that prevents voice drift from passing through the pipeline.

**The gate blocks the save if any CRITICAL check fails. Fix the failure, then re-run the gate.**

### Critical checks (any failure blocks save):

**Punctuation scan:**
- [ ] Zero em-dashes (U+2014) anywhere in the video_spec's script sections, speaker notes, and distribution assets.
- [ ] Zero semicolons in the same scope.
- [ ] En-dashes used only for number and date ranges.

**Tier 1 vocabulary scan:**
- [ ] Zero occurrences of banned hype words (voice-rules v2.4, Section 2): transform, revolutionize, game-changer, leverage (verb), unlock, synergy, upskill, AI-powered (as lead descriptor), and the rest of the Section 2 list.

**Tier 2 vocabulary scan:**
- [ ] Zero or one occurrence of Tier 2 AI-tell vocabulary (voice-rules v2.4, Section 2A): delve, utilize, facilitate, harness, multifaceted, comprehensive, robust, seamless, furthermore, moreover, and the rest of the Section 2A list. Two or more occurrences blocks save.

**Banned phrases scan:**
- [ ] Zero occurrences of banned AI-tell phrases (voice-rules v2.4, Section 3): "Here's what nobody tells you," "But here's the thing," "Here's the truth," "The reality is," and the rest of the Section 3 list.

### High checks (multiple failures block save):

**Structural AI tell scan:**
- [ ] Tricolon check: enumerate all grouped items in the script. If more than half come in threes, flag and vary.
- [ ] Democratic sections: compare word counts of HOOK, CONTEXT, FRAMEWORK, WTODN, CLOSE. If CONTEXT and WTODN are within 20% of each other in word count, verify this is intentional and not AI-default equal weighting.
- [ ] Formulaic signposting: search for "In this section," "Let's take a closer look," "It's worth examining," "Let's dive into." Remove all occurrences.
- [ ] Hedged non-positions: search for sentences that hedge both sides without landing on one. Full Refit takes positions.

**Symmetric construction check:**
- [ ] Count "It's not X. It's Y." or "X, not Y" symmetric constructions. More than one in the entire video_spec is a HIGH-tier fail. Rewrite all but one.

**Paul-as-subject check:**
- [ ] Count sentences where Paul is the grammatical subject in the script's teaching sections (HOOK, CONTEXT, FRAMEWORK, WTODN). If Paul is the subject of more than 20% of sentences, the script has drifted into Paul-as-protagonist. Rewrite to put the viewer or their company as subject.

### Medium checks (flagged, not blocking):

**Personality presence check:**
- [ ] Long-form script has at least 3 earned wry observations (hook, framework, close). Short-form has at least 1.
- [ ] All wry observations are anchored to specific evidence (not generic cynicism).
- [ ] Humor mechanics from Step 3e are present at their planned locations in the script. If any planned mechanic was dropped during writing, note it.

**Anecdote length check:**
- [ ] No anecdote exceeds 4 sentences in setup.

**Delivery notes check:**
- [ ] Slow-down and pace-up markers are present in teleprompter sections.
- [ ] At least one delivery note per script section.

### Gate output

Record the gate results in the video_spec before saving:

```
Voice Compliance Gate: [PASS / FAIL]
  Critical: [all pass / list failures]
  High: [all pass / list failures]
  Medium: [all pass / list flags]
  Tier 2 vocabulary hits: [count and list, or "clean"]
  Structural tells: [count and list, or "clean"]
  Symmetric constructions: [count]
  Paul-as-subject: [percentage]
  Wry observations: [count and locations]
  Humor mechanics present: [list with locations]
```

If any Critical check fails, do not save the video_spec. Fix the failures and re-run the gate. If multiple High checks fail, do not save. Fix and re-run. Medium flags are recorded but do not block.
```

## Change 3: Update the video_spec schema

Find the step that defines the video_spec output schema (the save step). Add the following fields to the schema:

```markdown
[Humor plan: selected mechanics with planned placement, from Step 3e]
[Voice Compliance Gate results: pass/fail with details, from Step N+1]
```

## What NOT to change

- Do not modify the existing Hook Engineering sub-sections (3a through 3d). Only add 3e after 3d.
- Do not modify the existing verification step's content. The Voice Compliance Gate is a NEW step that runs after the existing verification, not a replacement.
- Do not modify any step that was already updated by the hook engineering or lead magnet prompts. This prompt only adds new content.
- Do not add the full Tier 2 banned word list to the gate (it would bloat the skill). Reference voice-rules v2.4 Section 2A. The AI system running the skill has access to voice-rules and can look up the list.

## Verification

After making all edits:

1. Read the Hook Engineering step. Confirm section 3e exists after 3d with the humor mechanic menu table and selection rules.
2. Read the Voice Compliance Gate step. Confirm it contains Critical, High, and Medium check categories.
3. Confirm the Voice Compliance Gate is positioned AFTER all writing steps and BEFORE the save step.
4. Confirm the video_spec schema includes humor plan and voice compliance gate results.
5. Confirm steps are numbered sequentially with no gaps or duplicates.
6. Read the full file to verify no conflicts with the hook engineering or lead magnet updates.
7. Confirm no em-dashes or semicolons in the new text.
