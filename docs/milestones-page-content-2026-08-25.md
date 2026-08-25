# Tribune Trading Milestones Page: Content and Layout Reference

Prepared 2026-08-25. Source files: `milestones/index.html`, `assets/milestone.css`, `assets/milestone.js`.

## 1. Page Overview

**URL path:** `/milestones/` (recently renamed from `/milestone/`, singular).

**Access model:** The page is gated by a server-side password wall enforced at the Cloudflare edge inside `_worker.js`, using that worker's `GATE_MILESTONE` configuration entry. There is no client-side gate to bypass. Access works the same way as the other two gated pages on the site: a visitor submits the password on a server-rendered form, the worker checks it with a timing-safe comparison, and on success issues a signed session cookie. The cookie is built from an HMAC signature over the path prefix and the current calendar week, so a valid cookie effectively re-derives on a weekly rotation and a leaked cookie loses validity on its own even without explicit revocation. The page also carries `<meta name="robots" content="noindex, nofollow">` so it is excluded from search indexing regardless of the password gate.

**Purpose:** The page is a three-month development roadmap and architecture brief for the Tribune Trading AI build. It walks through what gets built in Month 1 (See + Act), Month 2 (Understand + Decide), and Month 3 (Test + Prove), the underlying five-layer runtime architecture, the candidate execution routes and technology stack, and the nine-gate autonomy staircase that governs when real capital can be risked. It is a technical companion to the partnership brief rather than a restatement of the funding or ownership terms, though it does summarize the funding alignment for context.

**Intended audience:** Stan, as part of a private partnership briefing. The document title tag reads "Tribune Trading AI: Development Roadmap | Tribune Inc." and the top confidential bar reads "Confidential, For client review," signaling the same invited-reviewer-only posture as the partnership page, but oriented toward the technical and engineering detail Stan would want as the trader whose methodology is being encoded.

## 2. Verbatim Page Content

### Top confidential bar

Confidential &middot; For client review (rendered as: Confidential, For client review)

Tribune Trading AI: Development Roadmap

### Header navigation

TRIBUNE (wordmark, links to /)

Home

About

Reach out

### Mobile / narrow-desktop sticky horizontal month bar

Three buttons, icon plus short label: &#9679; M1, &#9675; M2, &#9675; M3 (the filled/hollow circle glyph reflects active/future state and changes as the state updates).

### Desktop persistent sticky scroll-spy progress rail

Development roadmap (rail heading)

Month 1, See + act

Month 2, Understand + decide

Month 3, Test + prove

### Hero

**Eyebrow:** Development roadmap &amp; architecture brief

# Encoding a trader's *judgment*, not his trade history.

The objective is not a program that places orders. It is a system that observes what the trader observes, understands the method behind what he does, and applies that method independently, including the decision to **stay out**. Most of the engineering effort goes into discovering and formalizing rules that currently exist only as expertise.

**How-to box:** How to read this page. Any word with a dotted underline (like the term button "NQ") is a technical or trading term. Click or tap it for a plain-language definition on the spot. Every term also appears in the full glossary at the bottom of the page. The panel on the right (or the bar at the top on smaller screens) tracks where you are in the three-month development story as you scroll.

### Section: Overview (id="overview")

**Section label:** Development roadmap

## A Three-Stage Path From Recorded Expertise to a Validated Trading System

The plan is deliberately simple to describe, even though the engineering underneath is not. **Month 1** the system learns to see and act. **Month 2** it learns when it should act. **Month 3** it is tested until we know whether it has earned the right to go further. Nothing in this project moves to real capital ahead of that evidence.

**Month row (three cards):**
- Month 1: See + Act
- Month 2: Understand + Decide
- Month 3: Test + Prove

**Bulleted list:**
- **Month 1: See + Act.** Build the perception layer and the execution mechanism in parallel. By the end of the month the system can analyze a recorded trading session, extract structured market state from it, recognize the key trading inputs, and execute a simulated trading instruction. It does not yet need to know, on its own, when it should trade.
- **Month 2: Understand + Decide.** Connect the reconstructed trading method to the perception layer. The target is a closed-loop prototype: observe the market, interpret the state, evaluate the setup, decide to act or stay out, pass that decision through an independent risk controller, and execute in simulation. This is where reconstructing the trading methodology itself becomes the central engineering problem.
- **Month 3: Test + Prove.** Validate, refine, harden, and try to break the system. The question shifts from "can we build it" to "has it earned the right to advance toward real-money use." Real-money autonomous trading stays locked until predefined validation criteria are satisfied. Not on a calendar, on evidence.

**Small print:** Timeline note: the target for the core prototype is approximately two months. Month 3 is reserved for validation, refinement and hardening where it is needed. It is not automatically required if major milestones are reached sooner, and development advances immediately rather than waiting out an artificial calendar boundary.

### Section: Three parallel tracks (id="tracks")

**Section label:** Three parallel tracks

## Three Questions Being Answered at the Same Time

Underneath the three months, three separate engineering problems are moving forward together. Two of them can progress largely in parallel. The third is the hardest reasoning problem in the project, and it is what Month 2 is really about.

**Bulleted list:**
- **A &middot; Perception**: can the machine understand what Stan sees?
- **B &middot; Execution**: can the machine physically perform the required trading action?
- **C &middot; Intelligence**: can the system determine when the method actually calls for action?

**Figure: three-lane track diagram**

Track A, Perception
- Month 1: Sessions become structured, machine-readable state.
- Month 2: Recognition feeds directly into the decision engine.
- Month 3: Recognition accuracy validated against live and replayed sessions.

Track B, Execution
- Month 1: Simulated orders placed automatically once commanded.
- Month 2: Execution wired to the risk controller and live decisions.
- Month 3: Execution reliability and consistency stress-tested.

Track C, Intelligence
- Month 1: Not yet central. Perception and execution come first.
- Month 2: The hardest reasoning problem: when does the method actually call for action?
- Month 3: Decision quality and agreement with Stan's judgment tested under pressure.

Closing banner inside the diagram: A + B + C &rarr; COMPLETE TRADING SYSTEM

**Figcaption:** A and B move first; C is where Month 2 lives. Perception and execution develop significantly in parallel through Month 1 because they are, relatively speaking, engineering problems with known solutions. Intelligence, knowing when the method calls for action, is a genuine reasoning problem, and it becomes the central focus once the first two tracks give it something reliable to reason over.

### Month band: 01 &middot; Month 1

### Section: Teach the System to See (id="m1-see")

**Section label:** Month 1 &middot; Track A

## Teach the System to See. Build the Hands.

The system needs access to substantially the same information the trader has in front of him. That is video, graphics, sound, numbers, timing and human action arriving simultaneously, which is why this is a computer-vision project as much as a market-data one.

**Chips (highlighted chips are trading-specific or technical terms):**
live chart movement, candlestick structure, price levels, S949 oscillator, Type 1 divergence, Type 2 divergence, Fibonacci retracement, TickStrike order-flow meter, TickStrike sounds &amp; alerts, order-flow behaviour, cursor activity, entries &amp; exits, position size, signal-to-execution timing, spoken commentary, deliberate non-entries

**Small print below chips:** Highlighted chips are trading-specific or technical terms. See candlesticks, S949, divergence, Fibonacci retracement, TickStrike, order flow, entries &amp; exits, position size, signal-to-execution timing and deliberate non-entries in the glossary.

### The first transformation: session &rarr; structured state

The first major transformation is turning a trading session into machine-readable state. The system does not merely watch the video. It converts what happened into a structured timeline that can be replayed, compared, labeled, and eventually reasoned over, using computer vision and OCR to read numbers and text directly off the screen.

**Figure: Before/after transformation block**

Before
- 2-hour trading recording
- Video
- Audio
- Mouse activity
- Chart movement
- Human commentary

&rarr;

After (structured state readout)
```
time            09:47:12.480
Structured state
price structure uptrend
S949            rising
divergence      Type 1
fibonacci       61.8%
TickStrike      buyers accelerating
position        flat
Stan            no trade
```

**Figcaption:** Replayable, comparable, labelable. A two-hour session becomes a timestamped sequence of structured snapshots, not a summary: a full machine-readable record of what the market and the trader were doing at every moment, including the moments where the correct action was to do nothing.

**Figure: perception-engine diagram (monospace/diagram text, transcribed as shown on the SVG)**
```
RAW STREAMS                    PERCEPTION           STRUCTURED STATE

Chart & candles (video)   \
S949 oscillator shape      \
Fibonacci overlays          \
TickStrike meter            >--- Perception engine ---> One timestamped snapshot
TickStrike audio            /    vision · OCR · geometry    price structure · divergence type
Cursor & order actions     /     audio classification       fib level · flow direction
Spoken commentary         /      temporal tracking           context · confidence · trigger
                                        [state]               machine-readable, replayable

ORIGINAL RECORDING RETAINED: RE-EXTRACTABLE IF A NEW FEATURE MATTERS LATER
```

