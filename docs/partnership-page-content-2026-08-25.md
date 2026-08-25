# Tribune Trading Partnership Page: Content and Layout Reference

Prepared 2026-08-25. Source files: `partnership/index.html`, `assets/partnership.css`, `assets/partnership.js`.

## 1. Page Overview

**URL path:** `/partnership/`

**Access model:** The page is gated by a server-side password wall enforced at the Cloudflare edge inside `_worker.js`. There is no client-side gate to bypass. Three independent gates exist on the site (`/techstack/`, `/partnership/`, `/milestones/`), each with its own password, cookie name, and HMAC secret, so a leak or rotation on one gate has no effect on the others. The `/partnership/` gate uses the cookie `__Secure-tt_partner_gate`, scoped to the `/partnership` path. Access works like this: a visitor submits the password on a server-rendered form, the worker checks it with a timing-safe comparison, and on success it issues a signed session token built from an HMAC-SHA256 signature over the path prefix and the current calendar week. That token is set as an `HttpOnly`, `Secure`, `SameSite=Lax` cookie with a multi-day max age. On every subsequent request, the worker recomputes the expected HMAC for the current week (and the previous week, to allow a grace period across the weekly rotation boundary) and compares it against the cookie. Because the signature depends on the week number, a valid cookie effectively expires and re-derives on a weekly rotation, so a leaked cookie loses validity on its own even if it is not explicitly revoked.

**Purpose:** The page is a persuasive, narrative partnership and development roadmap document. It proposes a joint venture, Tribune Trading LLC, between Stan (a veteran trader contributing decades of market knowledge) and Tribune Inc. (the software/AI company founded by Ryan and Jeff). It lays out the ownership structure, the case for dedicated development funding, an IP ownership framework separating the reusable technology platform from the trading-specific product, a right-of-first-opportunity principle for new markets, and a three-month build plan (Month 1: See + Act, Month 2: Understand + Decide, Month 3: Test + Prove) culminating in a validation ladder toward eventual live capital.

**Intended audience:** Invited reviewers only, specifically Stan and any other named participants in this specific partnership conversation. The page is explicitly marked "Confidential, for invited reviewers" and is set to `noindex, nofollow` for search engines. It is designed to be walked through live in a partnership meeting rather than read cold, and it includes a live interactive exercise (the Market Territory Board) intended to be operated together with the reviewer during that meeting.

## 2. Verbatim Page Content

### Top bar

Confidential &middot; For invited reviewers (rendered as: Confidential, For invited reviewers)

Tribune Trading Partnership: 60 to 90 Day Roadmap

### Header navigation

TRIBUNE (wordmark, links to /)

Home

About

Reach out

### Section 1: Hero

# Turning 30+ Years of Trading Experience Into a Scalable Trading Intelligence System

Partnership & Development Roadmap

Stan brings decades of market-reading experience: pattern recognition, order-flow interpretation, and judgment built from thousands of hours at the screen. Tribune brings the software, automation, and agentic AI infrastructure required to turn that judgment into a system that runs on its own. Neither side could build this alone.

**Flow diagram (three nodes connected by arrows):**

Stan / Knowledge &rarr; Tribune / Technology &rarr; Together / Scalable System

(rendered as: Stan, Knowledge, then an arrow, then Tribune, Technology, then an arrow, then Together, Scalable System)

### Section 2: The Partnership, Two Forms of Capital

The partnership

## Two Forms of Capital, One Company

This partnership combines two different forms of capital: decades of specialized trading knowledge and the technology required to capture, encode, test, automate, and scale it.

**Card: Stan**

### Stan

30+ YEARS

Trading experience: the knowledge capital

- 30+ years of live market experience across cycles and conditions
- Pattern recognition built from thousands of hours of screen time
- Order-flow and TickStrike interpretation
- Type 1 / Type 2 divergence interpretation in real time
- Fibonacci and contextual market-structure judgment
- A defined trading methodology that becomes machine-readable rules
- Live demonstrations and ongoing validation as training material

Knowledge capital

**Card: Tribune**

### Tribune

RYAN + JEFF

Agentic infrastructure and founder time: the technology capital

- **Jeff:** long-term software and technology background, product/project management, engineering discipline, AI architecture, agentic systems, multimodal AI & automation, translating human workflows into software
- **Ryan:** entrepreneurship, real estate and markets, asset-management and business experience, sales/commercialization, partnership development, product and business strategy, agentic AI development experience

**Evidence already built:** Tribune's agent architecture, C-Suite agent systems, the Cursus Honorum organizational agent architecture, Senate/governance concepts, healthcare AI work, and reusable agent/automation infrastructure already running in production.

Technology + time capital

**Converge block:**

Tribune Trading LLC

50% Stan | 50% Tribune Inc.

Trading knowledge + technology + execution = jointly created trading company

**Status badge:** Agreed in principle

This proposed structure is a starting point for discussion, not a signed operating agreement.

### Section 3: Continuity, Not a Rewrite

Continuity, not a rewrite

## The Original Understanding Still Holds

