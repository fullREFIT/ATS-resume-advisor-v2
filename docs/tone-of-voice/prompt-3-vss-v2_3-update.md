# Claude Code Task: Update Voice & Style System v2.2 → v2.3 (Humor Integration)

## File to modify
`/Users/paul/Library/CloudStorage/Dropbox/1-full-REFIT-db/founder-context/5-fullrefit-voice-style-system-v2.2.md`

**CONFIRM THIS PATH BEFORE EXECUTING.** Path inferred from the founder-context directory listing. If incorrect, Paul will provide the actual path.

Read the entire file before editing. Make surgical additions. Do not rewrite or reorganize existing sections. Preserve all existing formatting, structure, and content.

## Context

V&S v2.2 Section IX (Personality Operationalization) introduced earned wryness, second-time-through observations, fourth-wall breaks, and specificity-as-personality. These rules work for bounding personality but don't teach a system how to produce humor. The Humor Integration Guide v1.2 provides six named mechanics that operationalize Section IX's rules. V&S needs to reference those mechanics so any instance reading V&S knows they exist and where to find them.

Separately, the Humor Integration Guide v1.2 Section 0 (Readability Mandate) introduced Tier 2 banned vocabulary and structural AI tells. The operational enforcement lives in voice-rules v2.4. V&S needs a foundational reference to the Readability Mandate so the conceptual framework is visible alongside the personality rules.

## Change 1: Add a Readability Mandate reference before Section IX

Before Section IX (Personality Operationalization), add a brief new subsection. If there's a natural break point (a horizontal rule or section divider before IX), insert this just before it:

```markdown
## VIII-A. THE READABILITY MANDATE (NEW IN v2.3)

Every rule in Section IX (Personality Operationalization) and every humor mechanic in the Humor Integration Guide v1.2 sits on top of a foundational requirement: the prose must sound like a person wrote it.

AI-generated content that passes all voice rules can still read as machine-authored if the vocabulary is inflated ("utilize" instead of "use," "facilitate" instead of "help") or the structure follows AI-default patterns (tricolon groupings, democratic section lengths, hedged non-positions). The ICA buyer's filters catch these signals. When they do, trust dies before the content has a chance to teach anything.

The operational enforcement of the Readability Mandate lives in voice-rules v2.4 (Sections 2A, 3A, 3B). The principle is simple: write at the level of a smart person talking to a colleague at a bar. Choose the shorter word. Break the three-item pattern. Let sections be uneven. Take positions instead of hedging. Cut every sentence that announces what the next section will do.

Personality operationalization (Section IX) only works inside prose that already sounds human. If the prose fails the readability test, no amount of wry observations or fourth-wall breaks will save it. Fix the prose first. Add personality second.

Source: Humor Integration Guide v1.2, Section 0.
```

## Change 2: Expand Section IX to name the six mechanics

Find Section IX (Personality Operationalization). After the introductory paragraphs that describe what Section IX addresses (the gap between voice description and personality production), and before Rule 1 (Earned Wryness Only), add:

```markdown
### The Six Humor Mechanics (NEW IN v2.3)

The Humor Integration Guide v1.2 identifies six specific humor mechanics compatible with the Full Refit voice. These are the tools that produce earned wryness (Rule 1), operationalize the second-time-through pattern (Rule 3), and execute fourth-wall breaks (Rule 4). They are listed here for reference. For detailed specs, compatibility checks, density bands, worked examples, and AI implementation notes, see the Humor Integration Guide v1.2.

1. **The Deadpan Catalog.** List what actually happens in a process with the same neutral tone you'd use for a legitimate workflow. The humor comes from the accuracy, not from editorial commentary. (Operationalizes Rules 1 and 3.)

2. **The Parenthetical Confession.** Make a confident claim, then undermine or qualify it in parentheses with a more honest statement. The parenthetical contains what you'd actually say to a friend. (Operationalizes Rules 1 and 4.)

3. **The Quiet Reframe.** State a common industry belief, then restate the actual situation in plain language. No editorial. No "but the truth is." Just the two statements next to each other. The gap is the joke. (Operationalizes Rules 1 and 3. Closest to Seth Godin's style and the most natural fit for Full Refit.)

4. **The Earned Admission.** Admit something unflattering about your own profession, product category, or experience that the reader was already thinking. Targets the role, never the person's competence. (Operationalizes Rule 1.)

5. **The Straight-Faced Understatement.** Describe a significant outcome with deliberately insufficient emphasis. The reader fills in the actual weight. (Operationalizes Rules 1 and 5.)

6. **Stealing Thunder.** Name the reader's active objection or skeptical thought before they can hold it against you. Different from Earned Admission (which admits something about yourself). Stealing Thunder names what the reader is thinking about you or your category. Highest-leverage mechanic for differentiating Full Refit from other AI consultancies. (Operationalizes Rules 1 and 4.)

**Incompatible mechanics (do not use):** Sarcasm, extended comic riffs, invented scenarios, pop culture references, self-deprecation about competence, ironic quotation marks. See Humor Integration Guide v1.2, Section 3.

**Density:** The limits in Rules 2 and X Rule 3 remain the upper bound. The Humor Integration Guide v1.2, Section 4 provides per-mechanic density tables by format. When Section IX and the humor guide conflict on density, Section IX's bands control.
```