**Figcaption:** Why the raw footage is kept. If a visual or behavioral feature we did not initially extract turns out to matter later, the system can return to the original footage and derive it without recreating the session.

### Section: Build the Hands (id="m1-act")

**Section label:** Month 1 &middot; Track B

## Build the Hands: the Execution Prototype

This is not yet the trading intelligence. The Month 1 execution prototype proves that once the decision engine produces an approved trade instruction, the system can carry it out automatically in a simulated environment.

**Figure: execution pipeline diagram (monospace/diagram text)**
```
SIMULATED COMMAND        Execution adapter        NinjaTrader / broker        Order placed
"BUY 1 NQ"          -->                      -->  interface               --> SIM MODE
```

**Figcaption:** Execution before intelligence, deliberately. The system may be able to execute before it knows when it should execute, and that is fine. Proving the hands can move is a separate, smaller problem than teaching the brain when to move them, and there is no reason to wait on one to start the other.

### Section: The Eyes and the Hands (id="m1-brainhands")

**Section label:** Month 1 &middot; The core distinction

## The Eyes and the Hands

Automating clicks and broker orders is not the primary intellectual challenge of this project. Deciding the correct action is. Keeping the parts cleanly separated, in the architecture and in how progress is measured, is one of the more important design decisions in the whole system.

The full model has four parts: **THE EYES** (Perception), **THE BRAIN** (Method + Decision Logic), **THE HANDS** (Execution), and **THE GUARDRAILS** (Independent Risk Control). Month 1 builds perception and execution in parallel. Month 2 connects them through the trading method and decision logic.

**Figure: two-card convergence diagram**

THE HANDS (Execution) &middot; likely demonstrable early
1. Receive command
2. Check risk
3. Place trade
4. Verify fill
5. Manage position

THE EYES (Perception) &middot; builds alongside the hands
1. Observe
2. Understand context
3. Recognize method
4. Reject false signal
5. Decide

Converge block: THE EYES + THE HANDS &rarr; **MONTH 1 FOUNDATION**

**Figcaption:** Neither half works alone. Hands without eyes execute the wrong trades quickly. Eyes without hands are an opinion, not a system. Month 1 builds both in parallel precisely so neither becomes a bottleneck for the other once Month 2 adds the brain and the guardrails.

### Section: Month 1 target (id="m1-milestone")

**Section label:** Month 1 &middot; Target

**Milestone box (green):**

Month 1 target

### The machine can SEE the trading environment and ACT inside it.

Card: &#10003; Perception prototype. Turns recorded sessions into structured market state.

Card: &#10003; Execution prototype. Can place, modify and exit simulated trades automatically.

**Not yet:**
- Does it understand Stan's method reliably?
- Does it know when not to trade?
- Can it make independent trading decisions?
- Is it ready for real capital?

### Month band: 02 &middot; Month 2

### Section: Month 2 intro (id="m2-intro")

**Section label:** Month 2

## Teach the System to Think Like the Method

What happened is not always the same as what should have happened. Month 2 is where the project's central intellectual problem lives: teaching the system to reason about the method itself, not just to recognize what a screen looked like right before a trade.

**The difficult part is not sending a buy order. It is teaching a machine to recognize when the method actually calls for one.**

### Section: The training problem (id="m2-training")

**Section label:** Month 2 &middot; The training problem

## What Happened Is Not the Same as What Should Have Happened

The single largest technical risk in this project is training the system to imitate the trade history. A trade taken out of frustration, hesitation or overconfidence looks identical in the data to a trade taken by the book, and a pure imitation model will learn both with equal enthusiasm.

**Pull quote:** An imitation model learns *"when the screen looks like this, enter."* The correct lesson is often *"the method says do not enter here. The human entered anyway."*

**Figure: two-track price/behavior diagram (monospace/diagram text)**
```
NQ PRICE: ONE SESSION
[price line chart]

OBSERVED · WHAT THE TRADER DID
ENTRY -------- ENTRY -------- EXIT -------- NOTHING

INTENDED · WHAT THE METHOD PRESCRIBES
ENTRY -------- NO TRADE ----- EXIT -------- ENTRY

DIVERGENCE: EMOTIONAL ENTRY, LABELLED "VIOLATION"     (aligned under the second ENTRY / NO TRADE pair)
DIVERGENCE: VALID SETUP, LABELLED "MISSED"             (aligned under the NOTHING / ENTRY pair)
```

**Figcaption:** Two tracks, deliberately. Training data has to carry both: the action and the verdict on that action. Where the tracks agree, the example is a clean positive. Where they diverge, the label, not the behaviour, is what the system learns from.

### The label set the dataset needs

- **Correct trades**: the method executed as intended, entry and exit.
- **Incorrect trades**: premature entries, late entries, emotional entries, bad exits.
- **Missed trades**: a valid setup formed and no position was taken.
- **Near-signals and false signals**: conditions that resemble a setup but fail confirmation.
- **Ambiguous situations**: where the trader himself would not commit either way.
- **Correct no-trade periods**: doing nothing was the right decision.

### Section: Restraint Is Training Data (id="m2-notrade")

**Section label:** Month 2 &middot; A quieter, standalone point

## Restraint Is Training Data

**Callout:**

### The quiet periods carry as much signal as the trades

Quiet periods can be as informative as the trades themselves. A system trained only on entries has never been shown what disciplined inaction looks like. Correct no-trade periods therefore become explicit training examples.

### Section: Method reconstruction (id="m2-method")

**Section label:** Month 2 &middot; Method reconstruction

## Turning Simultaneous Intuition Into a Written State

The trader currently reads a dozen signals at once and arrives at a conclusion without decomposing it. The system cannot do that. Every input has to be resolved into an explicit, timestamped state that can be logged, replayed and argued with. Building this representation is one of the core engineering tasks, and it will keep evolving as the methodology is documented.

**Readout block:**
```
Instrument
market       NASDAQ futures, NQ
time         09:47:12.480

Price structure
swing high   identified, 3m ago
momentum     weakening short-term

S949 oscillator
oscillator   rising
price        falling
divergence   detected, Type 1

Fibonacci
level        price at 61.8% retracement

TickStrike
intensity    increasing
direction    buyers
accel        recent burst detected

Context
prior div    3 minutes ago
move         extended
volatility   elevated

Methodology verdict
confidence   high
action       prepare long
trigger      not yet satisfied, hold
```

### How the method gets taught, in order

The first stage is deliberately not "train a large neural network". Starting with an opaque model before the methodology is understood produces a black box nobody can audit or correct. The progression instead runs:

1. **Document the methodology**: translate the trader's reasoning into explicit concepts.
2. **Build automated observation**: teach the system to recognise the indicators and conditions.
3. **Create a structured timeline**: convert sessions into machine-readable sequences.
4. **Build the human-reviewed gold set**: the trader marks what the system saw right, what it misread, and what the correct decision was.
5. **Build the first decision model**: explicit rules and measurable conditions wherever they hold.
6. **Add learning only where rules break**: supervised models, sequence models, imitation and preference learning, reinforcement learning, multimodal vision-language models.

Machine learning is introduced where explicit logic demonstrably runs out, not as the default starting point.

### Section: The Closed-Loop Prototype (id="m2-loop")

**Section label:** Month 2 &middot; The biggest technical milestone on this page

## The Closed-Loop Prototype

Month 1 was **SEE &rarr; [test / human command] &rarr; ACT**. Month 2 becomes **SEE &rarr; UNDERSTAND &rarr; DECIDE &rarr; ACT**. Perception and execution, built separately through Month 1, are now connected through a genuine decision-making core.

**Figure: closed-loop diagram (monospace/diagram text)**
```
OBSERVE -> STRUCTURED STATE -> METHOD MODEL -> DECISION ENGINE -> RISK CONTROLLER -> SIMULATED EXECUTION -> RESULT / FEEDBACK
   ^_______________________________________________________________________________________________________|
   every decision is recorded and feeds back into the method
```

**Figcaption:** All major systems connect here for the first time. The decision engine only emits abstract intents; the risk controller (section further below) has final authority before anything reaches simulated execution. This closely mirrors the underlying five-layer runtime architecture the whole system is built on.

### Section: An Example Decision Sequence (id="m2-example")

**Section label:** Month 2 &middot; Worked example

## An Example Decision Sequence

**ILLUSTRATIVE EXAMPLE.** This is the intelligence becoming operational: the moment structured perception, method reasoning and risk control actually work together on the same timeline.