Nothing below changes what was already agreed. It refines how much concentrated time the build actually requires: something that only became clear once the technical discovery work started.

**Card: Original Understanding**

**Status badge:** Agreed in principle

### Original Understanding

**Stan** Knowledge + continued trading participation

**Tribune** Technology + development work

**Card: What We Learned During Technical Discovery**

**Status badge:** Proposed

### What We Learned During Technical Discovery

The original concept remains valid. What changed is our understanding of the *concentration* and *development time* the build actually requires.

Technical investigation points to roughly two months of concentrated development for the core build, with a possible third month for validation, refinement, latency work, and edge cases.

The real question isn't whether Tribune contributes time. Tribune does. It's whether Ryan and Jeff can devote that time **primarily** to this project, or must divide it across other income-producing work.

### Section 4: Three Investments Into One Company

The funding refinement

## Three Investments Into One Company

Development funding is a third, separate input, not a purchase of equity. It funds the runway, not the ownership split.

**Investment column 01**

01

### Knowledge Capital

**Stan:** 30+ years of trading experience, methodology, and live validation.

**Investment column 02**

02

### Technology + Time Capital

**Tribune:** Ryan and Jeff's concentrated founder time, plus existing technology and AI infrastructure already built and running.

**Investment column 03**

03

### Development Capital

**Initial funding:** provides development runway so founders can prioritize the build instead of financing the period through unrelated work.

**Converge block:**

Tribune Trading LLC

50% Stan | 50% Tribune Inc.

**Note block:**

**Important:** development funding does not buy Tribune's 50%, and it is not payment to Ryan or Jeff for ownership. It provides development runway so Tribune can contribute its side of the partnership at the intensity the proposed build requires.

### Section 5: Development Funding

Funding the build

## Development Funding

Two ways to fund the expected core development period. Target core prototype: approximately two months. A third development month may be used for validation, refinement, and hardening where justified by the results.

**Card: Milestone model (pill: Recommended)**

Recommended

Milestone model

$12,500 / development month

Fund one stage at a time. Review tangible progress. Continue when the results justify the next stage.

- Month-to-month: no automatic multi-month commitment
- Tangible deliverables every development month
- Visible progress reviewed before funding the next stage
- Expected core development period: roughly two months
- Optional third month for validation and refinement
- The project moves as fast as technically possible, not stretched to fill a billing period

**Gate timeline:** Month 1, Review, Month 2, Review, Optional Month 3

Each review point is a deliberate gate, not a formality.

**Card: Fixed commitment (pill: Alternative)**

Alternative

Fixed commitment

$25,000

Fund the expected two-month core development period upfront.

- Roughly two months of concentrated development
- Maximum continuity through the core build
- Maximum founder availability, with no divided attention
- Budget certainty for the entire core build
- No monthly funding decision during the initial core build

### Section 6: Without Dedicated Development Funding

**Panel: Without Dedicated Development Funding**

Without dedicated development runway, Ryan and Jeff would need to continue prioritizing outside income-producing work. That likely means fragmented schedules, slower iteration, and a less predictable timeline.

Same ambition. Different development velocity.

### Section 7: Ownership Structure

Structure

## Ownership Structure

Ownership of the trading venture is deliberately distinct from ownership of Tribune's underlying reusable technology platform.

**Ownership tree diagram:**

Tribune Inc.

Parent technology company &middot; Ryan + Jeff, founders &middot; reserved pool for future strategic participation / investment

(rendered as: Parent technology company, Ryan + Jeff, founders, reserved pool for future strategic participation / investment)

50% (connecting stat between the two boxes)

Tribune Trading LLC

50% &middot; Stan (rendered as: 50%, Stan)

50% &middot; Tribune Inc. (rendered as: 50%, Tribune Inc.)

Tribune Trading LLC is jointly owned by Stan and Tribune Inc. Tribune Inc. retains its own separate technology platform, which is not owned or diluted by the trading venture.

**Status badge:** Agreed in principle

### Section 8: The IP Model, Factory vs. Product

Proposed framework

## The IP Model: Factory vs. Product

This is a proposed framework, not yet a signed legal agreement, and not a definitive statement of IP ownership. It is meant to let both sides reason clearly about what belongs where before anything is memorialized in signed documents.

**Card: Tribune Inc., The Technology Factory**

Tribune Inc.

### The Technology Factory

- General agent architecture and model orchestration
- Computer-vision pipelines and video ingestion
- Multimodal processing and memory systems
- Generic automation / execution infrastructure
- Training and evaluation infrastructure
- Reusable software libraries
- Governance and multi-agent architecture
- General trading-analysis technology not derived from protected Stan methodology
- Non-trading applications

**Card: Tribune Trading LLC, The Joint Trading Product**

Tribune Trading LLC

### The Joint Trading Product

- Stan-derived trading methodology
- Jointly developed signal combinations
- Trading-specific labeled datasets created for the venture
- Implementation of Stan-derived market logic
- Jointly developed trading strategies
- Defined markets assigned to Tribune Trading
- Product-specific refinements and validated trading behavior