## Change 3: Update Section IX Rule 1 with a mechanic cross-reference

Find Rule 1 (Earned Wryness Only). After the existing test ("if the wry observation could be deleted and replaced with a generic 'most companies get this wrong,' it isn't earned"), add one sentence:

```markdown
The six humor mechanics above are the specific tools for producing earned wryness. Specificity (Rule 5) is always the cheapest move. Quiet Reframes and Straight-Faced Understatements come next. Stealing Thunder and Deadpan Catalogs are higher-risk, higher-reward. Parenthetical Confessions and Earned Admissions are one-per-piece maximum.
```

## Change 4: Update Section XIII Quality Gates

Find Section XIII (Quality Gates). In the Personality Gates subsection, after the existing items, add:

```markdown
### Readability Gates (NEW IN v2.3)
- Piece passes the Tier 2 vocabulary scan (voice-rules v2.4, Section 2A)? Zero AI-default vocabulary?
- Piece free of structural AI tells (tricolon addiction, democratic sections, fake specificity, uniform quality, hedged non-positions, formulaic signposting)?
- Pub test: would every sentence sound natural read aloud?

### Humor Gates (NEW IN v2.3)
- If humor is present: every move anchored to a specific real-world observation?
- Humor punches sideways or inward, never down at the reader?
- Humor density inside the band for this format (Section IX Rule 2 / Humor Integration Guide v1.2 Section 4)?
- The "remove and read" test: piece is weaker without the humor (humor is doing real work)?
- No humor signaling (no editorial commentary after a humor move)?
```

## Change 5: Update Section XIV Voice Drift Indicators

Find Section XIV (Voice Drift Indicators). Add the following items to the existing tiers:

**Add to HIGH tier:**
```markdown
- Multiple Tier 2 AI vocabulary violations (voice-rules v2.4, Section 2A) (NEW in v2.3)
- Tricolon addiction pattern: every enumeration in the piece comes in groups of three (NEW in v2.3)
- Humor that signals itself: editorial commentary after a humor move ("The irony is...") (NEW in v2.3)
```

**Add to MEDIUM tier:**
```markdown
- Democratic section lengths: all sections within 20% of the same word count (NEW in v2.3)
- Formulaic signposting: "In this section, we'll explore..." (NEW in v2.3)
- Hedged non-positions on topics where Full Refit has a stated view (NEW in v2.3)
- Fake earned admissions: self-deprecation that could apply to any consultant in any field (NEW in v2.3)
```

## Change 6: Update Section XV Voice Summary

Find Section XV (Voice Summary). Find the line about Humor:

```
**Humor:** Dry, observational, aimed at AI hype and industry absurdity. Never at the reader. Disappears entirely in serious correspondence. The seriousness is the voice.
```

Replace with:

```markdown
**Humor:** Dry, observational, aimed at AI hype and industry absurdity. Never at the reader. Disappears entirely in serious correspondence. Six named mechanics: Deadpan Catalog, Parenthetical Confession, Quiet Reframe, Earned Admission, Straight-Faced Understatement, Stealing Thunder. Density bounded per format. The goal is not to be funny. The goal is to sound like someone who finds the AI industry genuinely absurd and respects the reader too much to pretend otherwise. (See Section IX and Humor Integration Guide v1.2.)
```

Also update the Personality line:

Find:
```
**Personality (v2.2):** Earned wryness, second-order observations, occasional fourth-wall breaks, specificity as default. Bounded density per piece. Read flat, let words do the work. (See Section IX.)
```

Replace with:
```markdown
**Personality (v2.3):** Earned wryness via six named mechanics, second-order observations, occasional fourth-wall breaks, specificity as default. Bounded density per piece. Read flat, let words do the work. All personality sits on top of the Readability Mandate: prose must sound human before personality is added. (See Section VIII-A, Section IX, and Humor Integration Guide v1.2.)
```

