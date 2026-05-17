# Claude Code Task: Update voice-rules v2.3 → v2.4 (Readability Mandate Integration)

## File to modify
`/Users/paul/Library/CloudStorage/Dropbox/dev-4/1-fullREFIT/content-command-center/guidelines/voice-rules.md`

**CONFIRM THIS PATH BEFORE EXECUTING.** The path above is taken from the voice-rules header. If the file has moved, Paul will provide the correct path.

Read the entire file before editing. Make surgical additions. Do not rewrite or reorganize existing sections. Preserve all existing formatting, structure, and content.

## Context

The Full Refit Humor Integration Guide v1.2 introduced a Readability Mandate (Section 0) containing operational enforcement rules that belong in voice-rules. These rules address AI vocabulary inflation (subtler than the existing hype word bans) and structural AI writing patterns (tricolon addiction, democratic sections, fake specificity, etc.). Without these rules in voice-rules, AI-produced content ships with detectable machine-authorship signals that the existing banned lists don't catch.

This update adds the Tier 2 banned vocabulary, structural AI tells, the Pub Test, and the Humor Quality Gate to voice-rules as the operational enforcement layer. The humor mechanics themselves (six named techniques, density bands, worked examples) remain in the Humor Integration Guide v1.2 as a companion reference document.

## Change 1: Add Section 2A after Section 2

After the existing Section 2 (Banned Words), add:

```markdown
## 2A. BANNED VOCABULARY — TIER 2 (AI TELLS) (NEW IN v2.4)

Section 2 bans hype words that signal "marketer." This section bans words that signal "a machine wrote this." These words are grammatically correct and technically accurate. They also appear disproportionately in AI-generated text because they were overrepresented in training data. In 2026, most of Full Refit's audience reads enough AI output to detect these patterns unconsciously.

Banned in all external content (Teaching and Positioning registers). Allowed in correspondence only when the word is genuinely the right word and no simpler alternative exists.

**Banned verbs:** delve, utilize, facilitate, harness, streamline, underscore, bolster, optimize (use "improve" or "fix"), spearhead, navigate (as metaphor), embark, unpack (as metaphor), unravel, elevate

**Banned adjectives:** multifaceted, comprehensive (use "full" or "complete"), nuanced (unless genuinely describing a specific nuance), pivotal, paramount, robust, seamless, holistic, innovative, cutting-edge, groundbreaking, compelling (unless quoting someone), bespoke, meticulous

**Banned nouns (as metaphors):** tapestry, beacon, landscape (as metaphor, e.g., "the AI landscape"), realm, journey (as metaphor), ecosystem (unless describing an actual technical ecosystem), fabric (as metaphor), mosaic, symphony, cornerstone, underpinnings

**Banned transitions and filler:** furthermore, moreover, consequently, additionally, notably, importantly, crucially, "it's worth noting," "it's important to remember," "in today's fast-paced world," "in an increasingly [X] world," "in essence," "in conclusion," "let's dive in," "let's unpack this"

**The substitution rule:** Replace every banned word with the word you'd use explaining the same thing to a friend at a bar. "Utilize" becomes "use." "Facilitate" becomes "help." "Comprehensive" becomes "full" or "complete." "Navigate the landscape" becomes "figure out what's happening." "Multifaceted" becomes "complicated" or just describe the specific facets.

**Severity:** Multiple Tier 2 violations in a single piece is a HIGH-tier failure (blocks publish). A single occurrence is flagged for revision but does not block independently.

Source: Humor Integration Guide v1.2, Section 0, Rule 0.1. This list supplements Section 2. Section 2 targets hype. This section targets AI vocabulary inflation. Together they cover the full range of words that trigger the ICA buyer's "not a real person" filter.
```

## Change 2: Add Section 3A after Section 3

After the existing Section 3 (Banned Phrases), add:

```markdown
## 3A. STRUCTURAL AI TELLS (NEW IN v2.4)

Vocabulary is the most visible AI tell. Structural patterns are harder to spot and equally damaging. These patterns are banned in all Full Refit external content.

**Tricolon addiction:** AI groups ideas in threes by default. "Clear, concise, and actionable." "Identify, evaluate, and implement." Humans break this pattern constantly. They use two items, or four, or seven. If every enumeration in a piece comes in threes, the rhythm is AI-generated. Break the threes. Use two when two is enough. Use five when the list has five things.

**Democratic section lengths:** AI gives every section roughly equal weight. Four topics, four paragraphs of the same length. Humans spend three paragraphs on what matters most and one sentence on what doesn't. Let sections be uneven. Spend words where the insight is. Skim past what's obvious.

**Fake specificity:** AI produces examples that sound concrete but aren't. "A mid-sized manufacturing company found that automating their reporting process saved significant time." Which company? What process? How much time? Real names, real numbers, real outcomes. If you can't name the company, at least name the number. If you can't name the number, don't pretend you have one. (Reinforces V&S Section IX Rule 5.)

**Uniform quality:** AI prose maintains the same level of polish from the first paragraph to the last. Human writing doesn't. Some paragraphs land harder. Some sentences are tighter. The energy peaks and dips. If every paragraph reads at the same quality level, the piece sounds generated. Let the writing be uneven. The unevenness is the human fingerprint.

**Hedged non-positions:** AI avoids taking sides. "AI can be beneficial, but it also presents challenges." "There are arguments on both sides." This is not balance. It's absence. Full Refit takes positions. "This works. That doesn't. Here's the evidence."

**Formulaic signposting:** AI announces what it's about to do before doing it. "In this section, we'll explore..." "Let's take a closer look at..." "It's worth examining..." These phrases add no information. They signal that the writer doesn't trust the content to speak for itself. Cut every signpost. Start with the substance.

Source: Humor Integration Guide v1.2, Section 0, Rule 0.3.
```

## Change 3: Add Section 3B after Section 3A

```markdown
## 3B. THE PUB TEST (NEW IN v2.4)

Read every sentence in external content out loud. If it sounds wrong coming out of your mouth, it reads wrong on the page.

This is not metaphorical. Actually say the sentence. If you stumble, the sentence is too long or too formal. If you'd never say it to a person standing in front of you, rewrite it until you would.

**Fails the pub test:**
- "It is important to note that the implementation of AI-driven automation solutions can yield significant operational efficiencies."
- "This multifaceted approach facilitates a more comprehensive understanding of the underlying dynamics."

**Passes the pub test:**
- "Most companies that set up AI automations save real time. Not always where they expected."
- "There are a few things going on at once here. Let me break them apart."

The pub test is the single most reliable defense against AI-sounding prose. For AI-produced drafts, the human review step should include reading the piece aloud. For AI systems producing drafts: write as if the sentence will be read aloud. Choose the word you'd say, not the word that sounds more polished on the page.

**Vocabulary altitude:** Content should be written at the level of a smart person who reads business books, not academic papers. The ICA buyer can understand complex ideas in plain language. They will stop reading complex ideas in complex language because they've learned that complexity usually hides a lack of substance.

Source: Humor Integration Guide v1.2, Section 0, Rules 0.2 and 0.4.
```

## Change 4: Add to the Pre-Publish Checklist (Section 16)

Find Section 16. Add the following items to the existing checklist tiers:

**Add to HIGH tier** (after the existing HIGH items):

```markdown
- [ ] **Tier 2 vocabulary scan (NEW IN v2.4): zero occurrences of Tier 2 banned words (Section 2A) in the piece. Multiple occurrences block publish. A single occurrence is flagged for revision. Run the scan against the full Tier 2 list before finalizing.**
- [ ] **Structural AI tell check (NEW IN v2.4): piece does not exhibit tricolon addiction (check that enumerations vary in length), democratic section lengths (check that sections are uneven), fake specificity (check that examples name real specifics), uniform quality (check that paragraph quality varies naturally), hedged non-positions (check that the piece takes positions), or formulaic signposting (check that no sentence announces what the next section will do). See Section 3A.**
```