Tribune needs to retain the ability to reuse its general technology across other verticals. The trading product retains everything specific to Stan's methodology and to what the two sides build together for this venture.

**Status badge:** Proposed framework, not final legal language

### Section 9: Market Territory Board (interactive)

Live exercise

## Market Territory Board

Drag any market into **Tribune Trading LLC** or **Tribune Inc.**, or leave it in the neutral zone. This is meant to be used live in the partnership meeting to explore the boundaries together. Nothing here is saved or final.

**Zone: Tribune Trading LLC** (starting card: NASDAQ / NQ Futures)

**Zone: Tribune Inc.** (starting cards: Non-Trading Applications, Future AI Verticals)

**Zone: To Decide Together** (starting cards: S&P / ES Futures, Dow / YM Futures, Russell / RTY Futures, Gold, Silver, Crude Oil, Other Commodities, Bitcoin, Crypto Markets, Forex, Individual Equities, Equity Options, Index Options, International Equity Indices, Volatility Products, Treasury / Rate Futures, Other Futures Markets)

Drag a card, or tap a card then tap a zone on touch devices.

**Button:** Reset to starting proposal

### Section 10: Proposed Market Principle

"If a new market materially depends on Stan's methodology or jointly developed Tribune Trading IP, Tribune Trading should have the first opportunity to develop that market."

This protects Stan's contribution without giving Tribune Trading automatic ownership of every future Tribune AI application.

**Status badge:** Proposed commercial principle

### Section 11: Right of First Opportunity

Decision tree

## Right of First Opportunity

When Tribune identifies a new trading market that materially applies Stan's methodology or joint IP, this is the proposed sequence for deciding who develops it.

**Step 1**

#### Offer to Tribune Trading first

Any new trading market materially dependent on Stan's methodology or joint IP is offered to Tribune Trading before anything else.

**Step 2**

#### Partners evaluate fit

Both sides assess whether the new market fits Tribune Trading's focus, capacity, and current roadmap.

**Step 3**

#### Accepted or declined

Either Tribune Trading develops the market, or the opportunity passes back to Tribune Inc. under defined conditions.

**Branch 3A, Accepted**

3A &middot; Accepted (rendered as: 3A, Accepted)

Develop through Tribune Trading LLC, under the existing 50/50 structure.

**Branch 3B, Declined / out of field**

3B &middot; Declined / out of field (rendered as: 3B, Declined / out of field)

Tribune Inc. may pursue it independently, subject to not using protected Stan-specific methodology or protected Tribune Trading IP outside agreed rights.

**Status badge:** Proposed commercial principle, not final legal language

### Section 13: Future Tribune Inc. Alignment

Separate from the funding decision

## Future Tribune Inc. Alignment

Stan's primary ownership is his 50% in Tribune Trading LLC. This is a separate, later conversation, not part of the $12,500 / $25,000 development funding decision above.

**Card: Future access**

Future access

### Right to invest later, at an agreed valuation

If the partnership develops successfully, Stan and Tribune Inc. may separately discuss Stan investing directly in Tribune Inc. at a valuation agreed upon at that time. No specific percentage or valuation is promised here or implied by anything above.

**Status badge:** Future opportunity, not yet agreed

### Section 14: Commercial Endgame

Where this can go

## Where This Could Go

**Endgame strip:** Build &rarr; Prove &rarr; Scale (rendered as: Build, Prove, Scale)

**Branch cards:**

Trade: Use the system directly

License: To selected traders or institutions

Profit Share: Performance-based participation

Institutional Partnership: Deeper commercial relationship

Strategic Acquisition: Sell some or all, if economics justify it

We do not need to choose the final commercialization model today. The first objective is to build something worth choosing a commercialization model for.

### Section 15: Month 1, See + Act

The build, month one

## Month 1: See + Act

Teach the system to see. Build the hands.

**Track A: Perception**

Track A

### Perception

What the system learns to read from a recorded trading session.

- Charts and price movement
- S949
- Divergence
- Fibonacci
- TickStrike visual state
- TickStrike audio
- Cursor and order actions
- Entries and exits
- Spoken commentary
- Timing
- Deliberate non-entries

**Monospace flow block:**

```
RAW TRADING SESSION
Video + Audio + Screen + Actions + Commentary
↓
PERCEPTION ENGINE
↓
09:47:12.480
Price Structure: Uptrend
S949: Rising
Divergence: Type 1
Fibonacci: 61.8%
TickStrike: Buyers accelerating
Position: Flat
Trader Action: No trade
```

**Track B: Execution**

Track B

### Execution

Proving the machine can carry out a trading instruction, in simulation.

**Monospace flow block:**

```
SIMULATED COMMAND
BUY 1 NQ
↓
RISK / EXECUTION ADAPTER
↓
NINJATRADER / BROKER INTERFACE
↓
ORDER EXECUTED IN SIMULATION
```

This is not yet the trading intelligence. It proves that once the system produces an approved trading instruction, the machine can carry it out automatically in a simulated environment.

**Milestone block:**

### The Machine Can See the Trading Environment and Act Inside It

**Complete card: Perception Prototype**

Perception Prototype