## Change 7: Update Section XVI Relationship to Other Documents

Find Section XVI (Relationship to Other Documents). Add a new row to the table:

```markdown
| **Humor Integration Guide v1.2** (NEW) | Humor mechanics, density bands, readability mandate | Companion to V&S Section IX. The six humor mechanics operationalize earned wryness. Section 0 (Readability Mandate) is the foundational layer referenced in Section VIII-A. Operational enforcement in voice-rules v2.4. |
```

Update the voice-rules row to reference v2.4:

Change `voice-rules.md v2.2` to `voice-rules.md v2.4` and update the description to include: "v2.4 adds Tier 2 AI vocabulary bans, structural AI tells, pub test, and humor quality gate."

## Change 8: Update version references

Update the header:
- Version: 2.3
- Supersedes: Voice & Style System v2.2
- Add to Companion Documents: "Humor Integration Guide v1.2"
- Update voice-rules reference from v2.2 to v2.4

Add to the Version History table:

```markdown
| 2.3 | May 2026 | Added Section VIII-A (Readability Mandate reference). Expanded Section IX to name the six humor mechanics from Humor Integration Guide v1.2 with cross-references to existing rules. Updated Section XIII with Readability Gates and Humor Gates. Updated Section XIV with seven new drift indicators (Tier 2 vocabulary, tricolon addiction, humor signaling, democratic sections, formulaic signposting, hedged non-positions, fake earned admissions). Updated Section XV Voice Summary with named mechanics and readability mandate reference. Added Humor Integration Guide v1.2 to Section XVI document table. Updated voice-rules companion reference to v2.4. |
```

Add to the Changelog table at the top:

```markdown
## CHANGELOG: v2.2 → v2.3

| Change | Section | Rationale |
|---|---|---|
| Added Section VIII-A: The Readability Mandate | New section before IX | AI-generated prose can pass all voice rules and still read as machine-authored. The Readability Mandate establishes that human-sounding prose is the foundation all personality rules sit on top of. Operational enforcement in voice-rules v2.4. Source: Humor Integration Guide v1.2, Section 0. |
| Named the six humor mechanics in Section IX | Section IX (expanded) | V&S v2.2 told systems WHEN personality is allowed and HOW MUCH, but not HOW TO PRODUCE IT. The six mechanics from Humor Integration Guide v1.2 are the specific tools for producing earned wryness. Listing them in Section IX closes the gap between "personality is required" and "here are the moves available." |
| Added Readability and Humor Gates | Section XIII | Quality gates now check for Tier 2 vocabulary, structural AI tells, pub test compliance, and humor quality. |
| Added seven new drift indicators | Section XIV | Tier 2 vocabulary, tricolon addiction, humor signaling, democratic sections, formulaic signposting, hedged non-positions, and fake earned admissions are now flagged as voice drift. |
| Updated Voice Summary | Section XV | Humor and Personality entries now reference named mechanics and the Readability Mandate. |
| Added Humor Integration Guide v1.2 to document table | Section XVI | Formal companion document relationship established. |
```

## What NOT to change

- Do not modify Sections I through VIII. They are correct.
- Do not modify Section IX Rules 2-5 (density bands, second-time-through, fourth-wall breaks, specificity). Only add the mechanics listing before Rule 1 and the cross-reference sentence after Rule 1.
- Do not modify Section X (Teleprompter Script Calibration). It is correct.
- Do not modify Sections XI or XII.
- Do not duplicate the full humor guide content. Section IX gets the six mechanic names with one-line descriptions. The detail stays in the humor guide.
- Do not modify the existing changelog entries (v1.0 to v2.2). Only add the new v2.2 to v2.3 changelog.

## Verification

After making all edits:

1. Read Section VIII-A. Confirm it references voice-rules v2.4 and Humor Integration Guide v1.2.
2. Read Section IX. Confirm the six mechanics are listed with one-line descriptions before Rule 1, and the cross-reference sentence appears after Rule 1's test.
3. Read Section XIII. Confirm Readability Gates and Humor Gates subsections exist.
4. Read Section XIV. Confirm three new HIGH-tier and four new MEDIUM-tier indicators.
5. Read Section XV. Confirm the Humor and Personality lines are updated.
6. Read Section XVI. Confirm the Humor Integration Guide row exists in the table.
7. Confirm the version says 2.3 in the header and the changelog.
8. Confirm no em-dashes or semicolons were introduced in the new text.
9. Read the full file to verify formatting consistency.