**Readout block 1:**
```
State at 09:47:12.480
S949         rising
price        falling
divergence   Type 1
fibonacci    61.8%
TickStrike   buyers increasing
context      extended move

System verdict
verdict      prepare long
confidence   High
action       wait
why          trigger not yet confirmed
```

**Readout block 2:**
```
State at 09:47:12.780
verdict          ENTER LONG
risk controller  APPROVED
simulation       BUY 1 NQ
```

### Section: The AI Requests Trades. Something Else Permits Them. (id="m2-risk")

**Section label:** Month 2 &middot; Containment

## The AI Requests Trades. Something Else Permits Them.

Whichever execution route is chosen, the trading intelligence should never hold direct control of the account. An independent risk controller sits between the decision and the order. The intelligence proposes. The independent controller has final authority.

**Card: Approved / modified**
```
AI REQUEST: "BUY 4 NQ"
```
Checks:
- Max size **2**
- Daily loss **OK**
- Trading hours **OK**
- Data freshness **OK**
- Duplicate order **No**
- Kill switch **Armed**

Result: APPROVED: "BUY 2 NQ", execution proceeds at the clamped size.

**Card: Blocked**
```
AI REQUEST: "BUY 2 NQ"
```
Checks:
- Trading hours **Outside permitted hours**

Result: BLOCKED. No order placed. Decision logged.

### What the controller enforces

The controller enforces position limits, daily-loss limits, trading hours, duplicate-order protection, mandatory risk parameters, data-health checks, and the emergency kill switch.

### Section: Month 2 target (id="m2-milestone")

**Section label:** Month 2 &middot; Target

**Milestone box (blue):**

Month 2 target

### A Working Closed-Loop Prototype.

The system observes the market, interprets the trading state, evaluates it against the reconstructed methodology, produces a decision, passes that decision through the independent risk controller, and executes the result in simulation.

**Important qualification:**
- Not production-ready
- Not autonomous real-money trading
- Not assumed profitable
- Still subject to validation

But this is presented clearly for what it is: the point where all major technical systems first connect.

### Month band: 03 &middot; Month 3

### Section: Month 3 intro (id="m3-intro")

**Section label:** Month 3

## Test It Until It Breaks

The question shifts from "can we build it" to "where does it fail, and has it earned the right to advance." Month 3 exists to answer that question with evidence, not optimism.

### Section: What Has to Be Answered Before Anything Advances (id="m3-questions")

**Section label:** Month 3 &middot; Validation questions

## What Has to Be Answered Before Anything Advances

- Recognition accuracy
- False positives
- False negatives
- Quality of no-trade decisions
- Agreement with Stan's judgment
- Execution reliability
- Risk-controller behavior
- Response to unusual market conditions
- Delayed or stale market data
- Changing volatility
- Order confirmation
- System recovery
- Repeatability
- Performance across multiple sessions

### Section: Real Capital Is a Permission, Not a Calendar Date (id="m3-ladder")

**Section label:** Month 3 · The validation ladder

## Real Capital Is a Permission, Not a Calendar Date

Real capital is not a calendar milestone. It is a permission that must be earned by evidence. Each rung on this ladder has to be passed before the next one is attempted.

**Figure: validation ladder (status markers as shown)**
- ✓ done. **Recorded sessions.** The original source-of-truth footage and data.
- ✓ done. **Historical replay.** The decision system run end to end against past sessions.
- ● active. **Simulation / live paper trading.** Complete decisions against live markets, no capital at risk.
- ○ future. **Human-approved live assistant.** The AI proposes; a human approves and executes.
- 🔒 locked. **Controlled real-money test.** Automated trading, tightly bounded, only after every rung above is passed.

**Figcaption:** The locked stage is intentional. It communicates discipline, not delay. Automated control of real capital sits behind human-approved live performance on purpose, and stays there until the evidence, not the schedule, says otherwise.

### Section: Month 3 target (id="m3-milestone")

**Section label:** Month 3 · Target

**Milestone box (violet):**

Month 3 target

### Know Whether the System Has Earned the Right to Advance.

Not claiming "finished." Month 3 is left with evidence answering a specific set of questions:

- Does recognition remain accurate live?
- Does the system correctly stay out?
- Does the trader agree with its decisions?
- What is the false-positive rate?
- Which signals matter most?
- Where does performance degrade?
- Does execution remain deterministic?
- Are risk boundaries always enforced?
- Is performance repeatable?

### Section: How the Roadmap Aligns With the Funding Structure (id="funding")

**Section label:** Alignment

## How the Roadmap Aligns With the Funding Structure

This roadmap runs on the same funding model already established with Stan, summarized here for alignment only. The full funding cards, ownership structure and partnership terms live on the partnership brief, not duplicated on this page.

**Funding alignment cards (three columns):**

Month 1, $12,500
**Build perception + execution foundation.** Deliverable: perception prototype, execution prototype, first structured trading data.
At end: review what exists. Stan decides whether to continue.

Month 2, $12,500
**Connect methodology + decision engine + simulation.** Deliverable: closed-loop prototype, first independent decisions, simulated trading, risk-controller integration.
At end: review the functioning prototype. Stan decides whether additional testing/refinement justifies Month 3.

Month 3, Optional continuation
**Testing, refinement, hardening, readiness validation.** Deliverable: documented validation results, identified failure modes, refined decision logic, readiness recommendation.
Not automatically required if milestones are reached sooner.

**Small print:** Target core prototype: approximately two months. Month 3 is reserved for validation, refinement and hardening where needed. If major milestones are reached earlier, development advances immediately rather than waiting for an artificial calendar boundary. The work is not stretched to fill three months.

### Section: Autonomy Is Earned Through Nine Technical Gates (id="gates")

**Section label:** Nine technical gates

## Autonomy Is Earned Through Nine Technical Gates

Inside the three development stages, autonomy is earned one phase at a time: the same nine gates that structure the underlying architecture.

**COLLAPSED BY DEFAULT, `<details>` block, summary: "Expand Technical Roadmap"**

**Figure: nine-step staircase diagram (monospace/diagram text)**
```
MACHINE AUTONOMY (rising staircase, 9 steps, phases 1 to 9)

Phase:        1          2          3          4          5          6          7          8          9
Label:  OBSERVATION  METHOD  AUTOMATED  AI  HISTORICAL  PAPER  LIVE  CONTROLLED  EXPANDED
                     RECONSTRUCTION  RECOGNITION  COMMENTARY  SIMULATION  TRADING  ASSISTANT  EXECUTION  AUTONOMY

Divider line between phase 7 and 8:
  Left of line:  NO CAPITAL AT RISK
  Right of line: REAL CAPITAL, BOUNDED
```

**Figcaption:** Where the line falls. Everything through phase 7 runs on recordings, simulations or human-approved orders. The first automated order against real capital does not happen until phase 8, inside the risk boundaries described above.

**Nine phase cards:**

- **PHASE 1, Observation.** Record and study trading sessions in full.
- **PHASE 2, Method reconstruction.** Document how the signals actually interact.
- **PHASE 3, Automated recognition.** The system identifies S949, divergence, Fibonacci, TickStrike and context, and places no trades.
- **PHASE 4, AI commentary.** It watches live and says what it sees: "possible Type 1 forming", "resembles a setup but TickStrike confirmation is missing". The trader corrects it.
- **PHASE 5, Historical simulation.** The decision system is run against past sessions end to end.
- **PHASE 6, Paper trading.** Complete decisions in a simulated environment.
- **PHASE 7, Live assistant.** The AI proposes; a human approves and executes.
- **PHASE 8, Controlled execution** (live phase). Automated trading within tightly defined risk boundaries.
- **PHASE 9, Expanded autonomy** (live phase). Wider latitude, only after sustained validation.

Phase 4 deserves particular attention: it is the cheapest possible way to find out whether the system has actually understood the method. A running commentary can be corrected in real time by the trader, and every correction is a labelled training example.

**End of collapsed block.**

### Section: Full Architecture, for Readers Who Want to Go Deeper (id="deepdive")

**Section label:** Deep dive

## Full Architecture, for Readers Who Want to Go Deeper

**Deep-dive note:** Everything below is the underlying technical architecture that supports the three-month roadmap above. It is not required reading to understand the plan. It is here for anyone who wants the full engineering picture.

### Five-Layer Runtime Architecture

**COLLAPSED BY DEFAULT, `<details>` block, summary: "Expand"**

A conventional trading algorithm begins with mathematics that is already defined. Here, a large part of phase one is discovering the rules themselves. The system splits cleanly into five layers, and every layer fails for different reasons, so each is built and validated separately.

