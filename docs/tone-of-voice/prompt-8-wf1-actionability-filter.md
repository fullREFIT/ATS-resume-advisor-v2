# WF1 Actionability Filter

**Date:** May 13, 2026
**Purpose:** Adds an explicit actionability gate to the WF1 idea gate. Prevents concept-only ideas from entering the production pipeline as teaching videos.
**Triggered by:** Bottleneck Relocation script post-mortem (May 13, 2026). The existing five filters (audience_fit, business_relevance, execution_reality, insight_depth, retention_visual) did not catch a concept that scored well on insight depth but had zero actionable takeaway.
**Implementation target:** WF1 idea gate skill (`/mnt/skills/user/wf1-idea-gate/SKILL.md`)

---

## The Problem This Solves

The current WF1 gate evaluates ideas on five dimensions. An idea can score well on all five while being entirely non-actionable. "Bottleneck relocation" is intellectually interesting to Marcus, relevant to his business, and visually retainable. It is also a concept, not a method. The viewer walks away understanding something new but unable to do anything new.

Insight depth and actionability are not the same thing. The gate currently conflates them. This filter separates them.

---

## Filter Definition

### New filter: `actionability`

Added as the sixth scoring dimension in WF1, evaluated after `insight_depth`.

**Scoring question:** What specific method, process, tool, diagnostic, or skill does the viewer gain from this video that they can use within one week of watching?

**Scoring rubric:**

| Score | Label | Definition |
|---|---|---|
| 5 | Immediately implementable | Viewer can execute the method during or immediately after the video. Time investment is stated. Success criteria are defined. Example: IDEA-13 (delegation audit with three-part test and four-part context transfer). |
| 4 | Implementable with minor setup | Viewer needs to gather one input (a file, a prompt library, a calendar) before executing. Method is complete. Example: IDEA-14 (prompt audit requiring existing prompt library). |
| 3 | Actionable with adaptation | Viewer gets a framework that requires interpretation for their specific context. The framework has concrete steps but the viewer has to decide which apply. Acceptable for long-form. Flag in review. |
| 2 | Diagnostic only | Viewer gets a way to identify a problem but not a method to solve it. Acceptable for shorts or LinkedIn posts. Not sufficient for long-form teaching video with FRAMEWORK section. |
| 1 | Concept only | Viewer gains understanding of a model, theory, or way of thinking. No method taught. Not acceptable for Tier 1-2 teaching content in any format longer than 90 seconds. |

**Pass threshold:** Score of 3 or higher for long-form teaching videos. Score of 2 or higher for shorts.

**Failure routing:**

- Score of 1 or 2 on a long-form idea: the idea is reclassified as positioning content (Tier 4-5) and routed to LinkedIn or short-form. Alternatively, the idea is sent back for reframing with a required actionable component before re-evaluation.
- Score of 1 on a short-form idea: the idea is killed or reclassified as a LinkedIn post.

---

## Validation Tests

Three tests run during scoring to verify the actionability claim.

### Test 1: The Monday Test

**Question:** State in one sentence what Marcus can do on Monday that he could not do on Friday before watching this video.

**Pass:** The sentence describes a specific action with a verb. "Run a three-part test on his team's recurring tasks." "Rewrite his most-used prompt as an outcome spec." "Audit one process against a cost-of-protection benchmark."

**Fail:** The sentence describes a way of thinking. "Understand that bottlenecks relocate." "Think differently about planning processes." "Recognize where his company is stuck." These are insights, not capabilities.

### Test 2: The WTODN Test

**Question:** Can you write a WTODN section that gives the viewer a specific first move with a defined time investment and a success criterion?

**Pass:** "Pull up last week's calendar. Run the three-part test. Write one context transfer. Takes fifteen minutes. Success: one task running without you by end of week."

**Fail:** "Pick one process and ask yourself whether it's more expensive than the mistake it prevents." This is a thought exercise. There is no defined time investment, no method for answering the question, and no success criterion.

### Test 3: The Screen Share Test

**Question:** Is there something the viewer would benefit from seeing you do on screen during the FRAMEWORK section?

**Pass:** A live walkthrough of the method applied to a real example. A side-by-side comparison. A diagnostic annotation on a real artifact. Something that shows the method in action.

**Fail:** A diagram, a timeline, or a conceptual visual. These support understanding but do not demonstrate a method. If the best screen share you can design is a graphic rather than a demonstration, the framework may not be actionable.

---

## Integration with Existing Filters

The actionability filter runs after `insight_depth` and before final verdict. The relationship between the two:

- An idea can have high insight depth and low actionability. This is a concept. Route to positioning content or reframe.
- An idea can have low insight depth and high actionability. This is a tip. Acceptable for shorts. Probably too thin for long-form unless combined with context that elevates the insight.
- An idea with high insight depth AND high actionability is a strong teaching video. This is the target.

The actionability score does not replace `execution_reality`. Execution reality asks "can we produce this?" Actionability asks "will the viewer gain a capability?" Both must pass.

---

## Concept Packet Output

When the actionability filter runs, the concept packet (concept_packet.md) includes:

```
actionability_score: [1-5]
monday_test: "[one sentence: what Marcus does Monday]"
wtodn_preview: "[2-3 sentences: the first move, time investment, success criterion]"
screen_share_type: "[demonstration | diagnostic | comparison | conceptual | none]"
```

If the score is 2 or below for long-form, the concept packet also includes:

```
actionability_routing: "[reclassify as positioning | reframe with method | kill]"
reframe_suggestion: "[if applicable: what actionable component could be added]"
```

---

## Examples

### Would have been caught (score 1, killed):

**Idea:** Bottleneck relocation. When execution gets cheap, the bottleneck moves to clarity, boldness, distribution, relationships.
**Monday test:** "Understand that bottlenecks relocate." FAIL. This is insight, not capability.
**WTODN test:** "Pick one process and ask if it's more expensive than the mistake it prevents." FAIL. Thought exercise, no method.
**Screen share test:** Timeline comparison graphic. FAIL. Conceptual visual, not a demonstration.
**Score:** 1 (concept only)
**Routing:** Kill as long-form. Reframe option: pair the concept with a 15-minute process audit method. The concept becomes the 90-second CONTEXT section. The audit method becomes the FRAMEWORK.

### Would have passed (score 5, produced):

**Idea:** Delegation audit. Teams that get value from AI built delegation literacy through structured audits of actual weekly work.
**Monday test:** "Run the three-part test on one team member's recurring tasks and write one context transfer." PASS.
**WTODN test:** "Pick one person. Open last week's calendar. Run describable/verifiable/repeating. Write the four-part context transfer for the first task that passes. Fifteen minutes. Success: one task running without them." PASS.
**Screen share test:** Live walkthrough of a calendar and task list, annotating which tasks pass the test. PASS. Demonstration of method.
**Score:** 5 (immediately implementable)

### Would have passed (score 4, produced):

**Idea:** Outcome specs vs process prompts. Removing procedural instructions and replacing them with situation, desired output, and constraints.
**Monday test:** "Rewrite his team's most-used prompt as an outcome spec and compare output quality." PASS.
**WTODN test:** "Pull three most-used prompts. Count process vs outcome sentences. Strip process from the dominant one. Run comparison. Twenty minutes." PASS.
**Screen share test:** Side-by-side prompt comparison with output quality visible. PASS. Demonstration.
**Score:** 4 (implementable with minor setup, requires existing prompt library)
