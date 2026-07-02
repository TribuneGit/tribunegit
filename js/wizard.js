/**
 * [COMPANY NAME] — Service Guide Wizard
 * Alpine.js state machine
 *
 * HIPAA COMPLIANCE (updated 2026-06-05):
 *   - Wizard questions/selections are for UX guidance ONLY — never sent to webhook
 *   - Webhook payload: name, email, phone, proposed date/time, service label, page, ts
 *   - Health data (concerns, goals, areas, conditions) stays in the browser — never transmitted
 *   - Result screen shows a service suggestion — not a diagnosis or treatment plan
 *
 * Modal flow (4 steps + result):
 *   1 → Service selection
 *   2 → Interest/area (UX only)
 *   3 → Detail (optional, UX only)
 *   4 → Contact + Proposed Date & Time
 *   5 → Result: recommendation + two action buttons
 */

function wizardData(preselect) {
  return {

    // -----------------------------------------------------------------------
    // Visibility
    // -----------------------------------------------------------------------
    open:   false,
    inline: false,

    // -----------------------------------------------------------------------
    // Inline guide (service pages) — unchanged, addressed separately
    // -----------------------------------------------------------------------
    inlineStep: preselect ? 2 : 1,

    inlineNext() {
      if (this.inlineStep === 1 && this.selectedService) {
        this.selectedConcern = null;
        this.inlineStep = 2;
      } else if (this.inlineStep === 2 && this.selectedConcern) {
        this.selectedDetail = null;
        this.inlineStep = this.hasDetailStep() ? 3 : 4;
      } else if (this.inlineStep === 3 && this.selectedDetail) {
        this.inlineStep = 4;
      } else if (this.inlineStep === 4 && this.inlineContactValid()) {
        this.inlineStep = 5;
      } else if (this.inlineStep === 5) {
        this.inlineDoSubmit();
      }
    },

    inlinePrev() {
      const floor = preselect ? 2 : 1;
      if (this.inlineStep === 3) { this.selectedDetail = null; this.inlineStep = 2; }
      else if (this.inlineStep === 4) { this.inlineStep = this.hasDetailStep() ? 3 : 2; }
      else if (this.inlineStep === 5) { this.inlineStep = 4; }
      else if (this.inlineStep > floor) { this.inlineStep--; }
    },

    inlineCanNext() {
      switch (this.inlineStep) {
        case 1: return !!this.selectedService;
        case 2: return !!this.selectedConcern;
        case 3: return !!this.selectedDetail;
        case 4: return this.inlineContactValid();
        case 5: return true; // date optional — always allow submit
        default: return false;
      }
    },

    inlineContactValid() {
      return !!(this.formData.name.trim() &&
                this.formData.email.includes('@') &&
                this.formData.phone.replace(/\D/,'').length >= 10 &&
                this.formData.consent);
    },

    inlineHeading() {
      switch (this.inlineStep) {
        case 1: return 'What can we help you with?';
        case 2: return this.getConcernQuestion();
        case 3: return this.getDetailQuestion();
        case 4: return 'Tell us how to reach you.';
        case 5: return 'Pick a Date & Time';
        case 6: return 'We have a suggestion for you.';
        default: return '';
      }
    },

    inlineStepLabel() {
      if (preselect) {
        const map = { 2:'Step 1: Your Interest', 3:'Step 2: More Details', 4:'Step 3: Contact', 5:'Step 4: Date & Time', 6:'' };
        return map[this.inlineStep] || '';
      }
      const labels = ['','Step 1: Service','Step 2: Interest','Step 3: Details','Step 4: Contact','Step 5: Date & Time',''];
      return labels[this.inlineStep] || '';
    },

    inlineNextLabel() {
      if (this.inlineStep === 5) return 'Send Request';
      return 'Next ›';
    },

    inlineDoSubmit() {
      this.inlineStep = 6;
      this._fireLeadWebhook('inline_wizard');
    },

    // -----------------------------------------------------------------------
    // Recommendation engine
    // Maps service + concern → a specific suggestion shown to the user
    // This is UX/marketing only — never a diagnosis or treatment plan
    // -----------------------------------------------------------------------
    getRecommendation() {
      const s = this.selectedService;
      const c = this.selectedConcern;

      const map = {
        'iv-therapy': {
          'energy':    { text: 'IV Therapy — Myers Cocktail',              slug: 'iv-therapy' },
          'immunity':  { text: 'IV Therapy — Immunity Boost Cocktail',     slug: 'iv-therapy' },
          'recovery':  { text: 'IV Therapy — Recovery Drip',              slug: 'iv-therapy' },
          'hydration': { text: 'IV Therapy — Hydration Drip',             slug: 'iv-therapy' },
          'hangover':  { text: 'IV Therapy — Hangover Relief Cocktail',   slug: 'iv-therapy' },
          'glow':      { text: 'IV Therapy — Beauty & Glow Drip',         slug: 'iv-therapy' },
        },
        'weight-loss': {
          'lose':     { text: 'Medical Weight Loss — GLP-1 Program',       slug: 'weight-loss' },
          'maintain': { text: 'Medical Weight Loss — Maintenance Program', slug: 'weight-loss' },
          'plan':     { text: 'Medical Weight Loss — Provider Consultation',slug: 'weight-loss' },
        },
        'botox': {
          'forehead':  { text: 'Botox — Forehead & Frown Line Treatment',  slug: 'botox' },
          'frown':     { text: 'Botox — Frown Line Treatment',             slug: 'botox' },
          'crows':     { text: "Botox — Crow's Feet Treatment",            slug: 'botox' },
          'brow':      { text: 'Botox — Brow Lift & Refresh',             slug: 'botox' },
          'lip-flip':  { text: 'Botox — Lip Flip',                        slug: 'botox' },
          'jawline':   { text: 'Botox — Jawline Slimming',                slug: 'botox' },
        },
        'dermal-fillers': {
          'lips':      { text: 'Dermal Fillers — Lip Enhancement',         slug: 'dermal-fillers' },
          'cheeks':    { text: 'Dermal Fillers — Cheek Augmentation',      slug: 'dermal-fillers' },
          'jawline':   { text: 'Dermal Fillers — Jawline Definition',      slug: 'dermal-fillers' },
          'smile':     { text: 'Dermal Fillers — Smile Line Treatment',    slug: 'dermal-fillers' },
          'chin':      { text: 'Dermal Fillers — Chin Enhancement',        slug: 'dermal-fillers' },
          'under-eye': { text: 'Dermal Fillers — Under-Eye Rejuvenation',  slug: 'dermal-fillers' },
        },
        'microneedling': {
          'glow':     { text: 'Microneedling — Glow & Radiance Treatment', slug: 'microneedling' },
          'texture':  { text: 'Microneedling — Texture Smoothing',         slug: 'microneedling' },
          'lines':    { text: 'Microneedling with PRP — Fine Line Treatment', slug: 'microneedling' },
          'tone':     { text: 'Microneedling — Tone & Pigmentation',       slug: 'microneedling' },
        },
        'in-home-care': {
          'myself':   { text: 'In-Home Primary Care — Adult Visit',         slug: 'in-home-primary-care' },
          'child':    { text: 'In-Home Primary Care — Pediatric Visit',     slug: 'in-home-primary-care' },
          'senior':   { text: 'In-Home Primary Care — Senior Care Visit',  slug: 'in-home-primary-care' },
          'family':   { text: 'In-Home Primary Care — Family Visit',        slug: 'in-home-primary-care' },
        },
        'urgent-care': {
          'same-day': { text: 'Urgent Care — Same-Day In-Home Visit',       slug: 'urgent-care' },
          'lab':      { text: 'Urgent Care — In-Home Lab Work',             slug: 'urgent-care' },
          'not-sure': { text: 'Urgent Care — In-Home Visit',               slug: 'urgent-care' },
        },
        'fertility': {
          'me':       { text: 'Fertility Care — Individual Evaluation',     slug: 'fertility' },
          'partner':  { text: 'Fertility Care — Partner Evaluation',       slug: 'fertility' },
          'both':     { text: 'Fertility Care — Couples Evaluation',        slug: 'fertility' },
        },
        'cryotherapy': {
          'recovery':    { text: 'Cryotherapy — Recovery Session',          slug: 'cryotherapy' },
          'performance': { text: 'Cryotherapy — Performance Enhancement',  slug: 'cryotherapy' },
          'wellness':    { text: 'Cryotherapy — Wellness Session',          slug: 'cryotherapy' },
          'skin':        { text: 'Cryotherapy — Skin & Glow Treatment',    slug: 'cryotherapy' },
        },
        'prp-facial': {
          'glow':      { text: 'PRP Vampire Facial — Glow Treatment',       slug: 'prp-facial' },
          'texture':   { text: 'PRP Vampire Facial — Texture Improvement', slug: 'prp-facial' },
          'under-eye': { text: 'PRP Vampire Facial — Under-Eye Treatment', slug: 'prp-facial' },
          'rejuv':     { text: 'PRP Vampire Facial — Full Rejuvenation',   slug: 'prp-facial' },
        },
        'membership': {
          'basic':    { text: 'Concierge Membership — Core Care Plan',      slug: 'membership' },
          'plus':     { text: 'Concierge Membership — Plus Plan',           slug: 'membership' },
          'elite':    { text: 'Concierge Membership — Elite Plan',          slug: 'membership' },
          'not-sure': { text: 'Concierge Membership — Free Consultation',   slug: 'membership' },
        },
        'nad-plus': {
          'anti-aging':  { text: 'NAD+ IV Therapy — Anti-Aging Protocol',   slug: 'iv-therapy' },
          'clarity':     { text: 'NAD+ IV Therapy — Brain Clarity Protocol',slug: 'iv-therapy' },
          'energy':      { text: 'NAD+ IV Therapy — Energy Protocol',       slug: 'iv-therapy' },
          'performance': { text: 'NAD+ IV Therapy — Athletic Performance',  slug: 'iv-therapy' },
          'not-sure':    { text: 'NAD+ IV Therapy',                         slug: 'iv-therapy' },
        },
        'prp-hair': {
          'fuller':    { text: 'PRP Hair Restoration — Fuller Hair',         slug: 'prp-hair' },
          'scalp':     { text: 'PRP Hair Restoration — Scalp Health',       slug: 'prp-hair' },
          'thickness': { text: 'PRP Hair Restoration — Overall Thickness',  slug: 'prp-hair' },
        },
        'b12-injections': {
          'energy':  { text: 'B12 Injections — Energy Boost',              slug: 'b12-injections' },
          'mood':    { text: 'B12 Injections — Mood & Vitality',           slug: 'b12-injections' },
          'immune':  { text: 'B12 Injections — Immune Support',            slug: 'b12-injections' },
        },
        'peptides': {
          'recovery':    { text: 'Peptide Therapy — Recovery Protocol',     slug: 'peptides' },
          'performance': { text: 'Peptide Therapy — Performance Protocol', slug: 'peptides' },
          'anti-aging':  { text: 'Peptide Therapy — Anti-Aging Protocol',  slug: 'peptides' },
          'not-sure':    { text: 'Peptide Therapy — Consultation',          slug: 'peptides' },
        },
        'wellness': {
          'energy':      { text: 'Wellness — Energy & Immunity Program',    slug: 'wellness' },
          'recovery':    { text: 'Wellness — Recovery Program',             slug: 'wellness' },
          'preventive':  { text: 'Wellness — Preventive Checkup',           slug: 'wellness' },
          'not-sure':    { text: 'Wellness Consultation',                   slug: 'wellness' },
        },
        'hormone-replacement-therapy': {
          'optimize':  { text: 'Hormone Replacement Therapy — Optimization', slug: 'hormone-replacement-therapy' },
          'labs':      { text: 'Hormone Replacement Therapy — Lab Testing', slug: 'hormone-replacement-therapy' },
          'not-sure':  { text: 'Hormone Replacement Therapy — Consultation',slug: 'hormone-replacement-therapy' },
        },
        'telehealth': {
          'new-patient': { text: 'Telehealth — New Patient Meet & Greet',  slug: 'telehealth' },
          'follow-up':   { text: 'Telehealth — Follow-Up Visit',           slug: 'telehealth' },
          'question':    { text: 'Telehealth — Quick Consultation',        slug: 'telehealth' },
        },
        'skilled-nursing': {
          'me':     { text: 'Skilled Nursing — In-Home Care Visit',         slug: 'skilled-nursing' },
          'family': { text: 'Skilled Nursing — Family Care Visit',          slug: 'skilled-nursing' },
        },
      };

      const svcMap = map[s];
      if (!svcMap) return { text: this.getServiceLabel() || 'a Consultation', slug: s || '' };
      const match = c ? svcMap[c] : null;
      return match || { text: this.getServiceLabel(), slug: s || '' };
    },

    // -----------------------------------------------------------------------
    // Webhook — HIPAA-safe fields ONLY
    // -----------------------------------------------------------------------
    _fireLeadWebhook(source) {
      const WEBHOOK = 'https://hook.us2.make.com/u1ls9idf44dbm0bx1i9bufep6gcgkwgj';
      try {
        const _svc = (this.services || []).find(s => s.id === this.selectedService);
        const rec  = this.getRecommendation();
        const payload = {
          source:         source || 'wizard',
          service_id:     this.selectedService,
          service:        _svc ? _svc.label : this.selectedService,
          name:           this.formData.name,
          email:          this.formData.email,
          phone:          this.formData.phone,
          proposed_date:  this.formData.proposedDate  || null,
          proposed_time:  this.formData.proposedTime  || null,
          page:           window.location.href,
          ts:             new Date().toISOString(),
        };
        // NOTE: selectedConcern / selectedDetail intentionally excluded — UX only, not transmitted
        const body = JSON.stringify(payload);
        if (typeof fetch !== 'undefined') {
          fetch(WEBHOOK, {
            method:    'POST',
            headers:   { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => {
            try { navigator.sendBeacon(WEBHOOK, new Blob([body], { type: 'application/json' })); } catch(e2) {}
          });
        } else if (navigator.sendBeacon) {
          navigator.sendBeacon(WEBHOOK, new Blob([body], { type: 'application/json' }));
        }
      } catch(e) {}
    },

    // -----------------------------------------------------------------------
    // Step tracking
    // -----------------------------------------------------------------------
    currentStep: 1,

    // -----------------------------------------------------------------------
    // Step 1 — Service selection
    // -----------------------------------------------------------------------
    selectedService: preselect || null,

    services: [
      { id: 'in-home-care',    label: 'In-Home Primary Care', icon: '🏠', desc: 'All ages, newborn to geriatric' },
      { id: 'urgent-care',     label: 'Urgent Care at Home',  icon: '🚑', desc: 'Same-day in-home visits' },
      { id: 'botox',           label: 'Botox',                icon: '💉', desc: 'Smooth lines, refresh your look' },
      { id: 'dermal-fillers',  label: 'Dermal Fillers',       icon: '✨', desc: 'Restore volume and contour' },
      { id: 'microneedling',   label: 'Microneedling / PRP',  icon: '🌟', desc: 'Skin renewal and hair restoration' },
      { id: 'iv-therapy',      label: 'IV Therapy',           icon: '💧', desc: 'Mobile IV hydration and wellness' },
      { id: 'weight-loss',     label: 'Medical Weight Loss',  icon: '⚖️', desc: 'Semaglutide, tirzepatide, coaching' },
      { id: 'fertility',       label: 'Fertility Care',       icon: '🌱', desc: 'Men, women, couples — telehealth available' },
      { id: 'cryotherapy',     label: 'Cryotherapy',          icon: '❄️', desc: 'Skin, body, and sports recovery' },
      { id: 'prp-facial',      label: 'PRP Vampire Facial',   icon: '🩸', desc: 'Rejuvenate with your own platelets' },
      { id: 'membership',      label: 'Concierge Membership', icon: '⭐', desc: 'Unlimited visits, priority access' },
      { id: 'nad-plus',        label: 'NAD+ IV Therapy',      icon: '🧬', desc: 'Cellular renewal, energy, and recovery' },
    ],

    selectService(id) {
      this.selectedService = id;
      this.selectedConcern = null;
      this.selectedDetail  = null;
      setTimeout(() => this.nextStep(), 300);
    },

    // -----------------------------------------------------------------------
    // Step 2 — Interest / area (UX guidance only — not transmitted)
    // -----------------------------------------------------------------------
    selectedConcern: null,

    getConcernQuestion() {
      const q = {
        'in-home-care':                'Who is this for?',
        'urgent-care':                 'What do you need?',
        'botox':                       'Which area would you like to focus on?',
        'dermal-fillers':              'Where would you like more volume or definition?',
        'microneedling':               'What would you like to improve?',
        'iv-therapy':                  'What are you hoping to get from it?',
        'weight-loss':                 'What is your goal?',
        'fertility':                   'Who is this for?',
        'cryotherapy':                 'What are you after?',
        'prp-facial':                  'What is your main goal?',
        'prp-hair':                    'What would you like to work on?',
        'b12-injections':              'What is your goal?',
        'peptides':                    'What are you focused on?',
        'wellness':                    'What are you looking for?',
        'hormone-replacement-therapy': 'What are you interested in?',
        'telehealth':                  'What do you need?',
        'skilled-nursing':             'Who needs care?',
        'membership':                  'Which plan interests you?',
        'nad-plus':                    'What are you focused on?',
      };
      return q[this.selectedService] || 'What are you looking for?';
    },

    getConcerns() {
      const map = {
        'in-home-care': [
          { id: 'myself',    label: 'Myself',              icon: '🧑' },
          { id: 'child',     label: 'My child',            icon: '👶' },
          { id: 'senior',    label: 'A parent or senior',  icon: '👴' },
          { id: 'family',    label: 'Our whole family',    icon: '👨‍👩‍👧' },
        ],
        'urgent-care': [
          { id: 'same-day',  label: 'A same-day visit',    icon: '🏠' },
          { id: 'lab',       label: 'Lab work',            icon: '🧪' },
          { id: 'not-sure',  label: 'Not sure',            icon: '❓' },
        ],
        'botox': [
          { id: 'forehead',  label: 'Forehead',            icon: '😌' },
          { id: 'frown',     label: 'Frown lines',         icon: '🧖' },
          { id: 'crows',     label: "Crow's feet",         icon: '👁' },
          { id: 'brow',      label: 'Brow refresh',        icon: '✨' },
          { id: 'lip-flip',  label: 'Lip flip',            icon: '💋' },
          { id: 'jawline',   label: 'Jawline',             icon: '💪' },
        ],
        'dermal-fillers': [
          { id: 'lips',      label: 'Lips',                icon: '💋' },
          { id: 'cheeks',    label: 'Cheeks',              icon: '✨' },
          { id: 'jawline',   label: 'Jawline',             icon: '💪' },
          { id: 'smile',     label: 'Smile lines',         icon: '🙂' },
          { id: 'chin',      label: 'Chin',                icon: '🫦' },
          { id: 'under-eye', label: 'Under-eye',           icon: '👁' },
        ],
        'microneedling': [
          { id: 'glow',      label: 'Glow',                icon: '✨' },
          { id: 'texture',   label: 'Smoother texture',    icon: '🌿' },
          { id: 'lines',     label: 'Fine lines',          icon: '〰️' },
          { id: 'tone',      label: 'Even tone',           icon: '🌸' },
        ],
        'iv-therapy': [
          { id: 'energy',    label: 'Energy',              icon: '⚡' },
          { id: 'immunity',  label: 'Immunity',            icon: '🛡️' },
          { id: 'recovery',  label: 'Recovery',            icon: '🏃' },
          { id: 'hydration', label: 'Hydration',           icon: '💧' },
          { id: 'hangover',  label: 'Hangover relief',     icon: '🌅' },
          { id: 'glow',      label: 'Glow',                icon: '💅' },
        ],
        'weight-loss': [
          { id: 'lose',      label: 'Lose weight',                  icon: '🎯' },
          { id: 'maintain',  label: 'Maintain',                     icon: '⚖️' },
          { id: 'plan',      label: 'Build a plan with a provider', icon: '📋' },
        ],
        'fertility': [
          { id: 'me',        label: 'Me',            icon: '🌸' },
          { id: 'partner',   label: 'My partner',    icon: '💙' },
          { id: 'both',      label: 'Both of us',    icon: '💑' },
        ],
        'cryotherapy': [
          { id: 'recovery',    label: 'Recovery',    icon: '🏃' },
          { id: 'performance', label: 'Performance', icon: '💪' },
          { id: 'wellness',    label: 'Wellness',    icon: '🌿' },
          { id: 'skin',        label: 'Skin and glow', icon: '✨' },
        ],
        'prp-facial': [
          { id: 'glow',      label: 'Glow',                  icon: '✨' },
          { id: 'texture',   label: 'Texture',               icon: '🌿' },
          { id: 'under-eye', label: 'Under-eye',             icon: '👁' },
          { id: 'rejuv',     label: 'Overall rejuvenation',  icon: '🌸' },
        ],
        'prp-hair': [
          { id: 'fuller',    label: 'Fuller hair',       icon: '💆' },
          { id: 'scalp',     label: 'Healthier scalp',   icon: '✨' },
          { id: 'thickness', label: 'Overall thickness', icon: '🌿' },
        ],
        'b12-injections': [
          { id: 'energy',  label: 'Energy',           icon: '⚡' },
          { id: 'mood',    label: 'Mood',             icon: '😊' },
          { id: 'immune',  label: 'Immune support',   icon: '🛡️' },
        ],
        'peptides': [
          { id: 'recovery',    label: 'Recovery',    icon: '🏃' },
          { id: 'performance', label: 'Performance', icon: '💪' },
          { id: 'anti-aging',  label: 'Anti-aging',  icon: '✨' },
          { id: 'not-sure',    label: 'Not sure',    icon: '❓' },
        ],
        'wellness': [
          { id: 'energy',     label: 'Energy and immunity', icon: '⚡' },
          { id: 'recovery',   label: 'Recovery',            icon: '🏃' },
          { id: 'preventive', label: 'Preventive checkup',  icon: '🌿' },
          { id: 'not-sure',   label: 'Not sure',            icon: '❓' },
        ],
        'hormone-replacement-therapy': [
          { id: 'optimize',  label: 'Hormone optimization', icon: '⚖️' },
          { id: 'labs',      label: 'Lab testing',          icon: '🧪' },
          { id: 'not-sure',  label: 'Not sure',             icon: '❓' },
        ],
        'telehealth': [
          { id: 'new-patient', label: 'New patient meet & greet', icon: '👋' },
          { id: 'follow-up',   label: 'A follow-up',              icon: '📋' },
          { id: 'question',    label: 'A quick question',         icon: '❓' },
        ],
        'skilled-nursing': [
          { id: 'me',     label: 'Me',                 icon: '🧑' },
          { id: 'family', label: 'A family member',    icon: '👨‍👩‍👧' },
        ],
        'membership': [
          { id: 'basic',    label: 'Basic',       icon: '⭐' },
          { id: 'plus',     label: 'Plus',        icon: '💫' },
          { id: 'elite',    label: 'Elite',       icon: '👑' },
          { id: 'not-sure', label: 'Not sure yet',icon: '❓' },
        ],
        'nad-plus': [
          { id: 'anti-aging',  label: 'Anti-aging',          icon: '✨' },
          { id: 'clarity',     label: 'Brain clarity',       icon: '🧠' },
          { id: 'energy',      label: 'Natural energy',      icon: '⚡' },
          { id: 'performance', label: 'Athletic performance',icon: '🏃' },
          { id: 'not-sure',    label: 'Not sure yet',        icon: '❓' },
        ],
      };
      return map[this.selectedService] || [];
    },

    selectConcern(id) {
      this.selectedConcern = id;
      this.selectedDetail  = null;
      if (this.hasDetailStep()) {
        setTimeout(() => this.nextStep(), 300);
      } else {
        this.currentStep = 4;
      }
    },

    // -----------------------------------------------------------------------
    // Step 3 — Detail / goal (optional, UX only — not transmitted)
    // -----------------------------------------------------------------------
    selectedDetail: null,

    hasDetailStep() {
      return ['botox', 'dermal-fillers', 'microneedling', 'weight-loss'].includes(this.selectedService);
    },

    getDetailQuestion() {
      const q = {
        'botox':          "What's your primary goal?",
        'dermal-fillers': "What result are you looking for?",
        'microneedling':  'How would you describe your skin goal?',
        'weight-loss':    'What kind of support are you looking for?',
      };
      return q[this.selectedService] || 'Tell us a bit more.';
    },

    getDetailOptions() {
      const map = {
        'botox': [
          { id: 'prevent', label: 'Prevent new lines',     icon: '🛡️' },
          { id: 'soften',  label: 'Soften existing lines', icon: '〰️' },
          { id: 'lift',    label: 'Lift & refresh',        icon: '↑' },
          { id: 'sweat',   label: 'Reduce sweating',       icon: '💧' },
        ],
        'dermal-fillers': [
          { id: 'volume', label: 'Add volume & fullness',  icon: '✨' },
          { id: 'define', label: 'Define & contour',       icon: '🎯' },
          { id: 'smooth', label: 'Smooth deep lines',      icon: '〰️' },
          { id: 'subtle', label: 'Subtle natural refresh', icon: '🌿' },
        ],
        'microneedling': [
          { id: 'mild',        label: 'Mild — early signs',         icon: '🟢' },
          { id: 'moderate',    label: 'Moderate',                   icon: '🟡' },
          { id: 'significant', label: 'More significant',           icon: '🔴' },
          { id: 'not-sure',    label: 'Not sure, need assessment',  icon: '❓' },
        ],
        'weight-loss': [
          { id: 'medication',  label: 'Medication-assisted',        icon: '💊' },
          { id: 'coaching',    label: 'Coaching & lifestyle plan',  icon: '📋' },
          { id: 'combination', label: 'Both',                       icon: '⭐' },
          { id: 'not-sure',    label: 'Not sure yet',               icon: '❓' },
        ],
      };
      return map[this.selectedService] || [];
    },

    selectDetail(id) {
      this.selectedDetail = id;
      setTimeout(() => this.nextStep(), 300);
    },

    // -----------------------------------------------------------------------
    // Step 4 — Contact + Proposed Date & Time
    // -----------------------------------------------------------------------
    formData: {
      name:         '',
      email:        '',
      phone:        '',
      proposedDate: '',
      proposedTime: '',
      consent:      false,
    },

    timeSlots: [
      '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
      '1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
      '4:00 PM','4:30 PM','5:00 PM',
    ],

    get minDate() {
      const d = new Date(); d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    },

    get maxDate() {
      const d = new Date(); d.setDate(d.getDate() + 60);
      return d.toISOString().split('T')[0];
    },

    get contactValid() {
      return !!(
        this.formData.name.trim().length > 1 &&
        this.formData.email.includes('@') &&
        this.formData.phone.replace(/\D/g,'').length >= 10 &&
        this.formData.consent
      );
    },

    // -----------------------------------------------------------------------
    // Navigation
    // -----------------------------------------------------------------------
    get totalSteps() { return 5; },

    get progressPct() {
      return Math.round(((this.currentStep - 1) / (this.totalSteps - 1)) * 100);
    },

    get stepLabel() {
      const labels = {
        1: 'Find Your Service',
        2: 'Your Interest',
        3: 'A Bit More',
        4: 'Your Info',
        5: 'Date & Time',
        6: '',
      };
      return labels[this.currentStep] || '';
    },

    get canGoNext() {
      switch (this.currentStep) {
        case 1: return !!this.selectedService;
        case 2: return !!this.selectedConcern;
        case 3: return !!this.selectedDetail;
        case 4: return this.contactValid;
        case 5: return true; // date optional
        default: return false;
      }
    },

    nextStep() {
      if (this.currentStep === 5) { this.submit(); return; }
      if (this.currentStep < 6) this.currentStep++;
    },

    prevStep() {
      if (this.currentStep === 4 && !this.hasDetailStep()) { this.currentStep = 2; return; }
      if (this.currentStep > 1) this.currentStep--;
    },

    // -----------------------------------------------------------------------
    // Open / close
    // -----------------------------------------------------------------------
    openWizard(serviceId) {
      if (serviceId) { this.selectedService = serviceId; this.currentStep = 2; }
      else { this.currentStep = 1; this.selectedService = null; }
      this.selectedConcern = null;
      this.selectedDetail  = null;
      this.formData        = { name:'', email:'', phone:'', proposedDate:'', proposedTime:'', consent:false };
      this.isSubmitted     = false;
      this.submitError     = '';
      this.open            = true;
      document.body.style.overflow = 'hidden';
    },

    openWizardAt(step, serviceId, concernId) {
      this.selectedService = serviceId  || null;
      this.selectedConcern = concernId  || null;
      this.selectedDetail  = null;
      this.formData        = { name:'', email:'', phone:'', proposedDate:'', proposedTime:'', consent:false };
      this.isSubmitted     = false;
      this.submitError     = '';
      this.currentStep     = step || 1;
      this.open            = true;
      document.body.style.overflow = 'hidden';
    },

    // Scroll to inline guide and pre-select service (homepage — no modal)
    scrollToGuide(serviceId) {
      if (serviceId) {
        this.selectedService = serviceId;
        this.selectedConcern = null;
        this.selectedDetail  = null;
        this.inlineStep = 2;
      } else {
        this.inlineStep = 1;
        this.selectedService = null;
      }
      this.$nextTick(() => {
        const el = document.getElementById('find-your-service');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    // Scroll to inline guide and pre-select service (homepage use — no modal)
    scrollToGuide(serviceId) {
      if (serviceId) {
        this.selectedService = serviceId;
        this.selectedConcern = null;
        this.selectedDetail  = null;
        this.inlineStep = 2;
      } else {
        this.inlineStep = 1;
        this.selectedService = null;
      }
      this.$nextTick(() => {
        const el = document.getElementById('find-your-service');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    closeWizard() {
      this.open = false;
      document.body.style.overflow = '';
    },

    // -----------------------------------------------------------------------
    // Submission
    // -----------------------------------------------------------------------
    isSubmitting: false,
    isSubmitted:  false,
    submitError:  '',

    async submit() {
      if (!this.contactValid) {
        this.submitError = 'Please fill in all fields and accept the consent checkbox.';
        return;
      }
      this.isSubmitting = true;
      this.submitError  = '';

      if (typeof gtag !== 'undefined') {
        gtag('event', 'consultation_request', {
          event_category: 'wizard',
          event_label: this.selectedService,
        });
      }

      this._fireLeadWebhook('modal_wizard');

      this.currentStep  = 6;
      this.isSubmitting = false;
      this.isSubmitted  = true;
    },

    // Navigate to service page with service pre-selected
    goToService() {
      const rec = this.getRecommendation();
      const slug = rec.slug;
      if (slug) {
        window.location.href = '/services/' + slug + '.html';
      }
    },

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------
    getServiceLabel() {
      const s = this.services.find(s => s.id === this.selectedService);
      return s ? s.label : '';
    },

    formatDate(str) {
      if (!str) return '';
      const d = new Date(str + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    },

  };
}

// -----------------------------------------------------------------------
// Global helper — open wizard from any CTA button
// -----------------------------------------------------------------------
function openBookingWizard(serviceId) {
  const el = document.querySelector('[data-wizard-root]');
  if (el && el._x_dataStack) {
    const data = el._x_dataStack[0];
    if (data && data.openWizard) data.openWizard(serviceId || null);
  }
}

// ── Before & After Carousel ─────────────────────────────────────────────────
function baCarousel() {
  return {
    offset: 0,
    trans: 'transform 0.05s linear',
    lb: null,
    _timer: null,
    _slideW: 0,
    _total: 0,
    _half: 0,

    init() {
      this.$nextTick(() => {
        const track = this.$el.querySelector('.ba-track');
        const slides = track ? track.querySelectorAll('.ba-slide') : [];
        if (!slides.length) return;
        this._slideW = slides[0].offsetWidth + 14;
        this._total  = slides.length;
        this._half   = Math.floor(this._total / 2);
        if (window.matchMedia('(max-width: 768px)').matches) {
          // On mobile use native scroll-snap instead of JS auto-scroll
          const track = this.$el.querySelector('.ba-track');
          if (track) track.style.overflowX = 'auto';
        } else {
          this.start();
        }
      });
    },

    start()  { this._timer = setInterval(() => this.tick(), 16); },
    tick()   {
      this.trans = 'none';
      this.offset += 0.72;
      if (this._slideW && this.offset >= this._slideW * this._half) this.offset = 0;
    },
    pause()  { clearInterval(this._timer); this._timer = null; },
    resume() { if (!this._timer) this.start(); },
  };
}