**Figure: five-stage pipeline diagram (monospace/diagram text)**
```
Observe            Understand         Decide              Execute             Evaluate
screen · audio ·    market state       trade · wait ·      risk-checked        did it
data                                   ignore              order               behave?

  |------------------->|------------------>|------------------->|------------------->|

feedback: Evaluate ---------------------------------------------------------------> Understand
          (every decision is recorded and becomes training material)
```

**Figcaption:** The loop, not the line. The first four stages are what most people picture when they hear "trading bot". The fifth is what makes the system improve: every decision, taken or declined, is logged with the state that produced it and fed back into the method.

Keeping the layers separate has a practical payoff. The perception layer and the execution layer are independent services, so the trading platform can be changed later without retraining any of the trading intelligence.

**End of collapsed block.**

### Execution Options

**COLLAPSED BY DEFAULT, `<details>` block, summary: "Expand"**

The final execution mechanism has not been selected, and it does not have to be a single choice. The options differ mainly in how many hops sit between the decision and the fill, and every extra hop is somewhere the order can be delayed, misread or lost.

**Figure: four parallel execution-route lanes (monospace/diagram text)**
```
DECISION ENGINE                                                              BROKER / MARKET

A · DIRECT BROKER API                                              0 HOPS
  -----------------------------------------------------------------------
  BUY 1 NQ MARKET · STOP 20 · TARGET 35 · REST / WebSocket / FIX

B · NATIVE PLATFORM INTEGRATION                                    1 HOP
  --------------[ NinjaScript add-on ]------------------------------------
  EXPOSES POSITIONS, FILLS, BID/ASK AND INDICATORS THE TRADER ALREADY USES

C · BROWSER AUTOMATION                                             1 HOP
  --------------[ Playwright / Puppeteer ]--------------------------------
  DRIVES THE WEB TRADING UI WHEN NO API EXISTS

D · HUMAN-LIKE GUI CONTROL                                         2 HOPS
  --------[ Visual state read ]-------[ Mouse + keyboard ]----------------
  SCREEN RE-VERIFIED AFTER EVERY CLICK: NOT A REPLAYED MACRO
```

**Figcaption:** The choice is a hop count, not a philosophy. Route A is preferred wherever the broker supports it. Each route below it exists to bridge a platform that was never designed for automation, at the cost of one more component that must be verified at runtime.

**Four option cards:**

- **Proposal A, Direct broker API (preferred).** Structured commands translated straight into the broker's protocol. Fast, deterministic, easy to log and test, with precise order status and direct fill confirmation. Verdict: Preferred path wherever it is available.
- **Proposal B, Native platform integration.** A NinjaScript or C# add-on inside the platform, bridged over local WebSocket or REST. May expose more than a generic broker API: chart state, indicators, live position. Verdict: Potentially richer than A, same environment the trader uses.
- **Proposal C, Browser automation.** Chromium under automation identifies interface elements and works the order ticket: instrument, order type, quantity, submit, confirm. Verdict: Bridges web platforms with no API.
- **Proposal D, Human-like GUI control.** Vision plus mouse and keyboard, verifying the application's state at each step: confirm instrument, confirm position, locate control, check quantity, click, observe fill, confirm result and halt if the expected state is not seen. Verdict: Last-resort bridge and emergency fallback.

**End of collapsed block.**

### Proposal E: the hybrid, and the likely answer

Nothing requires every part of the system to use the same interface. The strongest available method can be used for each component independently:

**Table: Component / Route**

| Component | Route |
|---|---|
| Market data | Broker API |
| Indicator values | Native platform integration |
| TickStrike | Audio + visual recognition |
| Trading decision | AI decision engine |
| Position status | Broker API |
| Order execution | Platform integration |
| Emergency fallback | GUI automation |

### Execution-Speed Comparison

**COLLAPSED BY DEFAULT, `<details>` block, summary: "Expand"**

Once the decision is made, how the order actually gets clicked, typed or sent matters. Human visual reaction time is typically around 200 to 300 ms before accounting for the deliberate mouse movement and clicking that follows it. A real-world screen recognition, decision, mouse click can easily take 300 to 700+ ms in practice. The table below ranks the candidate execution methods by roughly how fast each one can act, once a decision has already been made.

**Table: Execution-speed ranking**

| Rank | Method | Approx. local response time* | Relative speed | How it works |
|---|---|---|---|---|
| 1 | Native trading API / NinjaScript | ~1 to 20 ms | Extremely fast | Sends the order directly through software without touching the mouse. |
| 2 | Custom C# / Windows UI Automation | ~5 to 30 ms | Extremely fast | Directly activates Windows application controls. |
| 3 | AutoHotkey | ~5 to 40 ms | Extremely fast | Executes predefined mouse clicks, keyboard commands, hotkeys and window actions. |
| 4 | PyAutoGUI, known coordinates | ~20 to 100 ms | Very fast | Programmatically moves and clicks the mouse at predetermined screen locations. |
| 5 | OpenCV + mouse automation | ~30 to 150 ms | Very fast | Looks at the screen, finds the correct control, then clicks it. |
| 6 | Playwright / Puppeteer | ~20 to 150 ms | Very fast | Controls browser-based trading interfaces directly. |
| 7 | Local vision AI + computer control | ~100 to 1,000+ ms | Variable | AI interprets the screen and determines what to click. |
| 8 | Cloud vision AI + computer control | ~500 ms to several seconds | Slow | Sends the visual state to an AI service, receives a decision, then acts. |
| Ref. | Comparison: human operator | ~200 to 300 ms reaction only; ~300 to 700+ ms practical action | Baseline | Sees the event, recognises it, reacts, moves mouse or finger, and clicks. |

**Small print:** *These are engineering estimates for the local command/control portion only, not guaranteed order-execution latency. Network, broker, exchange, operating-system, platform and market-data latency come afterward, on top of these numbers.

**End of collapsed block.**

### Candidate Technology Stack

**COLLAPSED BY DEFAULT, `<details>` block, summary: "Expand"**

There is no reason yet to lock in a single stack, and the final architecture will almost certainly be hybrid rather than resting on one model or one vendor. These are the credible candidates per function.

**Table: Function / Candidate technologies**

| Function | Candidate technologies |
|---|---|
| Video capture | OBS |
| Video processing | FFmpeg |
| Image processing | OpenCV |
| Visual recognition | YOLO, vision transformers, multimodal models |
| Audio processing | Whisper, audio classifiers |
| TickStrike interpretation | Audio analysis + visual recognition |
| Data processing | Python |
| High-performance components | C++, Rust |
| Platform integration | C#, NinjaScript |
| State storage | PostgreSQL, TimescaleDB |
| Fast event storage | Redis |
| Training | PyTorch |
| Experiment compute | RunPod GPUs |
| Local inference | Dedicated GPU workstation / server |
| Browser control | Playwright, Puppeteer |
| Desktop control | Windows UI Automation, OpenCV, custom agent |
| Broker communication | REST, WebSocket, FIX, native broker APIs |
| Monitoring | Custom telemetry and replay |

**End of collapsed block.**

### Closing statement

The difficult part is not sending a buy order. It is making a machine *recognise the same situation* a skilled human already recognises.

The project sits at the intersection of market-data engineering, computer vision, audio analysis, temporal modelling, machine learning, human decision modelling, real-time software and execution infrastructure. And it carries one requirement beyond all of those: the system has to learn not merely what the trader did, but what he was trying to do when operating according to the method at its best.

That distinction is what separates a trade copier from a genuine encoding of a methodology. The long-term asset is therefore not a bot. It is a structured digital representation of the trading method, together with the perception, decision, risk and execution infrastructure required to apply it consistently and at machine speed.

### Glossary section (id="glossary")

**Eyebrow:** Reference

## Full glossary

Every technical, trading, and AI term used on this page, in plain language. This list is generated from the same definitions used in the inline tooltips above.

The glossary grid is rendered dynamically by `milestone.js`'s inline script from a `TERMS` object and sorted alphabetically by label. There are 50 unique terms defined (matching the 50 unique `data-k` values used as inline term buttons throughout the page; several keys, such as `vlm`, `opencv`, `ninjascript`, `websocket`, `ui-automation`, `puppeteer`, `playwright`, `csharp`, and `api`, are referenced by more than one inline term button on the page but appear once each in the glossary). Full alphabetical list, term followed by its exact definition:

- **API (Application Programming Interface).** A defined way for two pieces of software to talk to each other. A "broker API" lets a trading program send orders and receive data directly from a brokerage's computers, without a human clicking buttons.
- **AutoHotkey.** A free scripting tool for Windows that lets you automate mouse clicks, keystrokes, hotkeys, and window actions using simple pre-written scripts. It's fast because it's not "thinking". It just executes a fixed, predetermined sequence of actions.
- **Black box (AI).** An AI model whose internal decision-making can't be easily inspected or explained. It takes inputs and produces outputs, but a human can't clearly see "why" it decided what it decided. The opposite of an explicit, rules-based system.
- **C# ("C Sharp").** A general-purpose programming language created by Microsoft. It's the language NinjaScript (used for NinjaTrader add-ons) is built on, making it a natural choice for platform-level integration work.
- **C++ / Rust.** Two programming languages known for speed and precision. They're used instead of Python for the small number of components where every millisecond matters, since Python is slower to execute.
- **Candlestick (chart).** A way of drawing price on a chart where each bar ("candle") shows the open, close, high, and low price for a time period as a small rectangle with wick lines. Reading the shapes and sequences of candlesticks is one of the most basic skills in technical trading.
- **Chromium.** The open-source web browser engine that powers Google Chrome (and several other browsers). Automation tools like Playwright and Puppeteer typically drive a Chromium browser instance to interact with websites programmatically.
- **Computer vision.** A field of AI focused on teaching computers to interpret images and video. For example, recognizing chart patterns or reading an indicator's shape directly from the screen, the way a person would look at it.
- **Deliberate non-entry.** A moment where a setup looked tempting but the trader consciously chose not to take the trade, because the full method wasn't satisfied. Distinct from simply not noticing an opportunity: it's disciplined restraint, and this document treats it as valuable training data in its own right.
- **Divergence (Type 1 / Type 2).** A situation where price moves one way but an indicator (like S949) moves the opposite way. Often a signal that the current price move is losing strength. "Type 1" and "Type 2" are the trader's own naming for two distinct divergence patterns with different reliability and follow-through.
- **Entry / exit.** An "entry" is the moment a trader opens a new position (buys or sells to start a trade). An "exit" is the moment that position is closed out, for a profit or a loss.
- **FFmpeg.** A free command-line tool used to convert, edit, and process video and audio files: the industry-standard "Swiss army knife" for video processing.
- **FIX (protocol).** Financial Information eXchange: an industry-standard messaging format that banks, brokers, and exchanges use to send trade orders and market data to each other electronically.
- **Fibonacci retracement.** A charting tool that marks specific percentage levels (such as 38.2%, 50%, 61.8%) between a recent high and low. Traders watch these levels as places price is statistically likely to pause, reverse, or accelerate.
- **GPU (Graphics Processing Unit).** A specialized computer chip, originally built for rendering graphics, that turns out to be extremely good at the type of math AI training and AI inference require. Essential hardware for any serious machine-learning work.
- **Imitation learning.** A machine-learning approach where a model learns by copying examples of past behavior. The risk highlighted in this document: if the past behavior included mistakes, the model copies the mistakes too, unless the data is explicitly labeled right vs. wrong.
- **Mouse movement (as a time cost).** The physical time it takes a hand to move a cursor to the right spot on screen and click, after the brain has already decided to act. It's a small delay on its own, but it stacks on top of reaction time and adds up in fast-moving markets.
- **NQ.** The ticker symbol for the E-mini Nasdaq-100 futures contract: a standardized agreement to buy or sell the Nasdaq-100 index at a set price on a future date. It is the specific market this trading system is designed to trade.
- **NinjaScript.** The custom programming language used to build add-ons and automated strategies inside NinjaTrader, a popular futures trading platform. Used here as a possible way to plug directly into the trader's existing software.
- **OBS (Open Broadcaster Software).** Free, widely used software for recording or streaming your screen: the tool that would capture the trader's monitor and audio for later analysis.
- **OCR (Optical Character Recognition).** Technology that reads printed or on-screen text and numbers out of an image or video and converts them into actual, usable data. For example, pulling a price or indicator value directly off a screenshot of a trading platform.
- **OpenCV.** A free, open-source software library (a collection of ready-made code) for computer vision tasks: detecting shapes, tracking objects, reading numbers off a screen, etc.
- **Order flow.** The real-time stream of actual buy and sell orders hitting the market: who is aggressively buying versus selling right now, as opposed to just where the price is. TickStrike is one tool for reading it.
- **Order ticket.** The form or panel in a trading platform's interface where you specify what to trade: instrument, buy or sell, order type, quantity. Then submit it to the market.
- **PyAutoGUI.** A Python library that programmatically controls the mouse and keyboard. For example, moving the cursor to an exact pixel location and clicking, or typing text, all from code rather than a person's hand.
- **PyTorch.** A leading open-source software framework (built by Meta) for building and training machine-learning and AI models. If a model in this system needs to "learn" from data, it's likely built with PyTorch.
- **Perception layer.** The part of the system responsible for "seeing", reading the chart, indicators, and sounds, and turning them into data, as opposed to the part that decides what to do with that data.
- **Playwright.** A software tool (by Microsoft) for automating and controlling a web browser programmatically. Lets code click buttons, fill forms, and read a webpage the way a human user would, but automatically.
- **Position size.** How many contracts or shares a trade uses. Essentially, how much money and risk is committed to a single trade. A core lever for controlling risk independent of whether the trade idea itself is right.
- **PostgreSQL.** A free, robust, and very widely used database system: software for reliably storing and organizing structured information, like trade records or system state.
- **Puppeteer.** A software tool (by Google) similar to Playwright. It automates control of a Chrome browser, allowing a program to interact with a website without a human at the keyboard.
- **Python.** A widely used, relatively easy-to-read programming language. It's the dominant language for data science and AI, which is why it's proposed here for the main data-handling work.
- **REST (API).** A common, standardized style of building web APIs. When you see "REST", think: a conventional, request-and-response way for software to talk to a server over the internet.
- **Redis.** An extremely fast, in-memory data store (meaning it keeps data in the computer's active memory rather than on disk) used for information that needs to be read or written almost instantly.
- **Reinforcement learning.** A machine-learning method where a model learns by trial and error, receiving a reward or penalty for its actions, and gradually improving its strategy to earn more reward. Conceptually similar to how a person learns a game.
- **RunPod.** A cloud service that rents out powerful computers with GPUs by the hour. Used for the heavy, temporary computing work of training AI models, without buying the hardware outright.
- **S949.** A custom momentum oscillator (a chart indicator by Rob Mitchell / Ninza.co) used by the trader to spot shifts in market momentum. Its shape relative to price is central to this trading method.
- **Sequence model.** A type of AI model designed to understand data that unfolds over time (a "sequence"), like a series of price moves or chart states in order, rather than a single snapshot.
- **Signal-to-execution timing.** The delay between the moment a valid trading signal actually appears and the moment an order is placed because of it. In fast markets, even a delay of a few hundred milliseconds can change the outcome of a trade.
- **Supervised learning.** A machine-learning method where a model is trained on labeled examples (input paired with the correct answer) so it can learn to predict the answer for new, unseen inputs.
- **Swing high / swing low.** A local peak (swing high) or trough (swing low) on a price chart: a point where price turned around, at least temporarily. Traders use recent swing highs and lows as reference points for tools like Fibonacci retracement.
- **TickStrike.** A third-party order-flow tool that visualizes and sounds alerts based on real-time buying/selling pressure ("order flow") in the market. Effectively a live gauge of who is currently more aggressive, buyers or sellers.
- **TimescaleDB.** An extension to PostgreSQL specifically optimized for "time-series" data: information that is naturally ordered by time, like a stream of prices, which is exactly what a trading system generates constantly.
- **Vision transformer.** A modern type of neural network architecture (the same family behind ChatGPT-style AI) adapted to understand images instead of text. Generally more flexible and powerful than older vision techniques.
- **Vision-language model (multimodal AI).** An AI model that can process more than one type of input at once. For example, looking at an image (like a chart) and reasoning about it in words simultaneously. "Multimodal" means it handles multiple types of data (vision + text) together.
- **Visual reaction time.** The time it takes a person to consciously notice something on screen and begin to respond to it, typically around 200 to 300 milliseconds for a simple visual event, before any physical movement like reaching for the mouse even starts.
- **WebSocket.** A technology that keeps a constant, always-open connection between two computers so data (like live prices) can stream back and forth instantly, instead of one side having to repeatedly ask "anything new?"
- **Whisper.** An AI model (built by OpenAI) that converts spoken audio into written text. Used here to transcribe the trader's spoken commentary during a session.
- **Windows UI Automation.** A built-in Microsoft Windows framework that lets a program identify and control the buttons, fields, and windows of other desktop applications. Similar in spirit to browser automation, but for regular desktop software instead of web pages.
- **YOLO ("You Only Look Once").** A fast, well-known family of AI models for detecting and locating objects within an image or video frame in real time. Useful for spotting a specific chart pattern or on-screen element instantly.

### Footer

Power that stays. Help that leaves.

&copy; 2026 Tribune Inc. (rendered as: © 2026 Tribune Inc.)

This page is confidential and intended for client review only.

Back to tribuneinc.com (link to /)

## 3. Visual Layout & Design

### Shared design tokens

The page loads `assets/style.css` first, then `assets/milestone.css` on top of it. `milestone.css` reuses the site-wide neutral scale (`--daylight`, `--marble`, `--obsidian`, `--basalt`, `--ash`) and the existing brand accents (`--tyrian`, `--tyrian-deep`, `--murex`, `--aurum`, `--error`) already used on `/techstack` and `/partnership`, and it locally declares three new month-accent token families specific to this page, deliberately muted and premium rather than neon, so they sit visually consistent with the palette family already used on `/partnership`:

- **Month 1, `--growth` (`#3C7A5B`), deep muted green.** Signals SEE + ACT: the foundational, already-tractable engineering work. Used for the Month 1 column border in the month row, the Month 1 rail/bar active and done states, the perception and execution track fills in the tracks diagram, the before/after transformation block's "after" accent, the Month 1 milestone box, and the validation ladder's completed-step coloring is instead handled by violet on this page (see below); green here is reserved for Month 1 and for growth/completion accents generally.
- **Month 2, `--trust` (`#2E5A8C`), deep slate-blue.** Signals UNDERSTAND + DECIDE: structured, trustworthy decision-making. Used for the Month 2 column border, the Month 2 rail/bar active and done states, the intelligence track's Month 2 fill, the closed-loop diagram's method-model and decision-engine boxes, the readout blocks' left accent bars, the risk-controller "Approved" card's left border, and the Month 2 milestone box.
- **Month 3, `--violet` (`#5B4B8A`), muted premium indigo/violet.** New to this page (`/partnership` uses a slightly different violet for its own Brain and Month 3 accents), and it sits next to `--tyrian`/`--murex` without clashing. Signals TEST + PROVE: rigor and validation. Used for the Month 3 column border, the Month 3 rail/bar active and done states, the intelligence track's Month 3 fill, the validation ladder's done/active markers, and the Month 3 milestone box. Deliberately never used for blocked or violation states; `--error` (red) is reserved strictly for those, as seen on the risk controller's "Blocked" card.

Each month accent also has a `-deep` variant for text/label contrast and `-tint` / `-tint-strong` variants (soft translucent washes) for background fills, mirroring the existing `--tyrian`/`--tyrian-deep` token pattern from the base stylesheet.

### Section-by-section layout

**Confidential bar:** full-width dark (`--obsidian`) strip, matching the pattern on `/techstack` and `/partnership`, with the confidential tag on the left (gold monospace) and the document title on the right (muted monospace), wrapping on narrow viewports.

**Sticky navigation elements:** the mobile/narrow-desktop `.month-bar` renders as a full-width sticky horizontal strip pinned to the top of the viewport once scrolled, showing three equal-width buttons (M1/M2/M3) with a colored bottom border indicating the active month. The desktop `.month-rail` renders as a fixed vertical panel pinned to the right edge of the viewport, vertically centered, hidden until the visitor scrolls past roughly 60% of the hero's height, and hidden entirely below the 1180px breakpoint (see Section 4 for the show/hide and scroll-spy logic).

**Hero:** single-column, left-aligned block mirroring the `/techstack`/`/partnership` `.doc-hero` pattern. A large H1 (clamped 2.1rem to 3.3rem) with the word "judgment" set in tyrian-deep for emphasis, a lead paragraph capped at 62 characters wide, and a dashed-border "how to read this page" callout box in monospace explaining the term-tooltip and progress-rail mechanisms below it.

**Overview:** a simple three-column "month row" (`.month-row`) of equal-width cards, each with a 4px top border in its month's accent color and a small kicker/value pair ("Month 1" / "See + Act"), collapsing to a single stacked column at 680px and below. Below it, a plain bulleted list elaborates each month, followed by a muted small-print timeline note.

**Three parallel tracks:** a stacked set of three horizontal "lanes" (`.track-lane`), one per track (Perception, Execution, Intelligence), each with a left-side label column (150px fixed width) and a three-cell row to its right, one cell per month. Cells are tinted with that month's tint background wherever the track is materially active in that month: Track A and Track B are tinted green in Month 1 and blue in Month 2, violet in Month 3; Track C is untinted (plain) in Month 1 since intelligence "is not yet central," then tinted blue in Month 2 and violet in Month 3. Perception's and execution's label columns both carry a green left-border accent (both are Month-1-first tracks); intelligence's label column carries a blue left-border accent (it is fundamentally a Month-2 problem). Below the three lanes, a dark full-width "A + B + C, COMPLETE TRADING SYSTEM" banner closes the figure. At 760px and below, each lane collapses from a two-column grid to a single stacked column, and within it the three month-cells also stack to one column.

**Month band dividers:** between each month's block of sections sits a thin colored banner (green, blue, violet in turn) containing a small rounded pill kicker ("01 Month 1", "02 Month 2", "03 Month 3") tinted in that month's strong tint background with deep-toned text. These bands are the primary visual signal, beyond the rail/bar, that the reader has crossed into a new month of the roadmap.

**Month 1, Teach the System to See:** opens with a lead paragraph and a wrapping "chips" row of quick pill tags, where trading-specific or technical chips get a tyrian-tinted "on" state (bordered in tyrian, tinted background) to visually separate jargon chips from plain-language chips such as "live chart movement" or "cursor activity." Below that sits the before/after "transformation block": a three-column grid with a plain "Before" card (warm marble background, listing the raw session's components) on the left, a centered arrow glyph in the middle, and an "After" card with a green left-border accent on the right containing a dense monospace readout block of the resulting structured state. The arrow rotates 90 degrees to point downward and the layout stacks to one column below 820px. A second figure below it renders a wide SVG data-flow diagram showing seven raw input streams converging through a green-bordered "Perception engine" box into a single structured-state box on the right, with a dashed feedback line along the bottom noting the original recording is retained for later re-extraction.

**Month 1, Build the Hands:** a single-figure section containing one horizontal SVG pipeline diagram (simulated command, execution adapter, NinjaTrader/broker interface, order placed in sim mode), each stage a labeled box connected by arrows, with the first "simulated command" box tinted green to mark it as the origin of the flow.

**The Eyes and the Hands:** a two-column grid, collapsing to one column at 820px, holding two ordered-list cards side by side: THE HANDS (green top border, execution steps) and THE EYES (tyrian top border, perception steps), each item numbered with a small monospace index badge. Below the two cards, a centered vertical connector line drops into a single dark converge block reading "THE EYES + THE HANDS, MONTH 1 FOUNDATION," the same converge-block visual metaphor used on the partnership page for combining multiple inputs into one outcome.

**Month 1 target (milestone box):** a full-width green-tinted rounded panel containing a kicker label, an H3 headline, a two-column grid of "complete" cards, each with a circular green checkmark badge and collapsing to one column at 680px, and a plain "Not yet" list using open-circle bullet markers instead of the standard dash-style bullets used elsewhere, visually distinguishing open questions from settled facts.

**Month 2 intro:** a plain lead-paragraph-only section with no figures, serving as a month-band-style transition, followed immediately by the training-problem section.

**The training problem:** opens with a lead paragraph, then a tyrian-bordered pull-quote block contrasting the imitation-learning failure mode against the correct lesson. Below it, a wide SVG figure shows a price track above two parallel horizontal timelines ("Observed, what the trader did" and "Intended, what the method prescribes"), with markers at four aligned x-positions representing Entry, Entry, Exit, and Nothing/Entry events; two vertical dashed connector lines in gold and blue pick out the two points where the tracks diverge, each labeled DIVERGENCE with its specific verdict ("emotional entry, labelled violation" and "valid setup, labelled missed"). A plain bulleted "label set" list follows.

**Restraint Is Training Data:** a single gold-accented callout box (warm cream background, gold left border) containing a short H3 and one paragraph, visually distinct from the tyrian pull-quotes and violet callouts used elsewhere, since gold is the page's "pay attention to this specific nuance" signal.

**Method reconstruction:** a lead paragraph followed by a dense multi-section readout monospace block (blue-accented left border) grouping the structured state into six labeled sub-groups (Instrument, Price structure, S949 oscillator, Fibonacci, TickStrike, Context, Methodology verdict), each with its own small uppercase group header inside the block. Below it, a plain numbered list (1 through 6) walks through the method-teaching progression, each item bolded at the start.

**The Closed-Loop Prototype:** a lead paragraph contrasting the Month 1 and Month 2 pipelines inline, followed by a wide SVG figure of a seven-stage horizontal pipeline (Observe, Structured State, Method Model, Decision Engine, Risk Controller, Simulated Execution, Result/Feedback) connected by blue arrows, with the Method Model and Decision Engine boxes given a blue-tinted fill to mark them as the new Month 2 additions versus the green-tinted Observe, Structured-State, and Simulated-Execution boxes carried over from Month 1. A dashed feedback loop runs from the final box back to the first, labeled "every decision is recorded and feeds back into the method."

**Worked example:** two consecutive blue-accented readout blocks in sequence, the first showing an intermediate "prepare long, but wait" state and the second showing the final "enter long, approved, simulated buy" state a few hundred milliseconds later, visually demonstrating the passage of time within a single decision sequence.

**The AI Requests Trades, Independent Risk Controller:** a two-column grid, collapsing to one column at 820px, of two contrasting cards: "Approved / modified" (blue left border) and "Blocked" (red left border with a red-tinted background), each containing a monospace request line, a checklist of specific risk parameters with bolded pass/fail values, and a bottom-border-separated result line in that card's accent color. This is the clearest instance on the page of the shared approved/blocked visual language, mirroring the equivalent section on the partnership page.

**Month 2 target (milestone box):** a full-width blue-tinted rounded panel, structurally identical to the Month 1 milestone box but without the two-card "complete" grid, since Month 2's deliverable is a single unified prototype rather than two separate ones. It uses a plain paragraph description plus the open-circle "Important qualification" list.

**Month 3 intro and validation questions:** the intro is a plain lead-paragraph section, followed immediately by a plain bulleted list of fourteen validation questions with no figure.

**Real Capital Is a Permission, Not a Calendar Date (validation ladder):** a single vertical figure, capped at 640px wide, of five sequential steps connected by a continuous vertical line running behind circular status-icon badges. Status icons use four distinct visual states: a solid violet-filled checkmark circle for "done" steps, a solid violet-filled dot for the "active" step, a hollow outlined circle for "future" steps, and a padlock glyph on a neutral marble background for the final "locked" step, visually escalating from settled fact through active work to a deliberately gated future state.

**Month 3 target (milestone box):** a full-width violet-tinted rounded panel, structurally identical to the other two milestone boxes, using the open-circle list style for its nine validation questions.

**Funding alignment:** a three-column grid, collapsing to one column at 820px, of three columns each with a 4px top border in that month's accent color (green, blue, violet in order) and a bold dollar-amount readout, closing with a small note about what happens at the end of that month.

**Nine technical gates (collapsed by default):** behind the "Expand Technical Roadmap" disclosure sits a wide SVG staircase figure showing nine ascending, increasingly opaque tyrian-filled rectangles (a rising bar-chart silhouette) with rotated vertical phase labels beneath each step and a dashed gold vertical divider line between phase 7 and phase 8 marking the boundary between "no capital at risk" and "real capital, bounded." Below the figure, a responsive auto-fitting grid of nine small phase cards lists each phase's name and one-line description, with the final two cards (phases 8 and 9) given a tyrian-tinted "live" background to visually mark them as the only phases involving real capital.

**Full Architecture deep dive:** a dashed-border monospace note frames the whole subsection as optional supplementary reading. Three of its four subsections (Five-Layer Runtime Architecture, Execution Options, Execution-Speed Comparison, Candidate Technology Stack) are individually wrapped in their own collapsed-by-default disclosure (all four except Proposal E's table, which sits always visible between Execution Options and Execution-Speed Comparison). The Execution Options subsection contains a wide SVG figure with four horizontal lane diagrams (routes A through D) of increasing hop count, plus a following non-collapsed two-column grid of four detailed option cards, the first ("Proposal A") given a tyrian-tinted "preferred" background wash to visually mark it as the recommended default. The Execution-Speed Comparison subsection contains a horizontally scrollable table. The Candidate Technology Stack subsection contains a second horizontally scrollable table.

**Closing statement:** a top-bordered block with a large headline echoing the hero's emphasis styling, with "recognise the same situation" set in tyrian-deep, followed by two closing paragraphs in the standard body style.

**Glossary:** a responsive auto-filling grid of fifty bordered definition cards, each with a monospace tyrian-deep term and a plain-language definition, rendered entirely client-side from the same TERMS object used by the inline term-tooltip system.

### Responsive breakpoints (from `milestone.css`)

All breakpoints below are max-width media queries:

- **1180px:** the desktop month rail is hidden entirely, and the mobile month bar becomes visible at this same breakpoint, so exactly one of the two navigation aids is ever shown at a time.
- **900px:** tightens the main content area's side padding to 20px, reduces figure-frame padding, and tightens gaps on the milestone "complete" cards, the risk-controller flow grid, and the hands/eyes grid.
- **820px:** the before/after transformation block drops from a three-column grid to a single stacked column and its arrow glyph rotates 90 degrees; the hands/eyes grid drops to one column; the risk-controller flow grid drops to one column; the funding-alignment grid drops to one column.
- **760px:** each track lane drops from its two-column (label plus cells) layout to a single stacked column, and within it the three month-cells also drop from three columns to one, so each track's three month-cells stack vertically beneath its label.
- **680px:** the month row drops from a three-column row to a single stacked column; the Month 1 milestone box's "complete" cards drop from two columns to one.

## 4. Interactive Functions

### Sticky progress rail (desktop) and horizontal bar (mobile), via milestone.js

The script is vanilla JavaScript with zero dependencies, loaded after site.js and scoped entirely to this page. It does not touch the term-tooltip/glossary mechanism, which lives inline in the page's own final script block.

**Section-to-month mapping.** The script defines a section-to-month map assigning each section id to a month number: Month 1 owns overview, tracks, m1-see, m1-act, m1-brainhands, and m1-milestone; Month 2 owns m2-intro, m2-training, m2-notrade, m2-method, m2-loop, m2-example, m2-risk, and m2-milestone; Month 3 owns m3-intro, m3-questions, m3-ladder, and m3-milestone. A separate tail list (funding, gates, deepdive, glossary) covers everything after the three months and is treated as still belonging to Month 3, so the rail does not snap backward once the reader scrolls past the Month 3 milestone box into the funding, gates, deep-dive, or glossary content. It simply stays pinned on "Month 3, done or active" for the rest of the page.

**Active-state tracking.** If IntersectionObserver is supported, the script builds one observer with a root margin of -20% top, -65% bottom (a band roughly across the upper third of the viewport) watching every mapped section element. On each intersection callback, it finds whichever observed section is currently intersecting and sets the active month to that section's assigned month number. Setting the state walks all three rail list items and all three mobile-bar list items, assigning a state of "done" (month index less than the current month), "active" (equal), or "future" (greater) to each, driven purely by CSS attribute selectors for styling: the rail's circular icon dot fills solid in that month's accent color and gains a checkmark for "done" states, stays a hollow accent-colored ring for "active," and stays a plain hollow gray ring for "future." The mobile bar additionally rewrites each icon span's text content directly to a checkmark glyph (done), a solid circle glyph (active), or a hollow circle glyph (future), since the mobile bar has no CSS pseudo-element checkmark. If IntersectionObserver is unsupported, the script skips scroll-spy tracking entirely and simply reveals the rail immediately with no active-state highlighting.

**Rail visibility (desktop only).** The desktop rail starts hidden (zero opacity, no pointer events) via a "show" class toggle. A plain scroll event listener, separate from the intersection observer, checks whether the current scroll position has passed roughly 60% of the hero section's height. If so it adds the show class, and if the reader scrolls back above that point it removes it, so the rail only appears once the reader has meaningfully engaged with the roadmap content and never competes with the hero for attention. The intersection-observer callback also independently reveals the rail the first time any tracked section intersects, as a second, redundant trigger for the same visual effect.

**Click-to-scroll.** Every rail and mobile-bar button carries a data-target attribute holding a section id. A shared click-wiring helper attaches a click listener to every such button that looks up the target element by id and calls its native smooth scroll-into-view behavior, giving both navigation aids working jump-links to each month's opening section regardless of which is currently visible.

### Inline glossary term-tooltip system

This mechanism is implemented inline inside the page's own final script block, not in milestone.js, and is structurally the same pattern used on techstack.

**Term buttons.** Throughout the body copy, specific words and phrases are marked up as button elements carrying a data-k key attribute rather than plain text, styled with a dotted tyrian underline and a help cursor. There are 62 individual term-button occurrences on the page referencing 50 unique data-k keys. Several terms, such as vlm, opencv, ninjascript, websocket, ui-automation, puppeteer, playwright, csharp, and api, are each linked from more than one place on the page, since the same underlying concept, for example OpenCV, comes up in both the narrative text and later in a technology-stack table.

**Tooltip behavior.** A single shared tooltip element is created once and appended to the document body. All 50 term definitions live in one TERMS JavaScript object, keyed by the same data-k string, each value a two-element array of display label and plain-language definition. Clicking any term button: stops the click from bubbling to the page-level close listener; if the same button that is already open is clicked again, closes the tooltip and exits; otherwise closes any other currently open tooltip; fills the shared tooltip element's content with a bolded label line plus the definition text; positions the tooltip absolutely just below and roughly left-aligned with the clicked button, clamped so it never overflows the right edge of the viewport, with a minimum 12px left margin; and adds a show class to reveal it plus an open class to the clicked button, giving it a solid rather than dotted underline while its tooltip is open. The tooltip closes on any click elsewhere on the page, on pressing Escape, or on scrolling, since a passive scroll listener immediately closes it because its absolutely-positioned coordinates would otherwise become stale.

**Relationship to the full glossary.** The same TERMS object also drives the full glossary grid at the bottom of the page. A separate block of script sorts the term keys alphabetically by each entry's display label and appends one definition-list entry per term into the glossary grid container, so the inline tooltips and the bottom-of-page glossary are guaranteed to always show identical, single-source-of-truth definitions, with no duplication of content in the markup itself, only in the rendered output.

### The five progressive-disclosure details/summary deep-dive blocks

All five are native HTML details/summary elements styled by shared CSS rules, with no JavaScript required for the open/close mechanic itself, since the browser's native disclosure behavior handles it. The five blocks, all collapsed by default on page load, are:

1. **"Expand Technical Roadmap"** (inside the Nine Technical Gates section): contains the nine-phase autonomy staircase SVG figure and the nine phase cards.
2. **"Expand"** (Five-Layer Runtime Architecture): contains the five-stage Observe, Understand, Decide, Execute, Evaluate pipeline diagram and its feedback-loop explanation.
3. **"Expand"** (Execution Options): contains the four-lane hop-count diagram and the four detailed option cards (Proposals A through D).
4. **"Expand"** (Execution-Speed Comparison): contains the ranked execution-method table comparing local response times.
5. **"Expand"** (Candidate Technology Stack): contains the function-by-function technology candidate table.

Each summary element uses a rotating triangle glyph (pointing right when collapsed, rotating 90 degrees to point down when open) rather than the browser's default disclosure triangle, and the block gains a bottom border under its summary bar once opened, purely as a CSS state change tied to the native `open` attribute the browser toggles automatically. None of the five blocks are pre-opened by any script; a visitor must explicitly click each one to see its content, and the state of each is independent of the others (opening one does not affect or close any other).

### Scroll reveal animations and hover states

The page loads `site.js` before `milestone.js`, and the site-wide reveal-on-scroll mechanism defined there applies to this page's major section wrappers exactly as it does on `/partnership` and `/techstack`: sections are given a reveal class and animate into view via a shared IntersectionObserver as the reader scrolls down, unless the visitor's OS-level reduced-motion preference is set, in which case all reveal elements are marked visible immediately with no animation. Term buttons have a hover/focus state that shifts their text color to the deeper tyrian tone. The details/summary disclosure triangles rotate on a short CSS transition when toggled. The `.expand-block` summary bar also gets a subtle background tint on hover, signaling it is clickable before the visitor commits to expanding it. All of these transitions are short, in the 0.15 to 0.3 second range, consistent with the fast, unobtrusive feel used across the rest of the confidential document pages on this site.

## 5. Content Notes

### The four-part mental model

The page is organized around one recurring four-part mental model that is stated explicitly in the "The Eyes and the Hands" section and then structures everything that follows it:

- **THE EYES (Perception).** Observe, understand context, recognize method, reject false signal, decide. This is the part of the system responsible for "seeing" what Stan sees: reading the chart, the indicators, and the sounds, and turning them into structured data.
- **THE BRAIN (Method + Decision Logic).** The reconstructed trading methodology plus the decision engine built on top of it: the part that determines whether the method actually calls for action in a given structured state, including the decision to do nothing.
- **THE HANDS (Execution).** Receive command, check risk, place trade, verify fill, manage position. The part of the system that physically carries out an approved trading instruction, first in simulation.
- **THE GUARDRAILS (Independent Risk Control).** A controller, structurally separate from the decision engine, that has final authority over whether a proposed order is permitted, modified, or blocked. Described on the page as always present rather than tied to any single month: "the trading intelligence should never hold direct control of the account."

**How the months map onto the model:** Month 1 builds THE EYES and THE HANDS in parallel, deliberately without yet connecting them through a decision layer, since perception and execution are treated as tractable engineering problems that do not need to wait on the harder reasoning problem. Month 2 builds THE BRAIN, connecting the already-built eyes and hands through the reconstructed method and the decision engine for the first time, which the page calls "the biggest technical milestone" and "the closed-loop prototype." Month 3 is the proving ground: it does not add a new part of the model, it tests all of the parts built so far (recognition accuracy, decision quality, execution reliability) against evidence, and answers whether the system has earned the right to advance. THE GUARDRAILS are present from the moment the decision engine exists in Month 2 onward, described as a permanent structural feature of the architecture rather than a milestone of any single month; the independent risk controller has final authority over every order request for the rest of the system's life, including in the Month 3 validation criteria ("are risk boundaries always enforced") and in the nine-gate autonomy staircase, where even phase 8's controlled real-money execution remains "tightly bounded."

### Funding alignment

The page's Funding Alignment section explicitly states it is a summary for alignment only and that the full funding cards, ownership structure, and partnership terms live on the partnership brief rather than being duplicated here. The three funding columns shown are: Month 1, $12,500, to build the perception and execution foundation; Month 2, $12,500, to connect the methodology, decision engine, and simulation; and Month 3, described as an optional continuation rather than a fixed dollar figure, covering testing, refinement, hardening, and readiness validation, and explicitly "not automatically required if milestones are reached sooner." This mirrors the same milestone-funding structure documented in full on the partnership page, without repeating its ownership or IP content.

### Editorial rules applied

- **No em dashes or en dashes anywhere in the page copy.** Wherever a dash-style pause would normally be used, the page instead uses a comma, a period, or a middle-dot glyph for label separators (for example "Confidential &middot; For client review" or "A &middot; Perception"). This document mirrors that same rule and uses only commas and periods in its own prose.
- **"Stan" is used by name for his specific methodology and decisions, rather than the generic phrase "the trader," in the sections most directly about his judgment.** Examples on the page include "Recognition accuracy validated against live and replayed sessions," "Decision quality and agreement with Stan's judgment tested under pressure," "Does the trader agree with its decisions?" being restated more specifically elsewhere as "Agreement with Stan's judgment," and the hero's own framing, "Encoding a trader's judgment, not his trade history," which pairs the general "a trader's" in the headline with specific references to Stan throughout the body once his name has been introduced. The structured-state readout block even lists a literal "Stan" field with the value "no trade," naming him directly inside the data model itself rather than using a generic "trader" field label.
- **The worked example in Month 2 is explicitly labeled ILLUSTRATIVE, and its confidence is expressed qualitatively as "High" rather than as a precise percentage.** The page states in bold, "ILLUSTRATIVE EXAMPLE," immediately before walking through the two-timestamp decision sequence, and the system verdict's confidence field reads simply "High," not a number like "84%." This is a deliberate contrast with the partnership page's equivalent worked example, which does use a specific percentage ("Confidence: 84%"); the milestones page instead avoids implying a false precision that has not actually been validated yet.
- **The Month 2 milestone is called "A Working Closed-Loop Prototype," not "A Complete Closed-Loop Prototype."** The heading explicitly uses "Working" rather than "Complete," and the surrounding "Important qualification" list reinforces the same caution: not production-ready, not autonomous real-money trading, not assumed profitable, still subject to validation. This is a deliberate downgrade in claimed certainty from the partnership page, which titles its equivalent section "A Complete Closed-Loop Prototype."
- **Real capital is framed throughout as an earned permission rather than a calendar milestone.** The Month 3 section header states this directly: "Real Capital Is a Permission, Not a Calendar Date," and the accompanying paragraph states, "Real capital is not a calendar milestone. It is a permission that must be earned by evidence. Each rung on this ladder has to be passed before the next one is attempted." The same idea recurs in the Month 3 target's framing ("Know Whether the System Has Earned the Right to Advance") and in the nine-gate staircase's figcaption, which notes the locked final stages communicate "discipline, not delay," and that automated control of real capital stays locked "until the evidence, not the schedule, says otherwise."
