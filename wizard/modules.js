/**
 * [COMPANY] Wizard — Module Library
 * Defines every step type used across all service wizards.
 * Each module returns { html, valid(state) }.
 *
 * Module types: cards-single, cards-multi, list-single, zip, contact, consult, datetime, confirm
 */

const WizardModules = {

  /**
   * cards-single — tap one card from a grid. Photos optional.
   * config: { q, options: [{id, label, icon?, img?}] }
   */
  'cards-single': {
    render(config, state) {
      const key = config.stateKey || 'qualifier1';
      return `
        <div class="wz-question">${config.q}</div>
        <div class="wz-cards">
          ${config.options.map(o => `
            <button class="wz-card ${state[key]===o.id?'selected':''}"
                    data-module="cards-single" data-key="${key}" data-val="${o.id}">
              ${o.img ? `<img src="${o.img}" alt="${o.label}" class="wz-card-img">` : ''}
              ${o.icon ? `<span class="wz-card-icon">${o.icon}</span>` : ''}
              <span class="wz-card-label">${o.label}</span>
            </button>`).join('')}
        </div>`;
    },
    valid(config, state) {
      const key = config.stateKey || 'qualifier1';
      return !!state[key];
    }
  },

  /**
   * cards-multi — tap multiple cards (up to max).
   * config: { q, options: [{id, label, icon?}], max? }
   */
  'cards-multi': {
    render(config, state) {
      const key = config.stateKey || 'qualifier1';
      const selected = state[key] || [];
      return `
        <div class="wz-question">${config.q}</div>
        <div class="wz-subtext">Select all that apply.</div>
        <div class="wz-cards">
          ${config.options.map(o => `
            <button class="wz-card ${selected.includes(o.id)?'selected':''}"
                    data-module="cards-multi" data-key="${key}" data-val="${o.id}">
              ${o.icon ? `<span class="wz-card-icon">${o.icon}</span>` : ''}
              <span class="wz-card-label">${o.label}</span>
            </button>`).join('')}
        </div>`;
    },
    valid(config, state) {
      const key = config.stateKey || 'qualifier1';
      return (state[key] || []).length > 0;
    }
  },

  /**
   * list-single — full-width tap list (for 4-6 options).
   * config: { q, options: [{id, label}] }
   */
  'list-single': {
    render(config, state) {
      const key = config.stateKey || 'qualifier1';
      return `
        <div class="wz-question">${config.q}</div>
        <div class="wz-list">
          ${config.options.map(o => `
            <button class="wz-list-item ${state[key]===o.id?'selected':''}"
                    data-module="list-single" data-key="${key}" data-val="${o.id}">
              ${o.label}
            </button>`).join('')}
        </div>`;
    },
    valid(config, state) {
      const key = config.stateKey || 'qualifier1';
      return !!state[key];
    }
  },

  /**
   * zip — single zip/address field for service-area check.
   */
  'zip': {
    render(config, state) {
      return `
        <div class="wz-question">Are you in our service area?</div>
        <div class="wz-subtext">Enter your zip code. We serve all of [COUNTY] and offer [SERVICE NAME] statewide.</div>
        <div class="wz-field">
          <input type="text" class="wz-input" id="wz-zip" placeholder="Enter zip code"
                 value="${state.zip||''}" inputmode="numeric" maxlength="5"
                 data-module="zip" data-key="zip">
          <div class="wz-zip-result" id="wz-zip-result"></div>
        </div>`;
    },
    valid(config, state) {
      return (state.zip||'').length === 5;
    }
  },

  /**
   * contact — name, email, phone + consent.
   */
  'contact': {
    render(config, state) {
      return `
        <div class="wz-question">Tell us how to reach you.</div>
        <div class="wz-subtext">Your info is private. [PROVIDER NAME]'s team will reach out within 24 hours.</div>
        <div class="wz-form">
          <div class="wz-field">
            <label>Full Name</label>
            <input type="text" class="wz-input" id="wz-name" placeholder="Jane Smith"
                   value="${state.name||''}" autocomplete="name" data-key="name">
          </div>
          <div class="wz-field">
            <label>Email Address</label>
            <input type="email" class="wz-input" id="wz-email" placeholder="jane@email.com"
                   value="${state.email||''}" autocomplete="email" data-key="email">
          </div>
          <div class="wz-field">
            <label>Phone Number</label>
            <input type="tel" class="wz-input" id="wz-phone" placeholder="(561) 555-0100"
                   value="${state.phone||''}" autocomplete="tel" data-key="phone">
          </div>
          <div class="wz-consent">
            <label class="wz-consent-label">
              <input type="checkbox" id="wz-consent" ${state.consent?'checked':''} data-key="consent">
              <span><!-- CONSENT_WORDING_SLOT --> By submitting, you agree to be contacted by [COMPANY NAME] at the phone number and email provided. Message and data rates may apply. Reply STOP to opt out. View our <a href="/privacy.html" target="_blank">Privacy Policy</a>.</span>
            </label>
          </div>
        </div>`;
    },
    valid(config, state) {
      return !!(state.name && state.email && state.phone && state.consent);
    }
  },

  /**
   * consult — channel selection: [SERVICE NAME] / phone / in-person.
   */
  'consult': {
    render(config, state) {
      const options = [
        { id: '[SERVICE NAME]', icon: '💻', label: '[SERVICE NAME] Meet & Greet', desc: 'Free video call with [PROVIDER NAME], no commitment' },
        { id: 'phone',      icon: '📞', label: 'Phone Call',              desc: '[PROVIDER NAME] or her team calls you back' },
        { id: 'in-person',  icon: '📍', label: '[CITY] Office',       desc: '[ADDRESS], Unit G — appointment required' },
      ];
      return `
        <div class="wz-question">How would you like your consultation?</div>
        <div class="wz-subtext">All options are free for your first meet and greet.</div>
        <div class="wz-consult-list">
          ${options.map(o => `
            <button class="wz-consult-option ${state.consultType===o.id?'selected':''}"
                    data-module="consult" data-key="consultType" data-val="${o.id}">
              <span class="wz-consult-icon">${o.icon}</span>
              <span class="wz-consult-text">
                <strong>${o.label}</strong>
                <span>${o.desc}</span>
              </span>
              <span class="wz-consult-radio ${state.consultType===o.id?'checked':''}"></span>
            </button>`).join('')}
        </div>`;
    },
    valid(config, state) { return !!state.consultType; }
  },

  /**
   * datetime — date picker + time slots.
   * Mangomint integration slot.
   */
  'datetime': {
    render(config, state) {
      const today = new Date();
      const minDate = today.toISOString().split('T')[0];
      const maxDate = new Date(today.setMonth(today.getMonth()+2)).toISOString().split('T')[0];
      const slots = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                     '12:00 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM',
                     '3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM'];
      return `
        <div class="wz-question">Pick a date and time.</div>
        <div class="wz-subtext">All times Eastern. We confirm by phone or email.</div>
        <!-- MANGOMINT_EMBED_SLOT: replace below with Mangomint widget when configured -->
        <div class="wz-field">
          <label>Date</label>
          <input type="date" class="wz-input" id="wz-date"
                 value="${state.date||''}" min="${minDate}" max="${maxDate}" data-key="date">
        </div>
        <div class="wz-field" style="margin-top:1rem;">
          <label>Preferred Time</label>
          <div class="wz-time-grid">
            ${slots.map(s=>`<button class="wz-time-slot ${state.time===s?'selected':''}"
                    data-module="datetime" data-key="time" data-val="${s}">${s}</button>`).join('')}
          </div>
        </div>`;
    },
    valid(config, state) { return !!(state.date && state.time); }
  },

  /**
   * confirm — final screen.
   */
  'confirm': {
    render(config, state) {
      const firstName = (state.name||'').split(' ')[0] || 'there';
      const serviceLabel = config.serviceLabel || 'your selected service';
      return `
        <div class="wz-confirm">
          <div class="wz-confirm-icon">🎉</div>
          <h3>You are all set, ${firstName}!</h3>
          <p>[PROVIDER NAME]'s team will reach out within 24 hours to confirm your appointment.</p>
          <ul class="wz-confirm-list">
            <li><span class="wz-chk">✓</span> Confirmation email sent to <strong>${state.email||''}</strong></li>
            <li><span class="wz-chk">✓</span> Service: <strong>${serviceLabel}</strong></li>
            ${state.consultType?`<li><span class="wz-chk">✓</span> Consultation: <strong>${state.consultType}</strong></li>`:''}
            ${state.date?`<li><span class="wz-chk">✓</span> Requested: <strong>${state.date}${state.time?' at '+state.time:''}</strong></li>`:''}
          </ul>
          <p style="font-size:.85rem;color:var(--text-muted);margin-top:1rem;">Questions? Call us at <a href="tel:+1[PHONE]" style="color:var(--blue);font-weight:600;">[PHONE]</a></p>
        </div>`;
    },
    valid() { return true; }
  }
};

if (typeof module !== 'undefined') module.exports = WizardModules;
