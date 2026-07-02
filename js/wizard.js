/**
 * Tribune — Build Finder
 * Alpine.js state machine
 *
 * Three questions. One recommended build. No backend.
 * Selections are routing hints only — never submitted to any server.
 *
 * Q1. What should your agent carry?   → primary slug
 * Q2. What is your world?             → copy variant (not used for routing, appended to CTA)
 * Q3. How sensitive is the data?      → edition badge (Standard / Regulated)
 */

function wizardData(preselect) {
  return {

    // ── Visibility ────────────────────────────────────────────────────
    open:   false,
    inline: false,

    // ── Inline guide state ────────────────────────────────────────────
    inlineStep: 1,

    // Q1 selection
    selectedService: preselect || null,   // one of: recovery|intake|signal|ledger|sentinel|producer

    // Q2 selection
    selectedWorld: null,   // medical|legal|sales|other

    // Q3 selection
    selectedTier: null,    // patient|privileged|standard

    // ── Routing table ─────────────────────────────────────────────────
    buildMap: {
      'recovery': {
        name:  'The Recovery Agent',
        slug:  '/builds/the-recovery-agent.html',
        fn:    'Recover money owed',
      },
      'intake': {
        name:  'The Intake Agent',
        slug:  '/builds/the-intake-agent.html',
        fn:    'Handle incoming paperwork',
      },
      'signal': {
        name:  'The Signal Agent',
        slug:  '/builds/the-signal-agent.html',
        fn:    'Watch and brief',
      },
      'ledger': {
        name:  'The Ledger Agent',
        slug:  '/builds/the-ledger-agent.html',
        fn:    'Keep the books straight',
      },
      'sentinel': {
        name:  'The Sentinel',
        slug:  '/builds/the-sentinel.html',
        fn:    'Guard the deadlines',
      },
      'producer': {
        name:  'The Producer',
        slug:  '/builds/the-producer.html',
        fn:    'Produce and deliver',
      },
    },

    worldLabels: {
      'medical': 'a medical or care practice',
      'legal':   'a legal or professional firm',
      'sales':   'a sales, research, or intelligence business',
      'other':   'a services or trades business',
    },

    // ── Computed helpers ──────────────────────────────────────────────

    get edition() {
      if (this.selectedTier === 'patient' || this.selectedTier === 'privileged') {
        return 'Regulated';
      }
      return 'Standard';
    },

    get editionNote() {
      if (this.edition === 'Regulated') {
        return 'Your records never leave your building.';
      }
      return 'Standard business data. No extra compliance stack.';
    },

    get recommendedBuild() {
      return this.buildMap[this.selectedService] || null;
    },

    get resultCTA() {
      if (!this.recommendedBuild) return '/reach-out.html';
      const params = new URLSearchParams();
      if (this.selectedService) params.set('build', this.selectedService);
      if (this.selectedWorld)   params.set('world', this.selectedWorld);
      if (this.selectedTier)    params.set('tier',  this.selectedTier);
      return this.recommendedBuild.slug + '?' + params.toString();
    },

    // ── Inline guide navigation ───────────────────────────────────────

    inlineNext() {
      if (this.inlineStep === 1 && this.selectedService) {
        this.inlineStep = 2;
      } else if (this.inlineStep === 2 && this.selectedWorld) {
        this.inlineStep = 3;
      } else if (this.inlineStep === 3 && this.selectedTier) {
        this.inlineStep = 4; // result
      }
    },

    inlinePrev() {
      if (this.inlineStep > 1) this.inlineStep--;
    },

    inlineCanNext() {
      if (this.inlineStep === 1) return !!this.selectedService;
      if (this.inlineStep === 2) return !!this.selectedWorld;
      if (this.inlineStep === 3) return !!this.selectedTier;
      return false;
    },

    inlineHeading() {
      switch (this.inlineStep) {
        case 1: return 'What should your agent carry?';
        case 2: return 'What is your world?';
        case 3: return 'How sensitive is the data?';
        case 4: return 'Your build.';
        default: return '';
      }
    },

    inlineGoToBuild() {
      if (this.recommendedBuild) {
        window.location.href = this.resultCTA;
      }
    },

    // ── Overlay wizard (same 3Q flow, opened by CTA buttons) ─────────

    get progressPct() {
      return Math.round((this.currentStep / 3) * 100);
    },

    get stepLabel() {
      return `Step ${this.currentStep} of 3`;
    },

    currentStep: 1,
    isSubmitting: false,

    openWizard() {
      this.open = true;
      this.currentStep = 1;
      document.body.style.overflow = 'hidden';
    },

    closeWizard() {
      this.open = false;
      document.body.style.overflow = '';
    },

    get canGoNext() {
      if (this.currentStep === 1) return !!this.selectedService;
      if (this.currentStep === 2) return !!this.selectedWorld;
      if (this.currentStep === 3) return !!this.selectedTier;
      return false;
    },

    nextStep() {
      if (this.currentStep < 3 && this.canGoNext) {
        this.currentStep++;
      } else if (this.currentStep === 3 && this.canGoNext) {
        // Go to result
        this.currentStep = 4;
      }
    },

    prevStep() {
      if (this.currentStep > 1) this.currentStep--;
    },

    goToResult() {
      if (this.recommendedBuild) {
        this.closeWizard();
        window.location.href = this.resultCTA;
      }
    },

    // ── Scroll helpers ────────────────────────────────────────────────

    scrollToGuide(service) {
      if (service) this.selectedService = service;
      this.inlineStep = service ? 2 : 1;
      const el = document.getElementById('find-your-service');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ── Legacy stubs (unused in Tribune, kept to avoid JS errors) ─────
    formData: { name: '', email: '', phone: '', consent: false },
    selectedConcern: null,
    selectedDetail:  null,
    getConcernQuestion() { return ''; },
    getDetailQuestion()  { return ''; },
    hasDetailStep()      { return false; },
    getServiceLabel()    { return this.recommendedBuild ? this.recommendedBuild.name : ''; },
    inlineDoSubmit()     {},

  };
}