**Add to MEDIUM tier** (after the existing MEDIUM items):

```markdown
- [ ] **Pub test (NEW IN v2.4): every sentence sounds natural spoken aloud. If the piece was AI-produced, the human reviewer has read the key sections aloud and confirmed they don't stumble. See Section 3B.**
- [ ] **Humor quality check (NEW IN v2.4): if humor moves are present, verify: (a) every humor move is anchored to a specific, real-world observation, (b) humor punches sideways or inward, never down at the reader, (c) humor density is inside the band for this format (see Humor Integration Guide v1.2, Section 4), (d) the "remove and read" test passes (piece is weaker without the humor, meaning the humor is doing real work). See Humor Integration Guide v1.2, Section 5.**
```

## Change 5: Add to Voice Drift Indicators (if voice-rules has a drift indicators section)

If voice-rules contains a Voice Drift Indicators section (similar to V&S Section XIV), add:

**Add to HIGH tier:**
```markdown
- Multiple Tier 2 AI vocabulary violations in a single piece (NEW IN v2.4)
- Tricolon addiction pattern (every enumeration in threes) (NEW IN v2.4)
```

**Add to MEDIUM tier:**
```markdown
- Democratic section lengths (all sections roughly equal weight) (NEW IN v2.4)
- Formulaic signposting ("In this section, we'll explore...") (NEW IN v2.4)
- Hedged non-positions on topics where Full Refit has a stated view (NEW IN v2.4)
```

If voice-rules does NOT have its own drift indicators section (deferring to V&S Section XIV instead), skip this change. The V&S update (separate prompt) will add these to Section XIV.

## Change 6: Update version and companion document references

Update the version in the header from v2.3 to v2.4. Update the date. Add to the companion documents reference:

```markdown
**Companion:** Humor Integration Guide v1.2 (humor mechanics, density bands, readability mandate source)
```

Add to the Version History table:

```markdown
| 2.4 | May 14, 2026 | Added Tier 2 AI Vocabulary Banned List (Section 2A) — 54 words that signal machine authorship, supplementing the Section 2 hype word bans. Added Structural AI Tells (Section 3A) — six structural patterns banned in external content. Added the Pub Test and Vocabulary Altitude rule (Section 3B). Added Humor Quality Gate, Tier 2 scan, Structural AI Tell check, and Pub Test to Pre-Publish Checklist (Section 16). Source: Humor Integration Guide v1.2, Section 0 (Readability Mandate) and Section 5 (Humor Quality Gate). |
```

## What NOT to change

- Do not modify Sections 1, 2, 3, or 4-14 (existing content). Only add new sections after 2 and 3.
- Do not modify the existing CRITICAL tier items in Section 16. Only add to HIGH and MEDIUM tiers.
- Do not modify Section 15 (What Never Appears).
- Do not modify Section 17 (Novelty Gate Worked Examples).
- Do not add the six humor mechanics, density band tables, or worked examples to voice-rules. Those belong in the Humor Integration Guide v1.2 as reference material. Voice-rules only needs the enforcement rules.

## Verification

After making all edits:

1. Read back Sections 2A, 3A, and 3B to confirm they're correctly placed after their respective parent sections.
2. Read back Section 16 to confirm the four new checklist items are in the correct tiers.
3. Confirm the version says v2.4 in the header.
4. Confirm the Humor Integration Guide v1.2 is listed in companion documents.
5. Confirm no existing sections were modified.
6. Count the Tier 2 banned words in Section 2A. There should be 14 verbs, 14 adjectives, 12 nouns, and 14 transitions/filler phrases.
7. Count the structural AI tells in Section 3A. There should be six named patterns.
8. Read the full file to verify formatting consistency and confirm no inadvertent em-dashes or semicolons were introduced in the new sections.