Turns recorded trading sessions into structured, machine-readable market state.

**Complete card: Execution Prototype**

Execution Prototype

Can place, modify, and exit simulated trades automatically.

**Not-yet list:**

- Does it reliably understand Stan's methodology?
- Does it know when not to trade?
- Can it make independent trading decisions?
- Is it ready for real capital?

### Section 16: The Hands and the Brain

How the pieces fit

## The Hands and the Brain

**Column: The Hands**

The Hands

Demonstrable early

1. Receive command
2. Check risk
3. Place trade
4. Verify fill
5. Manage position

**Column: The Brain**

The Brain

The core research problem

1. Observe
2. Understand context
3. Recognize method
4. Reject false signal
5. Decide

**Converge block:**

The Brain + The Hands

Complete Trading System

Sending a buy or sell command is not the hardest problem. The harder problem is teaching the machine when the method actually calls for that action.

### Section 17: Month 2, Understand + Decide

The build, month two

## Month 2: Understand + Decide

Teach the system the method.

**Callout:** What happened is not always the same as what should have happened.

**Method table (two columns, header row plus four paired rows):**

What Happened | What the Method Said

Entry | Entry

Entry | No Trade

Exit | Exit

No Trade | Entry

**Legend:**

- OK: Correct trade
- !: Premature or emotional entry
- OK: Correct exit
- !: Missed valid setup
- OK: Correct no-trade
- !: Near-signal rejected incorrectly

The training target is the method, not simply Stan's historical behavior. The system must learn correct trades, incorrect trades, missed trades, false signals, near-signals, ambiguous conditions, and disciplined no-trade periods.

**Restraint callout:**

Restraint Is Training Data

A system trained only on entries has never been shown what disciplined inaction looks like. Correct no-trade periods are therefore part of the method, not empty space between trades.

**Monospace block (Month 1 vs Month 2 pipeline comparison):**

```
Month 1
SEE → HUMAN / TEST COMMAND → ACT
↓
Month 2
SEE → UNDERSTAND → DECIDE → RISK CHECK → ACT
```

**Monospace block (system pipeline):**

```
OBSERVE
↓
STRUCTURED STATE
↓
METHOD MODEL
↓
DECISION ENGINE
↓
INDEPENDENT RISK CONTROLLER
↓
SIMULATED EXECUTION
↓
RESULT + FEEDBACK
```

**Monospace block (example system decision):**

```
Example System Decision

09:47:12.480
S949: Rising
Price: Falling
Divergence: Type 1
Fibonacci: 61.8%
TickStrike: Buyers increasing
Context: Extended move
SYSTEM VERDICT: Prepare Long
Confidence: 84%
Action: WAIT
Why: Trigger not yet confirmed

09:47:12.780
SYSTEM VERDICT: ENTER LONG
Risk Controller: APPROVED
Simulation: BUY 1 NQ
```

**Milestone block:**

### A Complete Closed-Loop Prototype

The system observes the market, interprets the trading state, evaluates it against the reconstructed methodology, produces a decision, passes that decision through the independent risk controller, and executes the result in simulation.

**Not-yet list:**

- Not yet production-ready
- Not automatically approved for real money
- Not assumed profitable
- Still subject to validation

### Section 18: Independent Risk Controller

The guardrail

## The AI Requests Trades. Something Else Permits Them.

**Card: Approved**

Approved

```
AI REQUEST
BUY 4 NQ
↓
INDEPENDENT RISK CONTROLLER
```

**Risk checks:**

- Maximum size: 2
- Daily loss: OK
- Trading hours: OK
- Data freshness: OK
- Duplicate order: No
- Kill switch: Armed

```
↓
APPROVED / MODIFIED
BUY 2 NQ
↓
EXECUTION
```

**Card: Blocked**

Blocked

```
AI REQUEST
BUY 2 NQ
↓
OUTSIDE PERMITTED HOURS
↓
BLOCKED
NO ORDER PLACED. DECISION LOGGED.
```

**Principle callout:** The intelligence proposes. The independent controller has final authority over whether an order is permitted.

### Section 19: Month 3, Test + Prove

The build, month three

## Month 3: Test + Prove

The question changes from whether we can build it to where it fails, and whether it has earned the right to advance.

- Historical replay
- Live paper trading
- False-positive and false-negative analysis
- No-trade accuracy
- Agreement with Stan's judgment
- Execution reliability under load
- Risk-controller validation
- Latency and stale-data handling

**Validation ladder (sequential steps with status markers):**

1. Recorded sessions (done)
2. Historical replay (done)
3. Simulation (pending)
4. Live market / paper trading (active)
5. Human-approved live assistant (open)
6. Controlled real-money test (locked)

**Callout:** Real capital is not a calendar milestone. It is a permission that must be earned by evidence.

**Milestone block:**

### Know Whether the System Has Earned the Right to Advance

- Does recognition remain accurate in live conditions?
- Does the system correctly stay out?
- How often does it disagree with Stan?
- What is the false-positive rate?
- What conditions cause performance to degrade?
- Does execution remain deterministic?
- Are risk boundaries enforced consistently?
- Is behavior repeatable across sessions?

