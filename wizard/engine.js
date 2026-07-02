/**
 * [COMPANY] Wizard Engine — Per-Page Entry
 * For service detail pages: wizard starts at the service-specific question (no service grid).
 * For homepage / book-now: full flow starting at service selection.
 *
 * Usage:
 *   <script>
 *     const PAGE_WIZARD = { /* from /data/wizard/<slug>.json */ }
 *   </script>
 *   <script src="/wizard/modules.js"></script>
 *   <script src="/wizard/engine.js"></script>
 *   <div id="page-wizard-trigger">...</div>  <!-- any element that fires openWizard() -->
 *   <div id="page-wizard-root"></div>         <!-- wizard mounts here -->
 *
 * PAGE_WIZARD shape:
 * {
 *   slug: 'iv-therapy',
 *   serviceLabel: 'Mobile IV Therapy',
 *   steps: [
 *     { type: 'cards-multi', q: '...', options: [...], stateKey: 'qualifier1' },
 *     { type: 'zip' },
 *     { type: 'contact' },
 *     { type: 'consult' },
 *     { type: 'datetime' },
 *     { type: 'confirm', serviceLabel: 'Mobile IV Therapy' }
 *   ]
 * }
 */

(function() {
  'use strict';

  // --- Lead capture endpoint ---
  const LEAD_WEBHOOK_URL = 'https://hook.us2.make.com/u1ls9idf44dbm0bx1i9bufep6gcgkwgj';

  // --- State ---
  let state = {};
  let currentStep = 0;
  let config = null;
  let rootEl = null;
  let isOpen = false;

  function init(wizardConfig) {
    config = wizardConfig;
    state = { service: config.slug };
    rootEl = document.getElementById('bch-wizard-root');
    if (!rootEl) return;
    renderModal();
    attachGlobalTriggers();
  }

  // --- Modal scaffold ---
  function renderModal() {
    const overlay = document.createElement('div');
    overlay.id = 'bch-wizard-overlay';
    overlay.innerHTML = `
      <div id="bch-wizard-card" role="dialog" aria-modal="true" aria-label="Book a consultation">
        <div id="bch-wizard-header">
          <div id="bch-wizard-title"></div>
          <div id="bch-wizard-progress">
            <div id="bch-wizard-bar"><div id="bch-wizard-fill"></div></div>
            <div id="bch-wizard-step-label"></div>
          </div>
          <button id="bch-wizard-close" aria-label="Close">&times;</button>
        </div>
        <div id="bch-wizard-body"></div>
        <div id="bch-wizard-footer">
          <button id="bch-wizard-prev" class="wz-btn-back">Back</button>
          <button id="bch-wizard-next" class="wz-btn-next">Continue</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    rootEl.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeWizard();
    });
    document.getElementById('bch-wizard-close').addEventListener('click', closeWizard);
    document.getElementById('bch-wizard-prev').addEventListener('click', prevStep);
    document.getElementById('bch-wizard-next').addEventListener('click', nextStep);
    // Delegate input changes
    overlay.addEventListener('change', handleInputChange);
    overlay.addEventListener('click', handleCardClick);
    overlay.addEventListener('input', handleInputChange);
  }

  function attachGlobalTriggers() {
    document.querySelectorAll('[data-open-wizard],[data-wizard-open]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openWizard();
      });
    });
    // Legacy Alpine openWizard() calls
    window.openWizard = openWizard;
    window.closeWizard = closeWizard;
  }

  // --- Open / close ---
  function openWizard() {
    currentStep = 0;
    state = { service: config ? config.slug : '' };
    isOpen = true;
    renderStep();
    const overlay = document.getElementById('bch-wizard-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      requestAnimationFrame(function() { overlay.classList.add('visible'); });
    }
    document.body.style.overflow = 'hidden';
    // Fire lead event immediately on open (page + service captured)
    fireLead('wizard_opened');
  }

  function closeWizard() {
    isOpen = false;
    const overlay = document.getElementById('bch-wizard-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(function() { overlay.style.display = 'none'; }, 280);
    }
    document.body.style.overflow = '';
  }

  // --- Render current step ---
  function renderStep() {
    if (!config || !config.steps) return;
    const step = config.steps[currentStep];
    const mod = WizardModules[step.type];
    if (!mod) return;

    const total = config.steps.length;
    const pct = Math.round(((currentStep + 1) / total) * 100);

    // Title
    document.getElementById('bch-wizard-title').textContent =
      step.label || config.serviceLabel || 'Book a Consultation';

    // Progress
    document.getElementById('bch-wizard-fill').style.width = pct + '%';
    document.getElementById('bch-wizard-step-label').textContent =
      'Step ' + (currentStep + 1) + ' of ' + total;

    // Body
    document.getElementById('bch-wizard-body').innerHTML = mod.render(step, state);
    attachStepListeners();

    // Footer
    const prevBtn = document.getElementById('bch-wizard-prev');
    const nextBtn = document.getElementById('bch-wizard-next');
    prevBtn.style.display = currentStep > 0 ? 'inline-flex' : 'none';

    const isLast = currentStep === config.steps.length - 1;
    const isConfirm = step.type === 'confirm';

    if (isConfirm) {
      document.getElementById('bch-wizard-footer').style.display = 'none';
    } else {
      document.getElementById('bch-wizard-footer').style.display = 'flex';
      nextBtn.textContent = isLast ? 'Submit' : 'Continue';
      nextBtn.disabled = !mod.valid(step, state);
    }
  }

  function attachStepListeners() {
    // Re-validate on input
    const step = config.steps[currentStep];
    const mod = WizardModules[step.type];
    const nextBtn = document.getElementById('bch-wizard-next');
    if (!nextBtn) return;
    setTimeout(function() {
      nextBtn.disabled = !mod.valid(step, state);
    }, 0);
  }

  // --- Navigation ---
  function nextStep() {
    const step = config.steps[currentStep];
    const mod = WizardModules[step.type];
    if (!mod.valid(step, state)) return;

    // On contact submit: fire lead capture
    if (step.type === 'contact') {
      fireLead('lead_captured');
    }

    if (currentStep < config.steps.length - 1) {
      currentStep++;
      renderStep();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
    }
  }

  // --- Input / card event handling ---
  function handleCardClick(e) {
    const btn = e.target.closest('[data-module]');
    if (!btn) return;
    const mod = btn.dataset.module;
    const key = btn.dataset.key;
    const val = btn.dataset.val;
    if (!key || !val) return;

    if (mod === 'cards-multi') {
      state[key] = state[key] || [];
      const idx = state[key].indexOf(val);
      if (idx === -1) state[key].push(val);
      else state[key].splice(idx, 1);
    } else if (mod === 'cards-single' || mod === 'list-single' || mod === 'consult' || mod === 'datetime') {
      state[key] = val;
    }
    renderStep();

    // Auto-advance single-tap modules after short delay
    const step = config.steps[currentStep];
    const autoAdvance = ['cards-single','list-single','consult'];
    if (autoAdvance.includes(step.type) && WizardModules[step.type].valid(step, state)) {
      setTimeout(function() { nextStep(); }, 300);
    }
  }

  function handleInputChange(e) {
    const el = e.target;
    const key = el.dataset.key || el.id.replace('wz-','');
    if (!key) return;
    if (el.type === 'checkbox') {
      state[key] = el.checked;
    } else {
      state[key] = el.value;
    }
    // Re-validate
    const step = config.steps[currentStep];
    const mod = WizardModules[step.type];
    const nextBtn = document.getElementById('bch-wizard-next');
    if (nextBtn) nextBtn.disabled = !mod.valid(step, state);

    // ZIP: check service area
    if (key === 'zip' && el.value.length === 5) checkZip(el.value);
  }

  // --- ZIP service area check ---
  const PBC_ZIPS = new Set([
    '33401','33403','33404','33405','33406','33407','33408','33409','33410','33411',
    '33412','33413','33414','33415','33417','33418','33419','33420','33421','33422',
    '33424','33425','33426','33428','33430','33431','33432','33433','33434','33435',
    '33436','33437','33438','33440','33444','33445','33446','33448','33449','33458',
    '33460','33461','33462','33463','33467','33469','33470','33472','33473','33476',
    '33477','33478','33480','33483','33484','33486','33487','33488','33496','33497',
    '33498','33499'
  ]);

  function checkZip(zip) {
    const resultEl = document.getElementById('wz-zip-result');
    if (!resultEl) return;
    if (PBC_ZIPS.has(zip)) {
      resultEl.innerHTML = '<span class="wz-zip-ok">In-home service available in your area.</span>';
    } else {
      resultEl.innerHTML = '<span class="wz-zip-alt">Outside our in-home area. Telehealth is available statewide across [STATE].</span>';
    }
  }

  // --- Lead capture ---
  function fireLead(event) {
    if (!LEAD_WEBHOOK_URL || LEAD_WEBHOOK_URL.includes('PLACEHOLDER')) return;
    try {
      const payload = Object.assign({}, state, {
        event: event,
        page: window.location.href,
        ts: new Date().toISOString()
      });
      const body = JSON.stringify(payload);
      // fetch with keepalive sends proper JSON Content-Type and survives navigation
      if (typeof fetch !== 'undefined') {
        fetch(LEAD_WEBHOOK_URL, {
          method:    'POST',
          headers:   { 'Content-Type': 'application/json' },
          body:      body,
          keepalive: true,
        }).catch(() => {
          try { navigator.sendBeacon(LEAD_WEBHOOK_URL, new Blob([body], { type: 'application/json' })); } catch(e2) {}
        });
      } else if (navigator.sendBeacon) {
        navigator.sendBeacon(LEAD_WEBHOOK_URL, new Blob([body], { type: 'application/json' }));
      }
    } catch(e) {}
  }

  // --- CSS for overlay/card (injected so engine.js is self-contained) ---
  const wizardCSS = `
#bch-wizard-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(26,37,64,0.72); z-index: 9000;
  align-items: center; justify-content: center;
  padding: 1rem; opacity: 0; transition: opacity 0.28s ease;
}
#bch-wizard-overlay.visible { opacity: 1; }
#bch-wizard-card {
  background: #fff; border-radius: 24px;
  width: 100%; max-width: 540px; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.22);
  display: flex; flex-direction: column;
  transform: translateY(16px); transition: transform 0.28s ease;
}
#bch-wizard-overlay.visible #bch-wizard-card { transform: translateY(0); }
#bch-wizard-header {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
  position: sticky; top: 0; background: #fff; z-index: 2;
}
#bch-wizard-title { font-size: .9rem; font-weight: 700; color: #1a1a1a; flex: 1; }
#bch-wizard-progress { flex: 2; }
#bch-wizard-bar { height: 4px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-bottom: .3rem; }
#bch-wizard-fill { height: 100%; background: #2c61a4; border-radius: 99px; transition: width .3s ease; }
#bch-wizard-step-label { font-size: .7rem; color: #9ca3af; text-align: right; }
#bch-wizard-close {
  width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; color: #6b7280; cursor: pointer; flex-shrink: 0;
  background: none; transition: all .2s;
}
#bch-wizard-close:hover { background: #f1f5fb; color: #2c61a4; }
#bch-wizard-body { padding: 1.5rem; flex: 1; }
#bch-wizard-footer {
  padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; bottom: 0; background: #fff;
}
.wz-question { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1.25rem; line-height: 1.4; }
.wz-subtext { font-size: .85rem; color: #6b7280; margin-bottom: 1rem; margin-top: -.75rem; }
.wz-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; }
.wz-card {
  border: 1.5px solid #e2e8f0; border-radius: 12px; padding: .9rem .75rem;
  text-align: center; cursor: pointer; background: #fff;
  transition: all .2s; display: flex; flex-direction: column;
  align-items: center; gap: .4rem;
}
.wz-card:hover { border-color: #2c61a4; background: #eef3fb; }
.wz-card.selected { border-color: #2c61a4; background: #eef3fb; box-shadow: 0 0 0 2px #2c61a4; }
.wz-card-img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.wz-card-icon { font-size: 1.4rem; }
.wz-card-label { font-size: .8rem; font-weight: 600; color: #1a1a1a; line-height: 1.3; }
.wz-list { display: flex; flex-direction: column; gap: .5rem; }
.wz-list-item {
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  padding: .9rem 1.25rem; text-align: left; cursor: pointer;
  font-size: .95rem; font-weight: 500; color: #1a1a1a; background: #fff;
  transition: all .2s;
}
.wz-list-item:hover, .wz-list-item.selected {
  border-color: #2c61a4; background: #eef3fb;
}
.wz-list-item.selected { box-shadow: 0 0 0 2px #2c61a4; }
.wz-form { display: flex; flex-direction: column; gap: 1rem; }
.wz-field label { font-size: .8rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; display: block; margin-bottom: .35rem; }
.wz-input {
  width: 100%; padding: .7rem 1rem; border: 1.5px solid #e2e8f0;
  border-radius: 10px; font-size: .95rem; background: #fff; color: #1a1a1a;
  transition: border-color .2s; outline: none;
}
.wz-input:focus { border-color: #2c61a4; }
.wz-consent { margin-top: .25rem; }
.wz-consent-label { display: flex; align-items: flex-start; gap: .6rem; cursor: pointer; font-size: .78rem; color: #6b7280; line-height: 1.5; }
.wz-consent-label input { margin-top: .15rem; flex-shrink: 0; accent-color: #2c61a4; }
.wz-consent-label a { color: #2c61a4; }
.wz-zip-ok { font-size: .82rem; color: #059669; font-weight: 500; margin-top: .35rem; display: block; }
.wz-zip-alt { font-size: .82rem; color: #2c61a4; font-weight: 500; margin-top: .35rem; display: block; }
.wz-consult-list { display: flex; flex-direction: column; gap: .6rem; }
.wz-consult-option {
  display: flex; align-items: center; gap: .75rem;
  padding: .9rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
  cursor: pointer; background: #fff; text-align: left; width: 100%;
  transition: all .2s;
}
.wz-consult-option:hover, .wz-consult-option.selected {
  border-color: #2c61a4; background: #eef3fb;
}
.wz-consult-option.selected { box-shadow: 0 0 0 2px #2c61a4; }
.wz-consult-icon {
  width: 40px; height: 40px; border-radius: 50%; background: #eef3fb;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;
}
.wz-consult-text { flex: 1; }
.wz-consult-text strong { display: block; font-size: .9rem; color: #1a1a1a; margin-bottom: .15rem; }
.wz-consult-text span { font-size: .78rem; color: #6b7280; }
.wz-consult-radio {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid #e2e8f0; flex-shrink: 0; transition: all .2s;
}
.wz-consult-radio.checked { border-color: #2c61a4; background: #2c61a4; box-shadow: inset 0 0 0 3px #fff; }
.wz-time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .4rem; }
.wz-time-slot {
  padding: .45rem .25rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: .78rem; font-weight: 500; cursor: pointer; background: #fff;
  transition: all .2s; text-align: center;
}
.wz-time-slot:hover, .wz-time-slot.selected { border-color: #2c61a4; background: #eef3fb; }
.wz-time-slot.selected { box-shadow: 0 0 0 2px #2c61a4; }
.wz-confirm { text-align: center; padding: 1rem 0; }
.wz-confirm-icon { font-size: 3rem; margin-bottom: 1rem; }
.wz-confirm h3 { font-size: 1.35rem; font-weight: 700; margin-bottom: .6rem; }
.wz-confirm p { color: #6b7280; margin-bottom: 1.25rem; font-size: .95rem; }
.wz-confirm-list { text-align: left; list-style: none; display: flex; flex-direction: column; gap: .5rem; margin: 1rem 0; }
.wz-confirm-list li { display: flex; align-items: flex-start; gap: .6rem; font-size: .88rem; }
.wz-chk { color: #2c61a4; font-weight: 700; flex-shrink: 0; }
.wz-btn-back {
  padding: .6rem 1.25rem; border: 1.5px solid #e2e8f0; border-radius: 99px;
  font-size: .9rem; font-weight: 600; color: #6b7280; background: #fff; cursor: pointer;
  transition: all .2s;
}
.wz-btn-back:hover { border-color: #2c61a4; color: #2c61a4; }
.wz-btn-next {
  padding: .7rem 1.75rem; border-radius: 99px; border: none;
  background: #2c61a4; color: #fff; font-size: .95rem; font-weight: 700;
  cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; gap: .4rem;
}
.wz-btn-next:hover:not(:disabled) { background: #1e4a85; transform: translateY(-1px); }
.wz-btn-next:disabled { opacity: .45; cursor: not-allowed; transform: none; }
@media (max-width: 540px) {
  #bch-wizard-card { border-radius: 16px 16px 0 0; max-height: 95vh; }
  #bch-wizard-overlay { align-items: flex-end; padding: 0; }
  .wz-cards { grid-template-columns: 1fr 1fr; }
  .wz-time-grid { grid-template-columns: repeat(2, 1fr); }
}
  `;

  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = wizardCSS;
    document.head.appendChild(style);
  }

  // --- Boot ---
  document.addEventListener('DOMContentLoaded', function() {
    injectCSS();
    if (typeof PAGE_WIZARD !== 'undefined') {
      init(PAGE_WIZARD);
    }
  });

  // Expose
  window.BCHWizard = { open: function() { openWizard(); }, close: closeWizard };

})();
