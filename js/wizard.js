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
          'energy':    { text: '[SERVICE CATEGORY] — [SERVICE NAME]',              slug: 'iv-therapy' },
          'immunity':  { text: '[SERVICE CATEGORY] — Immunity Boost Cocktail',     slug: 'iv-therapy' },
          'recovery':  { text: '[SERVICE CATEGORY] — Recovery Drip',              slug: 'iv-therapy' },
          '[service name]': { text: '[SERVICE CATEGORY] — [service name] Drip',             slug: 'iv-therapy' },
          '[SERVICE NAME]':  { text: '[SERVICE CATEGORY] — [SERVICE NAME] Relief Cocktail',   slug: 'iv-therapy' },
          'glow':      { text: '[SERVICE CATEGORY] — Beauty & Glow Drip',         slug: 'iv-therapy' },
        },
        'weight-loss': {
          'lose':     { text: '[SERVICE CATEGORY] — [SERVICE NAME] Program',       slug: 'weight-loss' },
          'maintain': { text: '[SERVICE CATEGORY] — Maintenance Program', slug: 'weight-loss' },
          'plan':     { text: '[SERVICE CATEGORY] — Provider Consultation',slug: 'weight-loss' },
        },
        'botox': {
          'forehead':  { text: '[SERVICE NAME] — Forehead & Frown Line Treatment',  slug: 'botox' },
          'frown':     { text: '[SERVICE NAME] — Frown Line Treatment',             slug: 'botox' },
          'crows':     { text: "[SERVICE NAME] — Crow's Feet Treatment",            slug: 'botox' },
          'brow':      { text: '[SERVICE NAME] — Brow Lift & Refresh',             slug: 'botox' },
          'lip-flip':  { text: '[SERVICE NAME] — Lip Flip',                        slug: 'botox' },
          'jawline':   { text: '[SERVICE NAME] — Jawline Slimming',                slug: 'botox' },
        },
        'dermal-fillers': {
          'lips':      { text: '[SERVICE NAME] — Lip Enhancement',         slug: 'dermal-fillers' },
          'cheeks':    { text: '[SERVICE NAME] — Cheek Augmentation',      slug: 'dermal-fillers' },
          'jawline':   { text: '[SERVICE NAME] — Jawline Definition',      slug: 'dermal-fillers' },
          'smile':     { text: '[SERVICE NAME] — Smile Line Treatment',    slug: 'dermal-fillers' },
          'chin':      { text: '[SERVICE NAME] — Chin Enhancement',        slug: 'dermal-fillers' },
          'under-eye': { text: '[SERVICE NAME] — Under-Eye Rejuvenation',  slug: 'dermal-fillers' },
        },
        '[SERVICE NAME]': {
          'glow':     { text: '[SERVICE NAME] — Glow & Radiance Treatment', slug: '[SERVICE NAME]' },
          'texture':  { text: '[SERVICE NAME] — Texture Smoothing',         slug: '[SERVICE NAME]' },
          'lines':    { text: '[SERVICE NAME] with [SERVICE NAME] — Fine Line Treatment', slug: '[SERVICE NAME]' },
          'tone':     { text: '[SERVICE NAME] — Tone & Pigmentation',       slug: '[SERVICE NAME]' },
        },
        'in-home-care': {
          'myself':   { text: 'In-Home [SERVICE CATEGORY] — Adult Visit',         slug: 'in-home-primary-care' },
          'child':    { text: 'In-Home [SERVICE CATEGORY] — Pediatric Visit',     slug: 'in-home-primary-care' },
          'senior':   { text: 'In-Home [SERVICE CATEGORY] — Senior Care Visit',  slug: 'in-home-primary-care' },
          'family':   { text: 'In-Home [SERVICE CATEGORY] — Family Visit',        slug: 'in-home-primary-care' },
        },
        'urgent-care': {
          'same-day': { text: '[SERVICE CATEGORY] — Same-Day In-Home Visit',       slug: 'urgent-care' },
          'lab':      { text: '[SERVICE CATEGORY] — In-Home Lab Work',             slug: 'urgent-care' },
          'not-sure': { text: '[SERVICE CATEGORY] — In-Home Visit',               slug: 'urgent-care' },
        },
        '[SERVICE NAME]': {
          'me':       { text: '[SERVICE NAME] Care — Individual Evaluation',     slug: '[SERVICE NAME]' },
          'partner':  { text: '[SERVICE NAME] Care — Partner Evaluation',       slug: '[SERVICE NAME]' },
          'both':     { text: '[SERVICE NAME] Care — Couples Evaluation',        slug: '[SERVICE NAME]' },
        },
        '[SERVICE NAME]': {
          'recovery':    { text: '[SERVICE NAME] — Recovery Session',          slug: '[SERVICE NAME]' },
          'performance': { text: '[SERVICE NAME] — Performance Enhancement',  slug: '[SERVICE NAME]' },
          'wellness':    { text: '[SERVICE NAME] — [SERVICE CATEGORY] Session',          slug: '[SERVICE NAME]' },
          'skin':        { text: '[SERVICE NAME] — Skin & Glow Treatment',    slug: '[SERVICE NAME]' },
        },
        'prp-facial': {
          'glow':      { text: '[SERVICE NAME] Vampire Facial — Glow Treatment',       slug: 'prp-facial' },
          'texture':   { text: '[SERVICE NAME] Vampire Facial — Texture Improvement', slug: 'prp-facial' },
          'under-eye': { text: '[SERVICE NAME] Vampire Facial — Under-Eye Treatment', slug: 'prp-facial' },
          'rejuv':     { text: '[SERVICE NAME] Vampire Facial — Full Rejuvenation',   slug: 'prp-facial' },
        },
        '[SERVICE NAME]': {
          'basic':    { text: 'Concierge [SERVICE NAME] — Core Care Plan',      slug: '[SERVICE NAME]' },
          'plus':     { text: 'Concierge [SERVICE NAME] — Plus Plan',           slug: '[SERVICE NAME]' },
          'elite':    { text: 'Concierge [SERVICE NAME] — Elite Plan',          slug: '[SERVICE NAME]' },
          'not-sure': { text: 'Concierge [SERVICE NAME] — Free Consultation',   slug: '[SERVICE NAME]' },
        },
        '[SERVICE NAME]-plus': {
          '[SERVICE NAME]':  { text: '[SERVICE NAME]+ [SERVICE CATEGORY] — [SERVICE NAME] Protocol',   slug: 'iv-therapy' },
          'clarity':     { text: '[SERVICE NAME]+ [SERVICE CATEGORY] — Brain Clarity Protocol',slug: 'iv-therapy' },
          'energy':      { text: '[SERVICE NAME]+ [SERVICE CATEGORY] — Energy Protocol',       slug: 'iv-therapy' },
          'performance': { text: '[SERVICE NAME]+ [SERVICE CATEGORY] — Athletic Performance',  slug: 'iv-therapy' },
          'not-sure':    { text: '[SERVICE NAME]+ [SERVICE CATEGORY]',                         slug: 'iv-therapy' },
        },
        'prp-hair': {
          'fuller':    { text: '[SERVICE NAME] Restoration — Fuller Hair',         slug: 'prp-hair' },
          'scalp':     { text: '[SERVICE NAME] Restoration — Scalp Health',       slug: 'prp-hair' },
          'thickness': { text: '[SERVICE NAME] Restoration — Overall Thickness',  slug: 'prp-hair' },
        },
        '[SERVICE NAME]-injections': {
          'energy':  { text: '[SERVICE NAME] — Energy Boost',              slug: '[SERVICE NAME]-injections' },
          'mood':    { text: '[SERVICE NAME] — Mood & Vitality',           slug: '[SERVICE NAME]-injections' },
          'immune':  { text: '[SERVICE NAME] — Immune Support',            slug: '[SERVICE NAME]-injections' },
        },
        'peptides': {
          'recovery':    { text: '[SERVICE NAME] Therapy — Recovery Protocol',     slug: 'peptides' },
          'performance': { text: '[SERVICE NAME] Therapy — Performance Protocol', slug: 'peptides' },
          '[SERVICE NAME]':  { text: '[SERVICE NAME] Therapy — [SERVICE NAME] Protocol',  slug: 'peptides' },
          'not-sure':    { text: '[SERVICE NAME] Therapy — Consultation',          slug: 'peptides' },
        },
        'wellness': {
          'energy':      { text: '[SERVICE CATEGORY] — Energy & Immunity Program',    slug: 'wellness' },
          'recovery':    { text: '[SERVICE CATEGORY] — Recovery Program',             slug: 'wellness' },
          'preventive':  { text: '[SERVICE CATEGORY] — Preventive Checkup',           slug: 'wellness' },
          'not-sure':    { text: '[SERVICE CATEGORY] Consultation',                   slug: 'wellness' },
        },
        'hormone-replacement-therapy': {
          'optimize':  { text: '[SERVICE NAME] — Optimization', slug: 'hormone-replacement-therapy' },
          'labs':      { text: '[SERVICE NAME] — Lab Testing', slug: 'hormone-replacement-therapy' },
          'not-sure':  { text: '[SERVICE NAME] — Consultation',slug: 'hormone-replacement-therapy' },
        },
        '[SERVICE NAME]': {
          'new-patient': { text: '[SERVICE NAME] — New Patient Meet & Greet',  slug: '[SERVICE NAME]' },
          'follow-up':   { text: '[SERVICE NAME] — Follow-Up Visit',           slug: '[SERVICE NAME]' },
          'question':    { text: '[SERVICE NAME] — Quick Consultation',        slug: '[SERVICE NAME]' },
        },
        'skilled-nursing': {
          'me':     { text: '[SERVICE CATEGORY] — [SERVICE NAME] Visit',         slug: 'skilled-nursing' },
          'family': { text: '[SERVICE CATEGORY] — Family Care Visit',          slug: 'skilled-nursing' },
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
      { id: 'recovery', label: 'Money owed that never gets chased', icon: '💰', desc: 'Denials, rejections, unpaid invoices' },
      { id: 'intake',   label: 'Paperwork that arrives all day',    icon: '📥', desc: 'Faxes, referrals, forms, attachments' },
      { id: 'signal',   label: 'Accounts you should be watching',   icon: '🔭', desc: 'Hiring signals, funding, leadership moves' },
      { id: 'ledger',   label: 'Books that never quite reconcile',  icon: '📊', desc: 'Entries, reconciliation, month-end close' },
      { id: 'sentinel', label: 'Deadlines that must not slip',      icon: '🛡️', desc: 'Licenses, filings, timely-filing windows' },
      { id: 'producer', label: 'Reports your team assembles by hand', icon: '📄', desc: 'Recurring deliverables, client reports' },
    ], [SERVICE NAME], coaching' },
      { id: '[SERVICE NAME]',       label: '[SERVICE NAME] Care',       icon: '🌱', desc: 'Men, women, couples — [SERVICE NAME] available' },
      { id: '[SERVICE NAME]',     label: '[SERVICE NAME]',          icon: '❄️', desc: 'Skin, body, and sports recovery' },
      { id: 'prp-facial',      label: '[SERVICE NAME] Vampire Facial',   icon: '🩸', desc: 'Rejuvenate with your own platelets' },
      { id: '[SERVICE NAME]',      label: 'Concierge [SERVICE NAME]', icon: '⭐', desc: 'Unlimited visits, priority access' },
      { id: '[SERVICE NAME]-plus',        label: '[SERVICE NAME]+ [SERVICE CATEGORY]',      icon: '🧬', desc: 'Cellular renewal, energy, and recovery' },
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
      return 'What is your world?';
    },

    _getConcernQuestion_ORIG() {
      const q = {
        'in-home-care':                'Who is this for?',
        'urgent-care':                 'What do you need?',
        'botox':                       'Which area would you like to focus on?',
        'dermal-fillers':              'Where would you like more volume or definition?',
        '[SERVICE NAME]':               'What would you like to improve?',
        'iv-therapy':                  'What are you hoping to get from it?',
        'weight-loss':                 'What is your goal?',
        '[SERVICE NAME]':                   'Who is this for?',
        '[SERVICE NAME]':                 'What are you after?',
        'prp-facial':                  'What is your main goal?',
        'prp-hair':                    'What would you like to work on?',
        '[SERVICE NAME]-injections':              'What is your goal?',
        'peptides':                    'What are you focused on?',
        'wellness':                    'What are you looking for?',
        'hormone-replacement-therapy': 'What are you interested in?',
        '[SERVICE NAME]':                  'What do you need?',
        'skilled-nursing':             'Who needs care?',
        '[SERVICE NAME]':                  'Which plan interests you?',
        '[SERVICE NAME]-plus':                    'What are you focused on?',
      };
      return q[this.selectedService] || 'What are you looking for?';
    },

    getConcerns() {
      // Tribune Q2: What is your world?
      return [
        { id: 'medical', label: 'A medical or care practice',                 icon: '🏥' },
        { id: 'legal',   label: 'A legal or professional firm',               icon: '⚖️' },
        { id: 'sales',   label: 'A sales, research, or intelligence business', icon: '🔭' },
        { id: 'other',   label: 'Services, trades, or something else',        icon: '🏢' },
      ]
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
      return true; // Tribune Q3: data sensitivity
    },

    getDetailQuestion() {
      return 'How sensitive is the data?';
    },

    getDetailOptions() {
      return [
        { id: 'regulated', label: 'Patient records',                             icon: '🏥' },
        { id: 'regulated', label: 'Privileged or confidential client matter',    icon: '⚖️' },
        { id: 'standard',  label: 'Standard business data',                      icon: '📊' },
      ]
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