### Section: What We Need to Decide Now

Not a checkout. A meeting.

## What We Need to Decide Now

This section exists to facilitate the conversation, not to force it. Nothing below needs to be resolved before this page is useful.

**Decision card: Partnership**

### Partnership

Confirm the 50/50 Tribune Trading structure and agree on the general IP framework.

**Decision card: Development**

### Development

Choose between milestone development funding and the fixed core-development commitment.

**Decision card: Start**

### Start

Agree on the Month 1 objectives and begin development.

**Evolve note:**

Everything else can evolve from evidence.

Market expansion, commercialization, broader autonomy, direct Tribune Inc. investment, institutional partnerships, and eventual exit strategy do not need to be settled before development begins.

**Closing line:** Build It Together. Prove It Together. Decide How Far It Can Go.

The immediate objective is simple: turn Stan's trading knowledge into something observable, testable, and increasingly autonomous. Then let the evidence determine what comes next.

### Footer

Power that stays. Help that leaves.

&copy; 2026 Tribune Inc. (rendered as: © 2026 Tribune Inc.)

jeff@tribuneinc.com &nbsp;&middot;&nbsp; ryan@tribuneinc.com (rendered as: jeff@tribuneinc.com, ryan@tribuneinc.com, as mailto links)

Confidential: for invited reviewers only

### Sticky month rail

Three unlabeled dot links (accessible labels: Month 1, Month 2, Month 3) anchoring to the Month 1, Month 2, and Month 3 sections. No visible text, icon-only navigation.

## 3. Visual Layout & Design

### Design token palette

The page introduces two new muted color-psychology accents on top of the site-wide brand tokens, plus reuses the existing brand palette:

