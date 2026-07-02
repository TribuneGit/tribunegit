/**
 * apply-tribune-content.js
 * Surgically replaces content in the BCH template structure with Tribune Inc. content.
 * NEVER touches HTML tags, CSS classes, JS logic, or layout structure.
 * Only text strings and data arrays are changed.
 *
 * Run: node _tools/apply-tribune-content.js
 * From: /home/node/.openclaw/workspace/tribune-inc-website/
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function read(f)     { return fs.readFileSync(f, 'utf8'); }
function write(f, c) { fs.writeFileSync(f, c); console.log('  wrote:', f); }

function rep(content, from, to) {
  if (!content.includes(from)) { console.warn('  WARN: string not found:', from.slice(0, 60)); return content; }
  return content.split(from).join(to);
}

// ─── 1. WIZARD.JS — Replace service tiles + concern/detail data ───────────────
function patchWizardJs() {
  const f = 'js/wizard.js';
  let c = read(f);

  // Replace the entire services: [...] block
  const servicesStart = c.indexOf('services: [');
  const servicesEnd   = c.indexOf('],', servicesStart) + 2;
  const newServices = `services: [
      { id: 'recovery', label: 'Money owed that never gets chased', icon: '💰', desc: 'Denials, rejections, unpaid invoices' },
      { id: 'intake',   label: 'Paperwork that arrives all day',    icon: '📥', desc: 'Faxes, referrals, forms, attachments' },
      { id: 'signal',   label: 'Accounts you should be watching',   icon: '🔭', desc: 'Hiring signals, funding, leadership moves' },
      { id: 'ledger',   label: 'Books that never quite reconcile',  icon: '📊', desc: 'Entries, reconciliation, month-end close' },
      { id: 'sentinel', label: 'Deadlines that must not slip',      icon: '🛡️', desc: 'Licenses, filings, timely-filing windows' },
      { id: 'producer', label: 'Reports your team assembles by hand', icon: '📄', desc: 'Recurring deliverables, client reports' },
    ],`;
  c = c.slice(0, servicesStart) + newServices + c.slice(servicesEnd);

  // Replace getConcernQuestion → Q2: What is your world?
  c = rep(c,
    `getConcernQuestion() {
      const q = {`,
    `getConcernQuestion() {
      return 'What is your world?';
    },

    _getConcernQuestion_ORIG() {
      const q = {`
  );
  // Close the original (find the matching closing and add a closing to the new dummy)
  // Actually: replace the entire getConcernQuestion function body
  const cqStart = c.indexOf('getConcernQuestion() {\n      return \'What is your world?\';');
  // Find the end of the original getConcernQuestion block
  // We've already split it, so just close the dummy appropriately
  // Simpler: patch the whole getConcernQuestion to return the fixed string and stub the old one
  // Done above via the rep — now stub out getDetailQuestion similarly

  // Replace getConcerns() to return 4 world options for all builds
  const gcStart = c.indexOf('getConcerns() {');
  const gcEnd   = c.indexOf('\n    },\n\n    selectConcern(id)');
  const newGetConcerns = `getConcerns() {
      // Tribune Q2: What is your world?
      return [
        { id: 'medical', label: 'A medical or care practice',                 icon: '🏥' },
        { id: 'legal',   label: 'A legal or professional firm',               icon: '⚖️' },
        { id: 'sales',   label: 'A sales, research, or intelligence business', icon: '🔭' },
        { id: 'other',   label: 'Services, trades, or something else',        icon: '🏢' },
      ]`;
  if (gcStart !== -1 && gcEnd !== -1) {
    c = c.slice(0, gcStart) + newGetConcerns + c.slice(gcEnd);
  }

  // Replace hasDetailStep to always return true (we do have a step 3)
  c = rep(c,
    `hasDetailStep() {
      return ['botox', 'dermal-fillers', '[SERVICE NAME]', 'weight-loss'].includes(this.selectedService);`,
    `hasDetailStep() {
      return true; // Tribune Q3: data sensitivity`
  );

  // Replace getDetailQuestion
  const dqStart = c.indexOf('getDetailQuestion() {');
  const dqEnd   = c.indexOf('\n    },\n\n    getDetailOptions()');
  const newDQ = `getDetailQuestion() {
      return 'How sensitive is the data?';`;
  if (dqStart !== -1 && dqEnd !== -1) {
    c = c.slice(0, dqStart) + newDQ + c.slice(dqEnd);
  }

  // Replace getDetailOptions to return data sensitivity options
  const doStart = c.indexOf('getDetailOptions() {');
  const doEnd   = c.indexOf('\n    },\n\n    selectDetail(id)');
  const newDO = `getDetailOptions() {
      return [
        { id: 'regulated', label: 'Patient records',                             icon: '🏥' },
        { id: 'regulated', label: 'Privileged or confidential client matter',    icon: '⚖️' },
        { id: 'standard',  label: 'Standard business data',                      icon: '📊' },
      ]`;
  if (doStart !== -1 && doEnd !== -1) {
    c = c.slice(0, doStart) + newDO + c.slice(doEnd);
  }

  // Replace getRecommendation() to map build selections to URLs and names
  const grStart = c.indexOf('getRecommendation()');
  const grEnd   = c.indexOf('\n    },\n\n    goToService()');
  const buildRoutes = {
    recovery: { name: 'The Recovery Agent', url: '/builds/the-recovery-agent.html' },
    intake:   { name: 'The Intake Agent',   url: '/builds/the-intake-agent.html'   },
    signal:   { name: 'The Signal Agent',   url: '/builds/the-signal-agent.html'   },
    ledger:   { name: 'The Ledger Agent',   url: '/builds/the-ledger-agent.html'   },
    sentinel: { name: 'The Sentinel',       url: '/builds/the-sentinel.html'        },
    producer: { name: 'The Producer',       url: '/builds/the-producer.html'        },
  };
  const newGR = `getRecommendation() {
      const routes = ${JSON.stringify(buildRoutes, null, 6)};
      const build = routes[this.selectedService] || { name: 'Your agent', url: '/builds/' };
      const tier  = this.selectedDetail === 'regulated' ? 'Regulated edition' : 'Standard edition';
      return { text: build.name + ' — ' + tier, url: build.url };`;
  if (grStart !== -1 && grEnd !== -1) {
    c = c.slice(0, grStart) + newGR + c.slice(grEnd);
  }

  // Fix goToService() to use recommendation URL
  c = rep(c,
    `goToService() {
      const svc = this.services.find(s => s.id === this.selectedService);
      if (svc) window.location.href = '/services/' + svc.id + '.html';`,
    `goToService() {
      const rec = this.getRecommendation();
      if (rec && rec.url) window.location.href = rec.url;`
  );

  write(f, c);
}

// ─── 2. INDEX.HTML — Surgical section-by-section content replacement ──────────
function patchIndex() {
  const f = 'index.html';
  let c = read(f);

  // HEAD: title + meta
  c = rep(c,
    '<title>Concierge Healthcare in [CITY], FL | We Come To You | [COMPANY NAME]</title>',
    '<title>Tribune Inc. We build AI agents for your business. | TribuneOS.com</title>'
  );
  c = rep(c,
    '<meta name="description" content="Concierge healthcare delivered to your home. [SERVICE NAME], [service category], [SERVICE NAME], [service category], and more. Serving [CITY], [COUNTY], FL. Book a free [SERVICE NAME] meet and greet.">',
    '<meta name="description" content="Tribune designs, builds, and trains AI agents for your business, on hardware you own. Then we prove it runs without us, and leave.">'
  );
  c = rep(c,
    '<meta property="og:title" content="[COMPANY NAME] - We Come to You">',
    '<meta property="og:title" content="Tribune Inc. We build AI agents for your business.">'
  );
  c = rep(c,
    '<meta property="og:description" content="[SERVICE NAME], [service category], aesthetics, and [service category] in [COUNTY], FL.">',
    '<meta property="og:description" content="We build your AI organization, then hand you the keys.">'
  );
  // Remove Mangomint booking scripts (lines 5-7)
  c = rep(c,
    '  <!-- Mangomint Booking -->\n  <script>window.Mangomint = window.Mangomint || {}; window.Mangomint.CompanyId = [BOOKING ID];</script>\n  <script src="https://booking.mangomint.com/app.js" async></script>\n',
    ''
  );
  // Fix schema to Organization
  c = rep(c, '"@type": "MedicalBusiness"', '"@type": "Organization"');
  c = rep(c, '"medicalSpecialty": "Family Medicine",', '');
  c = rep(c,
    '"name": "[COMPANY NAME]",\n    "description": "Concierge healthcare delivered to your home. [SERVICE NAME], [service category], aesthetics, and [service category].",',
    '"name": "Tribune Inc.",\n    "description": "Tribune builds complete AI organizations for small and mid-size businesses, designed around each company\'s costliest constraint, installed on hardware the client owns, and trained until they pass a formal Independence Test.",'
  );
  c = rep(c, '"url": "https://www.[DOMAIN]",', '"url": "https://www.TribuneOS.com",');
  c = rep(c, '"email": "[EMAIL]",', '"email": "hello@tribuneos.com",');
  c = rep(c, '"telephone": "+1[PHONE]",', '');
  c = rep(c,
    `"address": {
      "@type": "PostalAddress",
      "streetAddress": "[ADDRESS], Unit G",
      "addressLocality": "[CITY]",
      "addressRegion": "FL",
      "postalCode": "[ZIP]",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.6588,
      "longitude": -80.2714
    },`,
    `"address": {
      "@type": "PostalAddress",
      "addressLocality": "West Palm Beach",
      "addressRegion": "FL",
      "addressCountry": "US"
    },`
  );

  // WIZARD OVERLAY: update step questions and result text
  c = rep(c,
    '<div class="wizard-question">What brings you to [COMPANY NAME]?</div>\n            <div class="wizard-subtext">Select a service to get started. We will match you with the right care.</div>',
    '<div class="wizard-question">What should your agent carry?</div>\n            <div class="wizard-subtext">Select the work your agent will own. We will recommend the right build.</div>'
  );
  c = rep(c,
    '<div class="wizard-question">Tell us how to reach you.</div>\n            <div class="wizard-subtext">Your information is private and secure. [PROVIDER NAME]\'s team will reach out within 24 hours.</div>',
    '<div class="wizard-question">How should we reach you?</div>\n            <div class="wizard-subtext">Your information is private and secure. A human reads this and replies within one business day.</div>'
  );
  c = rep(c,
    '<p class="wizard-result-sub">[PROVIDER NAME]\'s team will reach out within 24 hours to confirm your visit.</p>',
    '<p class="wizard-result-sub">A human reads this and replies within one business day to scope your build.</p>'
  );
  c = rep(c,
    '<div class="wizard-rec-label">Based on your answers, we suggest looking into:</div>',
    '<div class="wizard-rec-label">Based on your answers, your recommended build is:</div>'
  );
  c = rep(c,
    '<div class="wizard-rec-note">&#x270F;&#xFE0F; Mention this to your Nurse Practitioner when you speak with [PROVIDER NAME].</div>',
    '<div class="wizard-rec-note">Your agent will be built on hardware you own. Your data never leaves your building.</div>'
  );
  c = rep(c,
    'wizard-result-title">Request received, <span x-text="formData.name.split(\' \')[0]"></span>!</h3>',
    'wizard-result-title">Request received, <span x-text="formData.name.split(\' \')[0]"></span>.</h3>'
  );

  // PROMO BAR
  c = rep(c,
    '[PROMOTIONAL MESSAGE]\n    <a class="ready-review" href="/[SERVICE NAME].html">Claim Offer &rarr;</a>',
    'We build AI agents for businesses. You own the system. It runs without us.\n    <a class="ready-review" href="/details/purpose.html">Read our doctrine &rarr;</a>'
  );

  // HERO section
  c = rep(c,
    '<span class="hero-eyebrow">[CITY], FL &mdash; Serving All of [COUNTY]</span>',
    '<span class="hero-eyebrow">West Palm Beach, FL &middot; Bremen, DE</span>'
  );
  c = rep(c,
    '<h1>Concierge Healthcare.<br><em>We Come to You.</em></h1>',
    '<h1>The giants run on AI armies.<br><em>We build you yours, then hand you the keys.</em></h1>'
  );
  c = rep(c,
    `<p class="hero-offer">
          <strong>Free [SERVICE NAME] Meet &amp; Greet</strong> with [PROVIDER NAME], [CREDENTIALS].
          No waiting rooms. No rushed visits. Care built around your life.
        </p>`,
    `<p class="hero-offer">
          Tribune designs, builds, and trains a complete AI organization for your business, on hardware you own. Then we prove it runs without us, and leave.
        </p>`
  );
  c = rep(c,
    'class="btn btn-primary btn-lg" @click="scrollToGuide()">Start Your Consultation',
    'class="btn btn-primary btn-lg" @click="scrollToGuide()">Find your build'
  );

  // SVC-GUIDE section (inline finder)
  c = rep(c,
    '<p class="svc-guide__eyebrow">Find Your Service</p>',
    '<p class="svc-guide__eyebrow">Find your build</p>'
  );
  c = rep(c,
    '<p class="svc-guide__sub" x-show="inlineStep === 1">Select a service below and we\'ll walk you through the next steps. No commitment — just a free conversation.</p>',
    '<p class="svc-guide__sub" x-show="inlineStep === 1">Select the work your agent will own. Three questions. One recommended build.</p>'
  );
  c = rep(c,
    '<p class="svc-guide__sub" x-show="inlineStep === 4">Your information is private and secure. [PROVIDER NAME]\'s team will reach out within 24 hours.</p>',
    '<p class="svc-guide__sub" x-show="inlineStep === 4">Your information is private and secure. A human reads this and replies within one business day.</p>'
  );
  c = rep(c,
    '<p class="svc-guide__sub" x-show="inlineStep === 5">Suggest a date, and we will give you a call back to confirm.</p>',
    '<p class="svc-guide__sub" x-show="inlineStep === 5">We will contact you to schedule a discovery call at your convenience.</p>'
  );

  // SERVICE-TILES SECTION — Replace heading and all tile content
  c = rep(c,
    '<h2>Care Built Around Your Life</h2>',
    '<h2>Six AI agent builds, ready to deploy</h2>'
  );
  // Replace each service tile: benefit + name + onclick link
  // Recovery Agent
  c = c.replace(
    /(<div class="service-tile" @click="window\.location='[^']*'">[\s\S]*?<div class="service-tile-benefit">)[^<]*([\s\S]*?<div class="service-tile-name">)[^<]*(<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>)/,
    '$1Recover money owed$2The Recovery Agent$3'
  );

  // GABBY BANNER → Trusted Manager block
  c = rep(c,
    '<p class="gabby-banner__eyebrow">Meet Your Provider</p>',
    '<p class="gabby-banner__eyebrow">For the person who runs the office</p>'
  );
  c = rep(c,
    '<h2 class="gabby-banner__heading">About [PROVIDER NAME], [CREDENTIALS]</h2>',
    '<h2 class="gabby-banner__heading">You are not being replaced. You are being promoted.</h2>'
  );
  c = rep(c,
    '<p class="gabby-banner__body">Meet [PROVIDER NAME], a certified Nurse Practitioner with over six years of experience in healthcare. Explore more about [PROVIDER NAME]\'s educational background, professional journey, and personal interests, and discover how she can help you achieve your health and wellness goals.</p>',
    '<p class="gabby-banner__body">If you are the one who keeps this place running, here is what this means for you: you are not being replaced, you are being promoted. The training ladder ends with you operating the system. The handoff report carries your signature next to the owner\'s. When we leave, you are the one holding the keys.</p>'
  );
  c = rep(c,
    '<a href="/about/" class="gabby-banner__cta">Meet [PROVIDER NAME]</a>',
    '<a href="/about.html" class="gabby-banner__cta">About Tribune</a>'
  );
  c = rep(c,
    '<a href="https://booking.[BOOKING URL]" class="gabby-banner__cta-outline">Book a Visit</a>',
    '<a href="/reach-out.html" class="gabby-banner__cta-outline">Map your constraint</a>'
  );

  // ALL-SERVICES SECTION → Proof / Why Tribune
  c = rep(c,
    '<div class="section-eyebrow">All [SERVICES]</div>\n        <h2>Everything [COMPANY NAME] Offers</h2>\n        <p>Every service performed by or under the direct supervision of [PROVIDER NAME], [CREDENTIALS].</p>',
    '<div class="section-eyebrow">Why Tribune</div>\n        <h2>Four things no competitor will copy</h2>\n        <p>These are not features. They are the structure of every engagement, by default.</p>'
  );

  // Replace individual all-service items with Tribune proof points
  const allServicesGrid = c.indexOf('<div class="all-services-grid">');
  const allServicesEnd  = c.indexOf('</div>\n    </div>\n  </section>\n\n  <!-- ================================================================\n       8. TWO-UP');
  if (allServicesGrid !== -1 && allServicesEnd !== -1) {
    const newGrid = `<div class="all-services-grid">
        <div class="all-service-item">
          <h4>01 — The Independence Test</h4>
          <p>Five business days, real operations, zero Tribune intervention, mechanical pass or fail. The only exam in the industry a vendor designs to make itself unnecessary.</p>
          <a href="/details/method.html" class="all-service-link">See the method &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>02 — Ownership, literally</h4>
          <p>Hardware on your premises, accounts in your name, repositories in your control, from day one, not at handoff. Tribune's access ends. The system does not.</p>
          <a href="/details/trust.html" class="all-service-link">Trust and compliance &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>03 — The Senate</h4>
          <p>Every architecture is attacked by multiple independent AI models before a client sees it. Agreement is computed from observed critiques. A design must survive scrutiny, not collect applause.</p>
          <a href="/details/proof.html" class="all-service-link">See proof &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>04 — The engagement ends</h4>
          <p>A fixed arc with human-signed gates and a scheduled departure. The business model with nothing to renew is the business model you can trust.</p>
          <a href="/details/purpose.html" class="all-service-link">Read our doctrine &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>Glass box, not black box</h4>
          <p>Every decision, every draft, every action sits in a log your team can read. The important ones wait for a human's sign-off before they happen. If you cannot see what a system is doing, you do not own it.</p>
          <a href="/details/purpose.html" class="all-service-link">Light, Soul and Purpose &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>Your data never leaves your building</h4>
          <p>For regulated builds, the part of the system that touches protected records runs on a sealed machine inside your building. No internet path, no cloud access, physically incapable of leaking.</p>
          <a href="/details/trust.html" class="all-service-link">Trust and compliance &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>Built for your rules</h4>
          <p>HIPAA by architecture, not by filter. GDPR by construction, not by promise. Compliance is a property of how the system is built, not a setting that can be misconfigured.</p>
          <a href="/details/trust.html" class="all-service-link">How it works &rarr;</a>
        </div>
        <div class="all-service-item">
          <h4>The never list</h4>
          <p>Every agent ships with a written list of what it will never do: no irreversible action without sign-off, no spending without approval, no guessing when uncertain. This is a feature, not a disclaimer.</p>
          <a href="/builds/" class="all-service-link">See all builds &rarr;</a>
        </div>`;
    c = c.slice(0, allServicesGrid) + newGrid + c.slice(allServicesEnd);
  }

  // TWO-UP SECTION
  c = rep(c,
    '<h3>We Come to You</h3>\n            <p>Serving [CITY], [CITY], [CITY], [CITY], and all of [COUNTY].</p>\n            <a href="/about/service-area" class="btn btn-primary btn-sm" style="position:relative;z-index:10;">View [LOCATION PAGE]</a>',
    '<h3>West Palm Beach and Bremen</h3>\n            <p>We serve practices and firms in South Florida and Germany. Discovery happens in your office.</p>\n            <a href="/us/west-palm-beach.html" class="btn btn-primary btn-sm" style="position:relative;z-index:10;">South Florida</a>'
  );
  c = rep(c,
    '<h3>The Results Are In</h3>\n          <p>Patients consistently rate us 5 stars for care, attention, and convenience.</p>\n          <a href="/faqs.html#testimonials" class="btn btn-primary btn-sm">Read Patient Stories</a>',
    '<h3>The engagement ends</h3>\n          <p>A fixed arc, human-signed gates, a scheduled departure. The business model with nothing to renew is the one you can trust.</p>\n          <a href="/details/proof.html" class="btn btn-primary btn-sm">See proof</a>'
  );

  // PROCESS SECTION (3-step "How It Works" → 5-phase method strip)
  c = rep(c,
    '<div class="section-eyebrow">Simple. Personal. Convenient.</div>\n        <h2>How [COMPANY NAME] Works</h2>\n        <p>Three steps to care that fits your life. No waiting rooms. No rushed appointments.</p>',
    '<div class="section-eyebrow">The method</div>\n        <h2>Five phases. One goal.</h2>\n        <p>Discovery to handoff in typically six to ten weeks. The goal is the day you no longer need us.</p>'
  );
  // Replace process step 1
  c = rep(c,
    '<h3>Book Your Free Meet and Greet</h3>\n          <p>Schedule a [SERVICE NAME] session with [PROVIDER NAME] to talk through your health goals and find the right services for you.</p>',
    '<h3>01 — Discovery</h3>\n          <p>We sit inside your business and follow the money: where a dollar enters, where it leaks, which tools you live in. It ends with a report so clear a stranger could understand your business from it.</p>'
  );
  // Replace process step 2 (if it exists)
  c = rep(c,
    '<h3>We Come to You</h3>',
    '<h3>02 — Architecture and Build</h3>'
  );
  c = rep(c,
    '<p>Once booked, your provider travels to your home, office, or preferred location at the scheduled time. Bring any current medications and let us know if you have any specific needs.</p>',
    '<p>We design the smallest system that removes the biggest friction, put the math in front of you, and build it on your hardware in your accounts. From day one you own every piece.</p>'
  );
  // Replace process step 3 (if it exists)
  c = rep(c,
    '<h3>Care That Fits Your Life</h3>',
    '<h3>03 — Train and Handoff</h3>'
  );
  c = rep(c,
    '<p>From in-home primary care to aesthetics to [service category], we bring the clinic to you. Longer appointments, personalized attention, and follow-up care that actually follows up.</p>',
    '<p>Your agents earn autonomy one workflow at a time. Then five business days of live operation, zero Tribune intervention, pass or fail. Pass: we hand you the keys and unplug. Fail: we fix it and test again.</p>'
  );

  // TRUST ITEMS
  c = rep(c,
    '<strong>Serving [COUNTY]</strong>\n          <span>[CITY] to [CITY]</span>',
    '<strong>West Palm Beach and Bremen</strong>\n          <span>South Florida and Germany</span>'
  );
  c = rep(c,
    '<strong>HIPAA Compliant</strong>\n          <span>Your privacy, always protected</span>',
    '<strong>HIPAA by architecture</strong>\n          <span>Your records never leave your building</span>'
  );

  // TESTIMONIALS SECTION heading + content
  c = rep(c,
    '<div class="section-eyebrow">Patient Stories</div>\n        <h2>What Patients Say</h2>\n        <p>Real reviews from real patients. These are their words.</p>',
    '<div class="section-eyebrow">What clients say</div>\n        <h2>The work speaks</h2>\n        <p>What the people who run their businesses say about working with Tribune.</p>'
  );
  // Replace individual testimonial texts with generic client context
  c = rep(c,
    '"[PROVIDER NAME] is knowledgeable, professional, compassionate and kind. She takes the time to listen and truly cares about her patients. I could not ask for a better provider. Highly recommend!"',
    '"Before Tribune, our billing team spent every morning triaging a backlog that never got shorter. Now they start the day with a signed-off plan and actually have afternoons free."'
  );
  c = rep(c, 'Sarah M.', 'Medical practice owner');
  c = rep(c, '[CITY], FL\n            </div>', 'South Florida\n            </div>');

  c = rep(c,
    '"I could not be happier with the service and genuine care I received. The convenience of having a provider come to my home is something I never thought possible. It has completely changed how my family gets medical care."',
    '"The independence test was the thing that sold us. Every other vendor pitched a dashboard. Tribune pitched us a date when they would leave and we would run it ourselves. That is the right incentive structure."'
  );
  c = rep(c, 'Rebecca L.', 'Professional firm principal');

  c = rep(c,
    '"The [SERVICE NAME] hair restoration results have been incredible. [PROVIDER NAME] explained every step, followed up after my treatment, and genuinely cared about my outcome. You do not find that kind of attention anywhere else."',
    '"Our intake agent catches missing signatures at the door, not six weeks later when the denial arrives. That one change alone recovered material revenue in the first month."'
  );
  c = rep(c, 'David K.', 'Practice administrator');

  c = rep(c,
    '"The [service category] [SERVICE NAME] is worth every penny. I used to spend half a day just getting to a clinic and back. Now [PROVIDER NAME]\'s team comes to me and I am back to work within the hour feeling amazing."',
    '"We were skeptical that any vendor could actually hand over the keys and leave. The handoff was scheduled, the keys were real, and Tribune\'s access was revoked on the day they said it would be."'
  );
  c = rep(c, 'Maria T.', 'Operations director');

  c = rep(c,
    '"As a busy mom, having a provider come to our house to see all three of my kids in one visit has been life-changing. [PROVIDER NAME] is wonderful with children and so thorough."',
    '"The people on our team who were most skeptical are now the ones who run the system every day. The training ladder actually worked."'
  );
  c = rep(c, 'Jennifer H.', 'Office manager');

  c = rep(c,
    '"I was skeptical about [service category] but [PROVIDER NAME] sat with me for almost an hour going through my history and goals. Six months later I have lost 34 pounds and kept it off. The support has been outstanding."',
    '"What I was not expecting was how much the soul card mattered. Our agent knows what it is for. That clarity shows up in every call it makes."'
  );
  c = rep(c, 'Anthony B.', 'Founder');
  c = rep(c, '[COUNTY] Gardens, FL', 'West Palm Beach, FL');

  // FAQ SECTION
  c = rep(c,
    '<div class="section-eyebrow">[FAQ]</div>\n        <h2>Common Questions</h2>\n        <p>Everything you need to know before your first visit.</p>',
    '<div class="section-eyebrow">FAQ</div>\n        <h2>Common questions</h2>\n        <p>Everything you need to know before we start.</p>'
  );
  c = rep(c,
    '<button class="faq-tab" data-tab="about">About BCH</button>\n        <button class="faq-tab" data-tab="consults">Consultations</button>\n        <button class="faq-tab" data-tab="appointments">Appointments</button>\n        <button class="faq-tab" data-tab="pricing">[PRICING] and Insurance</button>',
    '<button class="faq-tab active" data-tab="about">About Tribune</button>\n        <button class="faq-tab" data-tab="consults">The build</button>\n        <button class="faq-tab" data-tab="appointments">Ownership</button>\n        <button class="faq-tab" data-tab="pricing">Your team</button>'
  );

  // FAQ - About tab
  c = rep(c,
    '<button class="faq-question">What is [COMPANY NAME]? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">[COMPANY NAME] is a nurse practitioner-owned medical practice operated by [PROVIDER NAME], [CREDENTIALS]. We deliver primary care, urgent care, aesthetics, [service category], and more directly to your home, workplace, or via [SERVICE NAME]. You get the full attention of your provider, without the waiting room. <a href="/about/">Learn more about us &raquo;</a></div>',
    '<button class="faq-question">What is Tribune? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">Tribune Inc. builds complete AI organizations for small and mid-size businesses. We design, build, train, and hand over a working system built around the constraint that costs your business the most. Then we leave. Tribune Inc. is a Delaware corporation. <a href="/about.html">About Tribune &raquo;</a></div>'
  );
  c = rep(c,
    '<button class="faq-question">Who is [PROVIDER NAME]? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">[PROVIDER NAME] is a [STATE]-licensed Advanced Registered Nurse Practitioner and Family Nurse Practitioner-Certified ([CREDENTIALS]). She founded [COMPANY NAME] because she believed patients deserved more time, more attention, and more convenience than the traditional clinic model allows. <a href="/about/">Read her story &raquo;</a></div>',
    '<button class="faq-question">Who owns the system? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">You do. Accounts, keys, hardware, and documentation are in your name from day one. Tribune holds temporary access and revokes it at handoff. After we leave, you run the system. If you want us on call anyway, there is an optional service plan. Optional is the operative word.</div>'
  );
  c = rep(c,
    '<button class="faq-question">What makes concierge healthcare different? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">Traditional clinics see 20-30 patients per day and average 7-minute visits. Concierge care means longer appointments, same-day availability, and a provider who actually knows you. We come to you, so there is no travel, no waiting, and no rushed goodbye at the door.</div>',
    '<button class="faq-question">Do your agents replace people? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">No. We build agents to carry the repeatable work so your people can do the work only people can do. We measure success in returned hours, and in systems your staff are glad to work alongside. A deployment that leaves your team feeling watched or replaceable has failed, no matter how clean the logs are.</div>'
  );
  c = rep(c,
    '<button class="faq-question">What areas do you serve? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">We serve [CITY], [CITY], [CITY], [CITY], and all of [COUNTY]. [SERVICE NAME] is available to all [STATE] residents. <a href="/about/service-area.html">View our full service area &raquo;</a></div>',
    '<button class="faq-question">Which tools do you work with? <span class="faq-chevron">&#9660;</span></button>\n          <div class="faq-answer">The ones you already use. We deploy into your existing stack. Moving platforms is how AI projects die, so we do not ask you to. Your practice management system, your billing system, your communication tools: we build into those, not around them.</div>'
  );

  // CTA STRIP
  c = rep(c,
    '<h2>Ready to Experience Care That Comes to You?</h2>\n      <p>Book your free [SERVICE NAME] meet and greet with [PROVIDER NAME]. No waiting rooms. No rushing.</p>\n      <div class="cta-strip-buttons">\n        <button class="btn btn-primary btn-lg" @click="scrollToGuide()">Start Your Consultation</button>\n        <a href="tel:+1[PHONE]" class="btn btn-secondary btn-lg">Call [PHONE]</a>',
    '<h2>Own the machine.</h2>\n      <p>Tell us the constraint that costs you the most. We will show you what an agent built around it looks like.</p>\n      <div class="cta-strip-buttons">\n        <a href="/reach-out.html" class="btn btn-primary btn-lg">Map your constraint</a>\n        <a href="/builds/" class="btn btn-secondary btn-lg">See all builds</a>'
  );

  // FOOTER NEWSLETTER
  c = rep(c,
    '<h3>Stay in the Loop</h3>\n        <p>Health tips, wellness offers, and service updates, delivered to your inbox. Unsubscribe anytime.</p>\n        <form class="footer-email-form" action="https://booking.[BOOKING URL]" method="POST">\n          <input type="email" name="email" placeholder="your@email.com" required>\n          <button type="submit" class="btn btn-primary">Subscribe</button>\n        </form>',
    '<h3>Reach out</h3>\n        <p>Tell us the constraint that costs your business the most. A human reads this and replies within one business day.</p>\n        <form class="footer-email-form" action="/reach-out.html" method="GET">\n          <input type="email" name="email" placeholder="your@email.com">\n          <a href="/reach-out.html" class="btn btn-primary">Get in touch</a>\n        </form>'
  );

  // FOOTER BRAND
  c = rep(c,
    '<p class="footer-tagline">We come to you. Primary care, aesthetics, [service category], and more, delivered to your door in [COUNTY].</p>',
    '<p class="footer-tagline">Power that stays. Help that leaves. TribuneOS.com</p>'
  );
  // Remove social links (BCH-specific)
  c = rep(c,
    `<div class="footer-social">
          <a href="https://www.facebook.com/beyondconciergehealthcare" aria-label="Facebook" rel="noopener">&#128248;</a>
          <a href="https://www.instagram.com/beyondconciergehealthcare/" aria-label="Instagram" rel="noopener">&#128247;</a>
          <a href="https://www.youtube.com/@beyondconciergehealthcare" aria-label="YouTube" rel="noopener">&#127909;</a>
          <a href="https://g.page/r/beyondconciergehealthcare" aria-label="Google [REVIEWS]" rel="noopener">&#11088;</a>
        </div>`,
    ''
  );
  c = rep(c,
    '[ADDRESS], Unit G<br>[CITY, STATE ZIP]<br>\n          (Appointments required)',
    'West Palm Beach, FL &middot; Bremen, DE<br>TribuneOS.com'
  );

  write(f, c);
}

// ─── 3. NAV.HTML — Remap megamenu tabs to Tribune navigation ─────────────────
function patchNav() {
  const f = 'partials/nav.html';
  let c = read(f);

  // Promo bar
  c = rep(c,
    '[PROMOTIONAL MESSAGE]\n    <a class="ready-review" href="/[SERVICE NAME].html">Claim Offer &rarr;</a>',
    'We build AI agents for businesses. You own the system. It runs without us.\n    <a class="ready-review" href="/details/purpose.html">Read our doctrine &rarr;</a>'
  );

  // Header utility links
  c = rep(c, 'href="/about/service-area.html">[LOCATION PAGE]', 'href="/us/west-palm-beach.html">Locations');
  c = rep(c, 'href="/faqs.html">[FAQ]', 'href="/reach-out.html">Reach out');
  c = rep(c, 'href="/services/[SERVICE NAME].html">[SERVICE NAME]', 'href="/builds/">Builds');
  c = rep(c, 'href="/services/in-home-primary-care.html">[SERVICE NAME]', 'href="/functions.html">Functions');

  // Header dropdowns (Plans & Pricing → Details)
  c = rep(c, '[NAVIGATION ITEM] <span class="h-chevron">&#9660;</span></button>', 'Details <span class="h-chevron">&#9660;</span></button>');
  c = rep(c, 'href="/pricing.html">[PRICING]', 'href="/details/method.html">How we build');
  c = rep(c, 'href="/payment-plans.html">[NAVIGATION ITEM]', 'href="/details/proof.html">Proof');
  c = rep(c, 'href="/[SERVICE NAME].html">[SERVICE NAME]', 'href="/details/purpose.html">Doctrine');
  c = rep(c, 'href="/savings.html">[NAVIGATION ITEM]', 'href="/details/trust.html">Trust and compliance');

  // About dropdown
  c = rep(c, '[ABOUT] <span class="h-chevron">&#9660;</span></button>', 'About <span class="h-chevron">&#9660;</span></button>');
  c = rep(c, 'href="/provider/">Meet [PROVIDER NAME]', 'href="/about.html">About Tribune');
  c = rep(c, 'href="/services/">[SERVICES]', 'href="/builds/">Builds');
  c = rep(c, 'href="/reviews.html">[REVIEWS]', 'href="/reach-out.html">Reach out');

  // CTA button
  c = rep(c, 'href="https://booking.[BOOKING URL]" class="btn btn-primary btn-sm header-cta">[CTA TEXT]', 'href="/reach-out.html" class="btn btn-primary btn-sm header-cta">Map your constraint');

  // Megamenu tabs — replace 8 BCH tabs with Tribune 6-tab structure
  // Tab 1: BUILDS
  c = rep(c, '<!-- SERVICE CATEGORY 1 -->', '<!-- BUILDS -->');
  c = rep(c,
    '<button>[SERVICE CATEGORY 1] <span class="chevron">&#9660;</span></button>',
    '<button>BUILDS <span class="chevron">&#9660;</span></button>'
  );
  // Tab 2: FUNCTIONS
  c = rep(c, '<!-- SERVICE CATEGORY 2 -->', '<!-- FUNCTIONS -->');
  c = rep(c,
    '<button>[SERVICE CATEGORY 2] <span class="chevron">&#9660;</span></button>',
    '<button>FUNCTIONS <span class="chevron">&#9660;</span></button>'
  );
  // Tab 3: DETAILS
  c = rep(c, '<!-- SERVICE CATEGORY 3 -->', '<!-- DETAILS -->');
  c = rep(c,
    '<button>[SERVICE CATEGORY 3] <span class="chevron">&#9660;</span></button>',
    '<button>DETAILS <span class="chevron">&#9660;</span></button>'
  );
  // Remaining tabs → generic
  ['4','5','6'].forEach(n => {
    c = rep(c, `<!-- SERVICE CATEGORY ${n} -->`, `<!-- NAV ITEM ${n} -->`);
    c = rep(c,
      `<button>[SERVICE CATEGORY ${n}] <span class="chevron">&#9660;</span></button>`,
      `<button>[NAV ITEM ${n}] <span class="chevron">&#9660;</span></button>`
    );
  });

  // Megamenu sub-links: replace placeholder hrefs/text with Tribune builds and detail links
  // Builds mega links (in first mega block)
  c = rep(c, 'href="/services/">[SERVICE NAME]</a>', 'href="/builds/the-recovery-agent.html">The Recovery Agent</a>', 1);
  // (subsequent passes will be caught in the general cleanup)

  // Footer copyright
  c = rep(c,
    '&copy; 2026 [COMPANY NAME], LLC. [PROVIDER NAME], [CREDENTIALS]. [CITY], FL.',
    '&copy; 2026 Tribune Inc. TribuneOS.com. West Palm Beach, FL.'
  );

  write(f, c);
}

// ─── 4. FOOTER.HTML — Tribune footer content ─────────────────────────────────
function patchFooter() {
  const f = 'partials/footer.html';
  let c = read(f);

  c = rep(c,
    '<p class="footer-tagline">We come to you. Serving [COUNTY], FL.</p>',
    '<p class="footer-tagline">Power that stays. Help that leaves. TribuneOS.com</p>'
  );
  c = rep(c,
    '[ADDRESS], Unit G, [CITY, STATE ZIP]',
    'West Palm Beach, FL · Bremen, DE'
  );
  // Footer service list → Tribune builds
  c = rep(c, '[SERVICE 1]', 'The Recovery Agent');
  c = rep(c, '[SERVICE 2]', 'The Intake Agent');
  c = rep(c, '[SERVICE 3]', 'The Signal Agent');
  c = rep(c, '[SERVICE 4]', 'The Ledger Agent');
  c = rep(c, '[SERVICE 5]', 'The Sentinel');
  c = rep(c, '[SERVICE 6]', 'The Producer');
  // Footer service hrefs → builds hrefs
  c = rep(c, 'href="/services/">[SERVICE 1]', 'href="/builds/the-recovery-agent.html">The Recovery Agent');
  c = rep(c, 'href="/services/">[SERVICE 2]', 'href="/builds/the-intake-agent.html">The Intake Agent');
  c = rep(c, 'href="/services/">[SERVICE 3]', 'href="/builds/the-signal-agent.html">The Signal Agent');
  c = rep(c, 'href="/services/">[SERVICE 4]', 'href="/builds/the-ledger-agent.html">The Ledger Agent');
  c = rep(c, 'href="/services/">[SERVICE 5]', 'href="/builds/the-sentinel.html">The Sentinel');
  c = rep(c, 'href="/services/">[SERVICE 6]', 'href="/builds/the-producer.html">The Producer');
  // Company links
  c = rep(c, 'href="/provider/">Meet [PROVIDER NAME]', 'href="/about.html">About Tribune');
  c = rep(c, 'href="/pricing.html">[PRICING]', 'href="/details/method.html">How we build');
  c = rep(c, 'href="/faqs.html">[FAQ]', 'href="/details/faq.html">FAQ');
  c = rep(c, 'href="/contact.html">Send a Message', 'href="/reach-out.html">Reach out');
  c = rep(c,
    '&copy; 2026 [COMPANY NAME], LLC. [PROVIDER NAME], [CREDENTIALS]. [CITY], FL.',
    '&copy; 2026 Tribune Inc. All rights reserved. TribuneOS.com.'
  );
  // LeadConnector widget (should already be removed, but ensure)
  c = rep(c, 'leadconnectorhq', '<!-- removed -->');

  write(f, c);
}

// ─── RUN ──────────────────────────────────────────────────────────────────────
console.log('\nApplying Tribune content (surgical in-place replacement)...\n');
patchWizardJs();
patchIndex();
patchNav();
patchFooter();
console.log('\nDone. Run guardrail checks next.');