- **--tyrian** (brand magenta/purple): used for the primary brand accent, kickers, the "Agreed in principle" status badge, the technology capital card top border, the IP factory card, and general emphasis links.
- **--aurum** (gold): represents Stan's knowledge capital throughout. Used on the Stan capital card top border and gradient wash, the knowledge investment column, the IP product card, the owner-split "Stan" half, and the future-opportunity status badge.
- **--trust** (deep slate-blue, `#2E5A8C`): signals "recommended," trust, and structured, milestone-based progress. Used on the milestone funding card (the "Recommended" pill and its gate timeline), the development investment column top accent, and the execution track card in Month 1 and the Hands column in Section 16.
- **--growth** (deep muted green, `#3C7A5B`): signals a positive alternative path and certainty. Used on the fixed-commitment funding card (the "Alternative" pill), the completed-milestone cards' left border, and the validation ladder's "done" markers.
- **--violet** (`#5B3FA0`): reserved specifically for Month 3 and the perception/brain track. Used on the perception track card top border, the Brain column, the method-comparison callout and legend, the restraint callout, and the risk-principle callout, plus the active dot color on the sticky month rail.
- **--obsidian / --basalt / --daylight / --marble**: the site's neutral scale, inherited from the global stylesheet. --obsidian is the darkest neutral (used for the converge blocks' dark background and body headings), --basalt is a mid-tone gray used for body copy, --daylight is the lightest card background, and --marble is a slightly warmer off-white used for secondary card backgrounds (original-understanding card, decision cards' text, branch cards, ladder background context).

### Section-by-section layout

**Confidential bar:** full-width dark (`--obsidian`) strip, flex row with the confidential tag on the left (gold/aurum monospace) and the document title on the right (muted monospace), wraps on narrow viewports.

**Hero:** single-column, left-aligned block with a large H1 (clamped 2.1rem to 3.15rem), a subhead in brand-deep tyrian, and a lead paragraph capped at 62 characters wide. Below the text sits the three-node flow diagram (`Stan/Knowledge -> Tribune/Technology -> Together/Scalable System`), laid out as a horizontal flex row of equal-width cards connected by arrow glyphs; each node has a 4px colored top border (gold for Stan, tyrian for Tribune, dark obsidian fill for the combined "Together" node). At 680px and below the flow diagram stacks vertically and each arrow rotates 90 degrees to point downward.

**Two Forms of Capital:** a two-column grid (`grid-2`) holding the Stan card and the Tribune card side by side, both stretched to equal height. Each card has a 4px top border in its accent color (gold for Stan, tyrian for Tribune) and a soft top-down gradient wash fading into the card background. Below the cards, a "converge" block: a vertical connector line drops into a single dark (obsidian) rounded panel reading "Tribune Trading LLC / 50% Stan | 50% Tribune Inc." This converge pattern (two-or-three inputs above, one dark result block below, connected by a vertical line) repeats at several points on the page (Sections 2, 4, and 16) as the page's core visual metaphor for "multiple inputs becoming one company or one system." A centered status-badge row and a small disclaimer line sit beneath it.

**Continuity, Not a Rewrite:** a two-column grid (`orig-grid`) of cards; collapses to one column at 820px and below. The right-hand "learned" card has a 4px left border in tyrian to visually mark it as the newer, evolving piece of information versus the plain original-agreement card on the left.

**Three Investments:** a three-column grid (`invest-grid`), collapsing to one column at 900px and below. Each column has a numbered label (01/02/03) and a 4px top border: gold for Knowledge, tyrian for Technology + Time, and trust-blue for Development, with a small green (growth) corner flag on the Development column signaling that development funding, while separate from equity, still connects to a positive outcome. Below the three columns, the converge block repeats, followed by a boxed "Important" note with a subtle left border in neutral ash.

**Development Funding:** a two-column grid (`fund-grid`), collapsing to one column at 860px. The left "Milestone model" card is trust-blue themed with a raised "Recommended" pill badge floating above its top-left corner and a soft blue gradient wash and glow shadow. The right "Fixed commitment" card is growth-green themed with an "Alternative" pill in the same floating position. Inside the milestone card sits the gate timeline: a horizontal row of circular "dots" (solid trust-blue rings for Month 1/2/3, smaller solid-filled dots for Review gates, and a dashed-outline dot for the optional Month 3) connected by thin horizontal separator lines, each with a monospace label underneath. At 680px and below, the gate timeline stacks into a vertical list and the connector lines are hidden.

**Without Dedicated Funding:** a single boxed panel (`novel-compare`) on a warm marble background, capped at 820px wide, containing a bolded heading line and a bolded closing line.

**Ownership Structure:** a centered vertical tree diagram (`owner-tree`). A dark obsidian/basalt-toned "Tribune Inc." parent box sits at top, connected by a vertical stick and a pill-shaped "50%" label to a lighter "Tribune Trading LLC" venture box below, which has a 1.5px tyrian border and an internal two-way split bar (gold-tinted "50% Stan" half, tyrian-tinted "50% Tribune Inc." half). A centered caption paragraph and a centered status badge sit below the diagram.

**IP Model, Factory vs Product:** a two-column grid (`ip-grid`), collapsing to one column at 860px. The left "Tribune Inc." factory card has a tyrian top border; the right "Tribune Trading LLC" product card has a gold top border, mirroring the Stan/Tribune color coding used throughout the page. A caption paragraph and status badge follow.

**Market Territory Board:** the primary interactive element (detailed fully in Section 4 below). Structurally it is two dashed-border drop zones side by side above a single wider dashed neutral zone below, all inside one bordered container; the two-zone row collapses to a single column at 820px. Each zone header carries a small colored dot (tyrian for the Trading zone, basalt/dark neutral for the Tribune zone) matching the zone's accent. Market cards render as pill-shaped tags that visually recolor based on which zone currently holds them (tyrian-tinted in the Trading zone, marble/basalt-toned in the Tribune zone, neutral daylight in the undecided zone).

**Proposed Market Principle:** a single pull-quote line in tyrian-deep text with a left border accent, followed by a supporting paragraph and a status badge.

**Right of First Opportunity:** a vertical numbered step tree (steps 1, 2, 3) with circular numbered nodes connected by short vertical connector lines, capped at 760px wide. Step 3 branches into a two-column sub-grid (`tree-branch`, collapsing to one column at 680px): a tyrian-tinted "3A Accepted" node and a neutral marble "3B Declined" node, visually contrasting the favorable and unfavorable outcomes.

**Future Tribune Inc. Alignment:** a single card (`future-card`) capped at 640px with a diagonal gold-tinted gradient wash bleeding in from the top-right corner and a small padlock-style icon beside the "Future access" label, reinforcing that this is a locked/deferred topic. A status badge ("Future opportunity, not yet agreed") follows in the gold family, distinct from the tyrian "Agreed" and neutral "Proposed" badges elsewhere.

**Commercial Endgame:** a horizontal "Build -> Prove -> Scale" strip in large bold type with tyrian arrow separators, followed by a five-column grid of branch cards (`scale-branches`) that collapses to two columns at 960px and one column at 560px. A small monospace closing note follows.

**Month 1, See + Act:** reuses the `ip-grid` two-column layout for two "track cards": Track A (Perception, violet top border) and Track B (Execution, trust-blue top border), stretched to equal height. Each contains a dark monospace "flow block" showing a pipeline of stages connected by down-arrows, rendered on an obsidian background with gold headers, dimmed labels, and a lavender/violet accent color for the highlighted data line. Below the two tracks, a milestone block presents two green-accented "complete" cards (each with a checkmark-styled title and a green left border) followed by a plain bulleted "not yet" list using open-circle bullet markers instead of standard bullets.

**The Hands and the Brain:** a two-column grid (`bh-grid`), collapsing to one column at 860px. The Hands column has a trust-blue top border and a numbered ordered list (circular numbered badges); the Brain column has a violet top border and a matching numbered list, visually pairing "demonstrable early" mechanical steps against "the core research problem" cognitive steps. A converge block below combines both into "The Brain + The Hands = Complete Trading System," followed by a bold closing line.

**Month 2, Understand + Decide:** opens with a large violet pull-quote callout with a left border. Below it, a two-column comparison table (`method-table`) with a dark basalt header row ("What Happened" / "What the Method Said") and four paired data rows, followed by a vertical legend list pairing green "OK" markers with correct outcomes and amber "!" markers with problem outcomes. A violet-tinted "Restraint Is Training Data" callout box follows. Three consecutive dark monospace blocks then walk through: (1) the Month 1 vs Month 2 pipeline comparison, (2) the full seven-stage system pipeline from OBSERVE to RESULT + FEEDBACK, and (3) a worked example of a system decision with two timestamped log entries. A closing milestone block describes the closed-loop prototype and a "not yet" list.

**Independent Risk Controller:** a two-column grid (`risk-grid`), collapsing to one column at 860px. The "Approved" card has a green header band; the "Blocked" card has a red/error header band. Each card body mixes monospace flow blocks with a plain checklist (checkmark bullets) showing the specific risk checks applied. A violet-bordered pull-quote callout closes the section: "The intelligence proposes. The independent controller has final authority."

**Month 3, Test + Prove:** a plain bulleted validation-criteria list, followed by the validation ladder: a vertical sequence of circular status markers (filled dark-green checkmark circles for completed steps, an outlined trust-blue circle for the active step, a dashed circle for an open/future step, and a lock glyph for the final locked step), each connected by short vertical lines and labeled in monospace. A trust-blue-bordered callout ("Real capital is not a calendar milestone...") follows, then a final milestone block with another plain validation-question list.

**What We Need to Decide Now:** a three-column grid (`decision-grid.three`), collapsing to one column at 900px, of plain decision cards (Partnership / Development / Start). Below, a centered "evolve note" and a large centered closing headline, then a centered closing paragraph.

**Footer:** simple centered/flex legal row with the tagline, copyright, contact mailtos, and confidentiality notice.

**Sticky month rail:** a fixed-position vertical pill-shaped rail anchored to the right edge of the viewport, vertically centered, containing three small dot links. The active dot (matching whichever Month section is currently in view) scales up and switches to violet. The rail is hidden entirely below 1180px viewport width, since it would otherwise overlap page content on narrower screens.

### Responsive breakpoints summary

The following breakpoints are defined in `partnership.css`, all as `max-width` queries: 1180px (hides the sticky month rail), 960px (scale-branches grid drops to two columns), 900px (invest-grid and decision-grid.three drop to one column), 860px (fund-grid, ip-grid, bh-grid, risk-grid, complete-grid drop to one column), 820px (orig-grid, territory-zones, tree-branch's sibling complete-grid context, and the 900px/860px tier grids referenced above), 768px (tightens gap spacing on invest-grid, orig-grid, fund-grid, and ip-grid without changing column count), 680px (pt-flow stacks vertically with rotated arrows, gate-line stacks vertically and hides separators, tree-branch drops to one column), and 560px (scale-branches drops to a single column).

## 4. Interactive Functions

### Market Territory Board (`assets/partnership.js`)

The board is a self-contained, dependency-free vanilla JavaScript widget with no persistence and no backend, meant to be operated live during the partnership meeting rather than to record a permanent decision.

**Mechanics:** the board supports two input methods simultaneously so it works on both a laptop and a tablet in a live meeting:

1. **HTML5 drag-and-drop** (mouse): each market card is a `draggable="true"` element. On `dragstart` the card is marked with a `dragging` class and its id is stored both in a local `dragged` variable and in the native `dataTransfer` payload. Each of the three drop zones listens for `dragover` (calls `preventDefault` and adds a `drag-over` highlight class), `dragleave` (removes the highlight), and `drop` (removes the highlight, reads the dragged id, and moves the card into that zone).
2. **Tap-to-place touch fallback:** clicking/tapping a card toggles a `picked` class on it (only one card can be picked at a time; picking a new card un-picks the previous one, and re-tapping the same picked card un-picks it). Tapping anywhere on a zone while a card is picked moves that picked card into the tapped zone. This lets the board work on touchscreens that do not reliably fire native HTML5 drag events.

**Zones:** three zones exist: `trading` (Tribune Trading LLC), `tribune` (Tribune Inc.), and `neutral` ("To Decide Together"). Markets are represented in a `MARKETS` array of twenty items with an id, a display label, and a starting zone.

**Starting zone assignments:**

- **Tribune Trading LLC (starts here):** NASDAQ / NQ Futures. (Chosen as the starting proposal because it is the market already discussed in technical discovery and is Stan's demonstrated methodology market.)
- **Tribune Inc. (starts here):** Non-Trading Applications, Future AI Verticals. (Default to Tribune Inc. because they sit outside the trading product by definition.)
- **To Decide Together / neutral (starts here, everything else):** S&P / ES Futures, Dow / YM Futures, Russell / RTY Futures, Gold, Silver, Crude Oil, Other Commodities, Bitcoin, Crypto Markets, Forex, Individual Equities, Equity Options, Index Options, International Equity Indices, Volatility Products, Treasury / Rate Futures, Other Futures Markets.

**Reset button:** the "Reset to starting proposal" button restores every market card's `zone` value in the internal state object back to its original starting zone (re-reading from the `MARKETS` array) and re-renders the board. This lets the facilitator run the exercise repeatedly across multiple meetings or multiple passes within one meeting without permanently altering anything.

**Rendering:** on every state change the script clears all three zone containers and rebuilds every card from scratch, re-attaching drag and click listeners each time, and setting a `data-zone` attribute on each card so the CSS can recolor it based on its current zone (tyrian-tinted styling in the Trading zone, marble/basalt styling in the Tribune zone, neutral daylight styling in the undecided zone).

### Sticky Month rail and IntersectionObserver tracking

An inline script at the bottom of `index.html` (separate from `partnership.js`) wires up the fixed-position month rail. It selects the three anchor links inside `.month-rail` and the three target sections (`#month-1`, `#month-2`, `#month-3`). If `IntersectionObserver` is not supported, the script exits early and the rail simply behaves as plain anchor links with no active-state highlighting. Where supported, it creates one `IntersectionObserver` with a root margin of `-40% 0px -50% 0px` (a horizontal band roughly across the vertical middle of the viewport) watching all three month sections. Whenever a section crosses into that band and is reported as intersecting, the observer callback toggles an `active` class on the rail link whose `data-month` attribute matches that section's id, and removes it from the others. Visually, the active dot on the rail scales up (1.35x) and switches from the neutral line color to violet, giving the reviewer a persistent sense of which month of the roadmap they are currently reading, even though the rail itself is hidden below 1180px viewport width.

### Scroll reveal animations

Every major section wrapper (and the hero's individual lines) carries a `reveal` class. The site-wide script (`assets/site.js`, loaded before `partnership.js`) sets up a single `IntersectionObserver` over every `.reveal` element on the page (unless the visitor's OS-level reduced-motion preference is set, in which case every reveal element is simply marked visible immediately with no animation). As each section scrolls into view it is given an `in` class that triggers its transition-in styling, producing the sequential, section-by-section fade/slide reveal effect as the reviewer scrolls down the long roadmap page.

### Hover and transition states

Market territory cards have a `:hover` state (darker border, subtle drop shadow) and a `grabbing` cursor while actively dragged, with the original card left at reduced opacity (`dragging` class) during the drag so the reviewer can see both its origin and destination simultaneously. Drop zones highlight with a `drag-over` class (colored border and tinted background matching that zone's accent) while a card is being dragged over them, and the territory-reset button gets a darker border/text color on hover. These are all short (roughly 0.12 to 0.15 second) CSS transitions, consistent with the fast, responsive feel appropriate for a live drag interaction happening on a screen share during a meeting.

## 5. Content Notes

### Status badge taxonomy

Four distinct status badge states are used across the page, each with its own color signal and each mapped to specific sections:

- **Agreed in principle** (tyrian/magenta accent): the 50/50 Tribune Trading LLC structure (Section 2, converge block), the Original Understanding card (Section 3), and the Ownership Structure diagram (Section 7). These are treated as already-settled foundational facts of the partnership.
- **Proposed** (neutral ash/gray accent): the "What We Learned During Technical Discovery" card (Section 3), the IP Model factory-vs-product framework (Section 8, labeled specifically "Proposed framework, not final legal language"), the market principle pull-quote (Section 10, labeled "Proposed commercial principle"), and the Right of First Opportunity decision tree (Section 11, labeled "Proposed commercial principle, not final legal language"). These are new ideas surfaced during discovery that still need explicit agreement.
- **Decision available** (dashed neutral accent, CSS class `.status-decide` defined in the stylesheet): reserved styling for badges marking points where a concrete choice is available to make (for example between the milestone and fixed-commitment funding options); the CSS rule exists in `partnership.css` as part of the shared badge system even though this document's page content review did not find it rendered as visible badge text on the current build of the page.
- **Future opportunity** (gold/aurum accent): the Future Tribune Inc. Alignment section (Section 13), explicitly labeled "Future opportunity, not yet agreed," marking Stan's potential future direct investment in Tribune Inc. as a deliberately deferred, unpriced, and unpromised topic.

### Editorial rules applied

- **No em dashes or en dashes anywhere in the page copy.** Wherever a dash-style pause would normally be used, the page instead uses a comma, a period, or in a few structural cases a middle-dot (`&middot;`) glyph for label separators (for example "Confidential &middot; For invited reviewers" or "3A &middot; Accepted"). This document mirrors that same rule and uses only commas and periods, never dashes, in its own prose.
- **Development funding is explicitly and repeatedly separated from equity.** The page states directly, more than once, that the $12,500/month milestone option and the $25,000 fixed option fund development runway only, that this funding does not buy Tribune's 50% ownership stake, and that it is not payment to Ryan or Jeff for ownership. Ownership of Tribune Trading LLC remains the 50/50 Stan and Tribune Inc. split regardless of which funding option is chosen.
- **Proposed frameworks are explicitly labeled as not-yet-legal-language.** Both the IP Model (Factory vs. Product) section and the Right of First Opportunity section carry status badges that say, in full, "not final legal language," and the IP section's subhead further clarifies it is "not yet a signed legal agreement, and not a definitive statement of IP ownership." The page frames these sections as a shared reasoning tool for the partnership conversation, not as binding terms.
