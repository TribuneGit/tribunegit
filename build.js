#!/usr/bin/env node
/**
 * [COMPANY] Page Generator
 * Reads /data/services/<slug>.json + /data/wizard/<slug>.json
 * Outputs /services/<slug>.html
 *
 * Usage: node build.js [slug]   — build one page
 *        node build.js          — build all pages in manifest
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = __dirname;
const NAV     = fs.readFileSync(path.join(ROOT,'partials/nav.html'),'utf8');
const FOOTER  = fs.readFileSync(path.join(ROOT,'partials/footer.html'),'utf8');
const WIZARD  = fs.readFileSync(path.join(ROOT,'partials/wizard-overlay.html'),'utf8');
const MANIFEST= JSON.parse(fs.readFileSync(path.join(ROOT,'build-manifest.json'),'utf8'));

// ---- Helpers ---------------------------------------------------------------

function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function breadcrumb(name){
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <a href="/">Home</a>
    <span class="sep">›</span>
    <a href="/services/">Services</a>
    <span class="sep">›</span>
    <span class="current">${name}</span>
  </div>
</nav>`;
}

function valuePropSection(d){
  const hw = d.how_it_works || {};
  const features = [
    hw.time     && { icon:'⏱', label:'Treatment Time',    value: hw.time },
    hw.onset    && { icon:'⚡', label:'Results Onset',     value: hw.onset },
    hw.duration && { icon:'📅', label:'How Long It Lasts', value: hw.duration },
    hw.downtime && { icon:'🔄', label:'Downtime',          value: hw.downtime },
    { icon:'📍', label:'We Come to You', value: hw.location || '[CITY] and [COUNTY]' },
  ].filter(Boolean).slice(0,4);

  const featureHTML = features.map(f=>`
      <div class="svc-vp-feature">
        <div class="svc-vp-icon">${f.icon}</div>
        <div class="svc-vp-text">
          <strong>${esc(f.label)}</strong>
          <span>${esc(f.value)}</span>
        </div>
      </div>`).join('');

  return `<section class="svc-vp-section">
  <div class="svc-vp-inner">
    <div class="svc-vp-left">
      <span class="eyebrow">CONCIERGE CARE</span>
      <h2 class="svc-vp-heading">Your ${esc(d.name)}, <em>Your Way</em></h2>
      <p class="svc-vp-sub">Science-backed. Expert-led. [PROVIDER NAME] delivers every treatment to your door, tailored to your goals and your schedule.</p>
    </div>
    <div class="svc-vp-right">
      <div class="svc-vp-features">${featureHTML}</div>
      <a href="https://booking.[BOOKING URL]" class="btn btn-primary btn-pill btn-lg">Book Free Consultation</a>
    </div>
  </div>
</section>`;
}

function hero(d, wizardJson){
  const imgPath = d.hero_image || 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
  const slug    = d.slug || '';
  return `<section class="svc-hero service-page">
    <div class="svc-hero-grid">

      <!-- Left: image with minimal overlay. Value prop + CTAs are placeholders (hidden). -->
      <div class="svc-hero-image-card">
        <img src="${imgPath}" alt="${esc(d.name)} in [CITY], FL" loading="eager">
        <div class="svc-hero-overlay">
          <span class="svc-hero-category">${esc(d.category||'')}</span>
          <h1>${esc(d.h1||d.name)}</h1>
          <!-- Placeholders: remove .is-hidden to activate when content is ready -->
          <p class="svc-hero-value is-hidden">${esc(d.hero_value_prop||'')}</p>
          <div class="svc-hero-ctas is-hidden">
            <a href="https://booking.[BOOKING URL]" class="btn btn-primary btn-pill btn-lg">Book Free Consultation</a>
            <a href="/pricing.html" class="btn btn-secondary btn-pill">View Pricing</a>
          </div>
          <p class="svc-hero-disclaimer is-hidden">${esc(d.disclaimer||'Performed by [PROVIDER NAME], [CREDENTIALS]. Individual results may vary.')}</p>
        </div>
      </div>

      <!-- Right: inline guide shell. Service pre-selected — starts at qualifier (inlineStep 2). -->
      <div class="svc-guide__shell">

        <div class="svc-guide__header">
          <p class="svc-guide__eyebrow">Free Consultation</p>
          <h2 class="svc-guide__heading" x-text="inlineHeading()"></h2>
          <p class="svc-guide__sub" x-show="inlineStep === 4">Your info is private. [PROVIDER NAME]&apos;s team will reach out within 24 hours.</p>
          <p class="svc-guide__sub" x-show="inlineStep === 5">All options are available at no charge for your first meet and greet.</p>
        </div>

        <div class="svc-guide__body">

          <!-- Step 2: Qualifier (HIPAA-compliant, goal/area only) -->
          <div x-show="inlineStep === 2">
            <div class="svc-card-grid">
              <template x-for="opt in getConcerns()" :key="opt.id">
                <button class="svc-card" :class="{'svc-card--active': selectedConcern === opt.id}" @click="selectedConcern = opt.id">
                  <span class="svc-card__icon" x-text="opt.icon"></span>
                  <span class="svc-card__label" x-text="opt.label"></span>
                </button>
              </template>
            </div>
          </div>

          <!-- Step 3: Detail/goal (botox, fillers, microneedling, weight-loss only) -->
          <div x-show="inlineStep === 3">
            <div class="svc-card-grid">
              <template x-for="opt in getDetailOptions()" :key="opt.id">
                <button class="svc-card" :class="{'svc-card--active': selectedDetail === opt.id}" @click="selectedDetail = opt.id">
                  <span class="svc-card__icon" x-text="opt.icon"></span>
                  <span class="svc-card__label" x-text="opt.label"></span>
                </button>
              </template>
            </div>
          </div>

          <!-- Step 4: Contact form -->
          <div x-show="inlineStep === 4">
            <div class="inline-form">
              <div class="inline-field">
                <label class="inline-label">Full Name</label>
                <input class="inline-input" type="text" x-model="formData.name" placeholder="Jane Smith" autocomplete="name">
              </div>
              <div class="inline-field">
                <label class="inline-label">Email Address</label>
                <input class="inline-input" type="email" x-model="formData.email" placeholder="jane@email.com" autocomplete="email">
              </div>
              <div class="inline-field">
                <label class="inline-label">Phone Number</label>
                <input class="inline-input" type="tel" x-model="formData.phone" placeholder="(561) 555-0100" autocomplete="tel">
              </div>
              <div class="inline-consent">
                <label style="display:flex;align-items:flex-start;gap:0.5rem;cursor:pointer;">
                  <input type="checkbox" x-model="formData.consent" style="margin-top:0.2rem;flex-shrink:0;">
                  <span>By submitting, you agree to be contacted by [COMPANY NAME] at the phone number and email provided. Message and data rates may apply. Reply STOP to opt out.</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 5: Consultation type -->
          <div x-show="inlineStep === 5">
            <div class="inline-consult-grid">
              <template x-for="ct in consultTypes" :key="ct.id">
                <button class="inline-consult-card" :class="{'inline-consult-card--active': consultType === ct.id}" @click="selectConsult(ct.id)">
                  <span class="inline-consult-icon" x-text="ct.icon"></span>
                  <div class="inline-consult-text">
                    <span class="inline-consult-label" x-text="ct.label"></span>
                    <span class="inline-consult-desc" x-text="ct.desc"></span>
                  </div>
                </button>
              </template>
            </div>
          </div>

          <!-- Step 6: Date and time -->
          <div x-show="inlineStep === 6">
            <div class="inline-form">
              <div class="inline-field">
                <label class="inline-label">Preferred Date</label>
                <input class="inline-input" type="date" x-model="selectedDate" :min="minDate" :max="maxDate">
              </div>
              <div class="inline-field">
                <label class="inline-label">Preferred Time <span style="font-weight:400;color:#6b7280;">(Eastern)</span></label>
                <div class="inline-time-slots">
                  <template x-for="slot in timeSlots" :key="slot">
                    <button class="inline-time-slot" :class="{'inline-time-slot--active': selectedTime === slot}" @click="selectedTime = slot" x-text="slot"></button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 7: Confirmation -->
          <div x-show="inlineStep === 7">
            <div class="inline-confirm">
              <div class="inline-confirm__icon">&#127881;</div>
              <p class="inline-confirm__msg">[PROVIDER NAME]&apos;s team will reach out within 24 hours to confirm your appointment.</p>
              <ul class="inline-confirm__list">
                <li>Confirmation sent to <strong x-text="formData.email"></strong></li>
                <li>Service: <strong>${esc(d.name)}</strong></li>
                <li>Consultation: <strong x-text="getConsultLabel()"></strong></li>
                <li x-show="selectedDate">Date requested: <strong x-text="formatDate(selectedDate) + ' at ' + selectedTime"></strong></li>
              </ul>
              <p class="inline-confirm__phone">Questions? Call <a href="tel:+1[PHONE]">[PHONE]</a></p>
            </div>
          </div>

        </div><!-- /.svc-guide__body -->

        <!-- Footer: step indicator + Prev/Next (hidden on confirmation) -->
        <div class="svc-guide__footer" x-show="inlineStep < 7">
          <div class="svc-guide__step">
            <span class="svc-guide__step-label" x-text="inlineStepLabel()"></span>
            <div class="svc-guide__progress">
              <span class="svc-guide__progress-dot" :style="'left:' + inlineProgressLeft()"></span>
            </div>
          </div>
          <div class="svc-guide__footer-btns">
            <button class="svc-guide__prev" x-show="inlineStep > 2" @click="inlinePrev()">&lsaquo; Prev</button>
            <button class="svc-guide__next" @click="inlineNext()" :class="{'svc-guide__next--on': inlineCanNext()}" :disabled="!inlineCanNext()" x-text="inlineNextLabel()"></button>
          </div>
        </div>

      </div><!-- /.svc-guide__shell -->

    </div>
</section>`;
}

function faqSection(faqs){
  if(!faqs||!faqs.length) return '';
  const items = faqs.map((f,i)=>`<div class="faq-item" id="faq-${i+1}">
      <button class="faq-question">
        <span class="faq-q-text">${esc(f.q)}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer">${esc(f.a)}</div>
    </div>`).join('');
  return `<section class="svc-faq-section" aria-label="Common Questions">
  <div class="svc-faq-inner">
    <h2 class="svc-faq-heading">Common Questions</h2>
    <div class="svc-faq-list">
    ${items}
    </div>
    <p class="faq-footer">Still have questions? <a href="/contact.html">Contact Us</a></p>
  </div>
</section>`;
}

function aboutSection(d){
  if(!d.about||!d.about.length) return '';
  const img = d.about_image || d.hero_image || 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
  const paras = d.about.map(p=>`<p>${esc(p)}</p>`).join('\n        ');
  return `<section class="svc-section svc-section--wide" aria-label="About ${esc(d.name)}">
  <div class="svc-zigzag">
    <div class="svc-zigzag-text">
      <span class="eyebrow">ABOUT ${(d.category||d.name).toUpperCase()}</span>
      <h2 class="svc-section-title">${esc(d.about_headline||('About '+d.name))}</h2>
      ${paras}
      <div><a href="https://booking.[BOOKING URL]" class="btn btn-primary btn-pill">Book Free Consultation</a></div>
    </div>
    <div class="svc-zigzag-image">
      <img src="${img}" alt="${esc(d.name)} at [COMPANY NAME]" loading="lazy">
    </div>
  </div>
</section>`;
}

function howItWorks(d){
  const hw = d.how_it_works;
  if(!hw) return '';
  const chips = [
    hw.time     && {icon:'⏱',label:'Time: '+hw.time},
    hw.downtime && {icon:'🔄',label:'Downtime: '+hw.downtime},
    hw.onset    && {icon:'⚡',label:'Onset: '+hw.onset},
    hw.duration && {icon:'📅',label:'Duration: '+hw.duration},
    {icon:'📍',label:'Location: '+(hw.location||'We come to you')},
  ].filter(Boolean);
  const img = d.how_image || d.hero_image || 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
  return `<section class="svc-section-white svc-section--wide" aria-label="How ${esc(d.name)} Works">
  <div class="svc-zigzag">
    <div class="svc-zigzag-image">
      <img src="${img}" alt="How ${esc(d.name)} works at [COMPANY NAME]" loading="lazy">
    </div>
    <div class="svc-zigzag-text">
      <span class="eyebrow">WHAT TO EXPECT</span>
      <h2 class="svc-section-title">How ${esc(d.name)} Works</h2>
      ${hw.body ? `<p>${esc(hw.body)}</p>` : ''}
      <div class="svc-facts" style="margin-top:1rem">
        ${chips.map(c=>`<div class="svc-fact"><span>${c.icon}</span> ${esc(c.label)}</div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;
}

function menuSection(d){
  if(!d.sections||!d.sections.length) return '';
  const cards = d.sections.map(s=>`<div class="svc-menu-item" id="${esc(s.id||'')}">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body||'')}</p>
        ${s.price ? `<span class="price-tag">${esc(s.price)}</span>` : ''}
        ${s.items && s.items.length ? '<ul style="margin-top:.75rem;list-style:disc;padding-left:1.25rem">'+s.items.map(i=>`<li style="font-size:.875rem;color:var(--text-muted);margin-bottom:.25rem">${esc(i)}</li>`).join('')+'</ul>' : ''}
      </div>`).join('\n      ');
  const headline = d.menu_headline || ('Our '+d.name+' Options');
  return `<section class="svc-section-alt" aria-label="${esc(headline)}">
  <div class="container">
    <div style="text-align:center;margin-bottom:2rem">
      <span class="eyebrow">${(d.category||'SERVICES').toUpperCase()}</span>
      <h2 class="svc-section-title centered">${esc(headline)}</h2>
    </div>
    <div class="svc-menu">
      ${cards}
    </div>
  </div>
</section>`;
}

function byline(d){
  return ''; // merged into credentialStrip()
}

function credentialStrip(d){
  const photo = 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
  return `<section class="svc-cred-strip" aria-label="Provider Credentials">
  <div class="svc-cred-inner">

    <div class="svc-cred-provider">
      <img class="svc-cred-photo" src="${photo}" alt="[PROVIDER NAME], [CREDENTIALS]" loading="lazy">
      <div class="svc-cred-meta">
        <strong>[PROVIDER NAME], [CREDENTIALS]</strong>
        <span>Written and medically reviewed by [PROVIDER NAME]</span>
        <span class="svc-cred-date">Last updated ${esc(d.last_updated||'June 2026')}</span>
      </div>
    </div>

    <div class="svc-cred-divider"></div>

    <div class="svc-cred-badges">
      <div class="svc-cred-badge">
        <div class="svc-cred-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="white" fill-opacity="0.15"/>
            <path d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6V8z" fill="white"/>
          </svg>
        </div>
        <div class="svc-cred-info">
          <strong>[STATE] Licensed [CREDENTIALS]</strong>
          <span>Board Certified [CREDENTIALS]</span>
        </div>
      </div>
      <div class="svc-cred-badge">
        <div class="svc-cred-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="white" stroke-width="2" fill="white" fill-opacity="0.15"/>
            <path d="M10 16l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="svc-cred-info">
          <strong>AANP Member</strong>
          <span>American Association of NPs</span>
        </div>
      </div>
      <div class="svc-cred-badge">
        <div class="svc-cred-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4l3.09 6.26L26 11.27l-5 4.87 1.18 6.88L16 19.77l-6.18 3.25L11 15.14l-5-4.87 6.91-1.01L16 4z" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        <div class="svc-cred-info">
          <strong>100+ Five-Star Reviews</strong>
          <span>Google and Healthgrades</span>
        </div>
      </div>
    </div>

  </div>
</section>`;
}

function steps(d){
  const st = d.steps_content || [
    {n:1, title:'Book Your Free Meet and Greet', body:'Schedule a free telehealth call with [PROVIDER NAME] to talk through your goals and find the right care for you.'},
    {n:2, title:'Receive Your Custom Plan',       body:'[PROVIDER NAME] listens, evaluates, and builds a treatment plan built around your life. No cookie-cutter protocols.'},
    {n:3, title:'Care Comes to You',              body:'At-home, in-office, or telehealth. Your choice. Your schedule. You are never just a number.'},
  ];
  return `<section class="svc-section" aria-label="How It Works">
  <div class="container">
    <div class="svc-steps-header">
      <span class="eyebrow">HOW IT WORKS</span>
      <h2 class="svc-section-title centered">Simple. Personal. Convenient.</h2>
      <p>Three steps to care that fits your life.</p>
      <div style="margin-top:1.25rem"><button class="btn btn-primary btn-pill" data-open-wizard>Book Free Consultation →</button></div>
    </div>
    <div class="svc-steps-grid">
      ${st.map(s=>`<div class="svc-step-card">
        <div class="svc-step-badge">${s.n}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

function testimonial(d){
  if(!d.testimonial||!d.testimonial.quote) return '';
  return `<section class="svc-section-alt" aria-label="Patient Stories">
    <div class="svc-testimonial">
      <div class="svc-testimonial-stars">
        <span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>
      </div>
      <blockquote>${esc(d.testimonial.quote)}</blockquote>
      <cite><strong>${esc(d.testimonial.name||'')}${d.testimonial.city ? ', '+esc(d.testimonial.city) : ''}</strong></cite>
    </div>
  </section>`;
}

function trust(){
  return ''; // merged into credentialStrip()
}

function serviceArea(d){
  const eyebrow = ((d.name||'SERVICE')+' NEAR YOU').toUpperCase();
  // Static SVG map — [STATE] outline with [COUNTY] highlighted.
  // Zero JS, zero external requests, instant render. Same approach as LaserAway's static coverage map.
  return `<section class="svc-section" aria-label="Service Area">
  <div class="container">
    <div class="svc-area-grid">
      <div class="svc-area-text">
        <span class="eyebrow">${eyebrow}</span>
        <h2 class="svc-section-title">Serving <em>[CITY]</em> and All of [COUNTY]</h2>
        <p>We deliver ${esc(d.name||'care')} to [CITY], [CITY], [CITY], [CITY], [CITY], and all of [COUNTY], FL.${d.telehealth_statewide ? ' Telehealth appointments are available statewide across [STATE].' : ''}</p>
        <div class="svc-area-links">
          <a href="/locations/wellington-fl.html" class="svc-area-link">[CITY]</a>
          <a href="/locations/loxahatchee-fl.html" class="svc-area-link">[CITY]</a>
          <a href="/locations/royal-palm-beach-fl.html" class="svc-area-link">[CITY]</a>
          <a href="/locations/west-palm-beach-fl.html" class="svc-area-link">[CITY]</a>
          <a class="svc-area-link" href="/about/service-area.html">View Full Service Area</a>
        </div>
      </div>
      <div class="svc-area-map" style="border-radius:var(--radius);overflow:hidden;min-height:300px;">
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=-80.29,26.63,-80.19,26.69&layer=mapnik&marker=26.659,-80.2431"
          width="100%" height="320" style="border:0;display:block;" loading="lazy"
          title="[COMPANY NAME] — [CITY], FL"
          allowfullscreen></iframe>
        <p style="font-size:.72rem;text-align:right;margin:.25rem .5rem 0;padding-bottom:.25rem;"><a href="https://www.openstreetmap.org/?mlat=26.659&mlon=-80.2431#map=13/26.659/-80.2431" target="_blank" rel="noopener" style="color:#6b7280;">View larger map &rarr;</a></p>
      </div>
    </div>
  </div>
</section>`;
}

function finalCTA(d){ return ''; } // removed per design decision

// ---- Service tile lookup (for related services section) -------------------
const TILE = {
  'iv-therapy':              'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'botox':                   'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'dermal-fillers':          'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'microneedling':           'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'prp-facial':              'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'prp-hair':                'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'weight-loss':             'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'peptides':                'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'wellness':                'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'b12-injections':          'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'cryotherapy':             'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'hormone-replacement-therapy': 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'fertility':               'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'in-home-primary-care':    'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'urgent-care':             'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'telehealth':              'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'skilled-nursing':         'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image',
  'membership':              'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image'
};

const SERVICE_NAMES = {
  'iv-therapy':'Mobile IV Therapy','botox':'Botox','dermal-fillers':'Dermal Fillers',
  'microneedling':'Microneedling','prp-facial':'PRP Vampire Facial','prp-hair':'PRP Hair Restoration',
  'weight-loss':'Medical Weight Loss','peptides':'Peptide Therapy','wellness':'Wellness',
  'b12-injections':'B12 Injections','cryotherapy':'Cryotherapy',
  'hormone-replacement-therapy':'Hormone Therapy','fertility':'Fertility Care',
  'in-home-primary-care':'In-Home Primary Care','urgent-care':'Urgent Care at Home',
  'telehealth':'Telehealth','skilled-nursing':'Skilled Nursing','membership':'Membership'
};

// ---- Before & After gallery — auto-scroll carousel -------------------------
function gallery(d){
  if(!d.gallery||!d.gallery.length) return '';
  const headline = d.gallery_headline || 'Before and After';
  const disclaimer = 'Results not typical. Individual results may vary. Performed by [PROVIDER NAME], [CREDENTIALS].';
  // Duplicate items for seamless infinite scroll
  const allImgs = [...d.gallery, ...d.gallery];
  const items = allImgs.map(src=>`
      <div class="ba-slide" @click="lb='${src}'" title="Click to view full screen">
        <img src="${src}" alt="${esc(headline)} — [COMPANY NAME]" loading="lazy">
        <div class="ba-slide-overlay"><span>&#128269;</span></div>
      </div>`).join('');
  return `<section class="svc-section-white" aria-label="${esc(headline)}" x-data="baCarousel()">
  <div class="container">
    <div style="text-align:center;margin-bottom:2rem">
      <span class="eyebrow">RESULTS</span>
      <h2 class="svc-section-title centered">${esc(headline)}</h2>
      <p style="font-size:.8rem;color:var(--text-muted);margin-top:.5rem">${disclaimer}</p>
    </div>
  </div>
  <!-- Full-width carousel track -->
  <div class="ba-carousel-wrap"
       @mouseenter="pause()" @mouseleave="resume()"
       style="overflow:hidden;width:100%;position:relative;">
    <div class="ba-track" :style="'transform:translateX(-'+offset+'px);transition:'+trans">
      ${items}
    </div>
  </div>
  <div style="text-align:center;margin-top:2rem">
    <a href="https://booking.[BOOKING URL]" class="btn btn-primary btn-pill">Book Your Free Consultation</a>
  </div>
  <!-- Fullscreen lightbox -->
  <div class="ba-lightbox" x-show="lb" @click.self="lb=null" x-cloak>
    <button class="ba-lb-close" @click="lb=null" aria-label="Close">&times;</button>
    <img class="ba-lb-img" :src="lb" alt="Result" @click.stop>
  </div>
</section>`;
}

// ---- Related services ------------------------------------------------------
function relatedServices(d){
  if(!d.related||!d.related.length) return '';
  const cards = d.related.map(slug=>{
    const name = SERVICE_NAMES[slug]||slug;
    const img  = TILE[slug]||'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
    return `<a href="/services/${slug}.html" class="related-card">
        <div class="related-card-img">
          <img src="${img}" alt="${esc(name)}" loading="lazy">
        </div>
        <div class="related-card-label">${esc(name)}</div>
      </a>`;
  }).join('');
  return `<section class="svc-section-alt" aria-label="Related Services">
  <div class="container">
    <div style="text-align:center;margin-bottom:2rem">
      <span class="eyebrow">EXPLORE MORE</span>
      <h2 class="svc-section-title centered">Related Services</h2>
    </div>
    <div class="related-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

// ---- Markdown mirror -------------------------------------------------------

/**
 * Auto-generate SEO keyword terms for a given section.
 * If d.seo.<section> exists, those terms are merged in (deduped).
 */
function seoTerms(d, section){
  const n    = (d.name||'').toLowerCase();
  const cat  = (d.category||d.name||'').toLowerCase();
  const locs = ['wellington fl','palm beach county','royal palm beach fl','loxahatchee fl','florida'];

  const auto = {
    page: [
      `${n} wellington fl`,
      `mobile ${n} palm beach county`,
      `${n} at home florida`,
      `in-home ${n} wellington`,
      `concierge ${n} palm beach county`,
      `beyond concierge healthcare ${n}`,
    ],
    hero: [
      `${n} in wellington fl`,
      `mobile ${n} palm beach county fl`,
      `${n} at home wellington`,
      `${n} near me wellington fl`,
      `in-home ${n} palm beach county`,
      `${cat} concierge wellington fl`,
    ],
    about: [
      `${n} treatments wellington fl`,
      `${n} benefits palm beach county`,
      `best ${n} wellington fl`,
      `${n} concierge service florida`,
      `${n} near me palm beach county`,
    ],
    how_it_works: [
      `how ${n} works`,
      `${n} procedure wellington fl`,
      `${n} treatment process palm beach`,
      `concierge ${n} appointment florida`,
      `${n} in-home visit wellington`,
    ],
    menu: [
      `${n} treatment areas`,
      `${n} options wellington fl`,
      `types of ${n} palm beach county`,
      `${n} services near me`,
    ],
    gallery: [
      `${n} before and after wellington fl`,
      `${n} results palm beach county`,
      `${n} before after photos florida`,
    ],
    steps: [
      `book ${n} wellington fl`,
      `how to get ${n} at home`,
      `${n} consultation palm beach county`,
      `schedule ${n} in-home visit`,
    ],
    testimonial: [
      `${n} reviews wellington fl`,
      `${n} patient results palm beach county`,
      `${n} testimonials florida`,
      `${n} five star reviews`,
    ],
    faq: [
      `${n} faq wellington fl`,
      `${n} cost palm beach county`,
      `${n} questions and answers`,
      `is ${n} safe`,
      `how long does ${n} take`,
      `${n} side effects`,
    ],
    provider: [
      'gabrielle radabaugh arnp fnp-c',
      `nurse practitioner ${n} wellington fl`,
      `board certified ${n} provider florida`,
      `fnp-c ${n} palm beach county`,
      'beyond concierge healthcare provider',
      'aanp member nurse practitioner florida',
    ],
  };

  const generated = auto[section] || auto.page;
  const manual    = (d.seo && d.seo[section]) ? d.seo[section] : [];
  // merge, dedupe, then strip any consecutive duplicate words (e.g. "mobile mobile iv therapy")
  const merged = [...new Set([...generated, ...manual])]
    .map(t => t.replace(/\b(\w+)(\s+\1\b)+/gi, '$1').trim())
    .filter(Boolean);
  return merged.join(', ');
}

/**
 * Build a clean markdown mirror of a service page.
 * Output: services/<slug>.md
 */
function buildMarkdown(slug, d){
  const n   = d.name;
  const url = d.canonical || `https://www.[DOMAIN]/services/${slug}.html`;
  const hw  = d.how_it_works || {};
  const today = new Date().toISOString().slice(0,10);

  // Front matter
  let md = `---
title: ${d.meta_title || n + ' | [COMPANY NAME]'}
description: ${d.meta_description || d.hero_value_prop || ''}
url: ${url}
provider: [PROVIDER NAME], [CREDENTIALS]
last_updated: ${d.last_updated || today}
generated: ${today}
---

`;

  // Page heading + intro
  md += `# ${d.h1 || n}

`;
  md += `> ${d.hero_value_prop || d.meta_description || ''}

`;
  md += `**Practice:** [COMPANY NAME] | **Phone:** [PHONE] | **Area:** [CITY], [COUNTY], FL | **Book:** ${url.replace('/services/'+slug+'.html','')}/book-now.html

---

`;

  // --- Hero section ---
  md += `## Hero\n\n`;
  md += `**Keywords:** ${seoTerms(d,'hero')}\n\n`;
  if(d.hero_value_prop) md += `${d.hero_value_prop}\n\n`;
  if(d.hero_perks && d.hero_perks.length){
    md += d.hero_perks.map(p=>`- ${p}`).join('\n') + '\n\n';
  }

  // --- About section ---
  if(d.about && d.about.length){
    md += `## About ${n}\n\n`;
    md += `**Keywords:** ${seoTerms(d,'about')}\n\n`;
    md += d.about.join('\n\n') + '\n\n';
  }

  // --- How It Works section ---
  if(hw && hw.body){
    md += `## How ${n} Works\n\n`;
    md += `**Keywords:** ${seoTerms(d,'how_it_works')}\n\n`;
    if(hw.time)     md += `**Treatment Time:** ${hw.time}  \n`;
    if(hw.downtime) md += `**Downtime:** ${hw.downtime}  \n`;
    if(hw.onset)    md += `**Results Onset:** ${hw.onset}  \n`;
    if(hw.duration) md += `**Duration:** ${hw.duration}  \n`;
    md += `**Location:** ${hw.location || 'We come to you'}\n\n`;
    md += `${hw.body}\n\n`;
  }

  // --- Treatment Menu / Sections ---
  if(d.sections && d.sections.length){
    md += `## ${d.menu_headline || 'Treatment Areas'}\n\n`;
    md += `**Keywords:** ${seoTerms(d,'menu')}\n\n`;
    d.sections.forEach(s=>{
      md += `### ${s.title}\n${s.body}\n\n`;
    });
  }

  // --- Steps section ---
  if(d.steps_content && d.steps_content.length){
    md += `## How to Get Started\n\n`;
    md += `**Keywords:** ${seoTerms(d,'steps')}\n\n`;
    d.steps_content.forEach(s=>{
      md += `**Step ${s.n}: ${s.title}**  \n${s.body}\n\n`;
    });
  }

  // --- Testimonial ---
  if(d.testimonial && d.testimonial.quote){
    md += `## Patient Review\n\n`;
    md += `**Keywords:** ${seoTerms(d,'testimonial')}\n\n`;
    const attr = d.testimonial.author || d.testimonial.name;
    const city = d.testimonial.city ? `, ${d.testimonial.city}` : '';
    md += `> "${d.testimonial.quote}"\n>\n> — ${attr}${city}\n\n`;
  }

  // --- FAQ section ---
  if(d.faq && d.faq.length){
    md += `## Frequently Asked Questions\n\n`;
    md += `**Keywords:** ${seoTerms(d,'faq')}\n\n`;
    d.faq.forEach(f=>{
      md += `**Q: ${f.q}**  \nA: ${f.a}\n\n`;
    });
  }

  // --- Provider section ---
  md += `## About the Provider\n\n`;
  md += `**Keywords:** ${seoTerms(d,'provider')}\n\n`;
  md += `[PROVIDER NAME], [CREDENTIALS] is a Board Certified Family Nurse Practitioner with 6+ years of healthcare experience. She holds a Master of Science from South University and is an AANP member. [PROVIDER NAME] personally delivers every treatment. She lives in [CITY] and serves all of [COUNTY], FL.\n\n`;
  if(d.byline) md += `*${d.byline}*\n\n`;

  // --- Footer ---
  md += `---\n\n`;
  md += `**Book a free consultation:** [[PHONE]](tel:+1[PHONE]) | [Book Online](${url.replace('services/'+slug+'.html','book-now.html')})  \n`;
  md += `**Service area:** [CITY], [CITY], [CITY], [CITY], [CITY], and all of [COUNTY], FL.  \n`;
  md += `**Website:** ${url}  \n\n`;
  md += `*This markdown mirror is auto-generated for AI readability. To add or edit SEO terms for any section, update the \`seo\` key in \`data/services/${slug}.json\`.*\n`;

  const outPath = path.join(ROOT,'services',slug+'.md');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log('Built MD:', outPath, '('+(md.length/1024).toFixed(1)+'KB)');
  return true;
}

// ---- Page builder ----------------------------------------------------------

function buildPage(slug){
  const dataPath   = path.join(ROOT,'data/services',slug+'.json');
  const wizardPath = path.join(ROOT,'data/wizard',slug+'.json');

  if(!fs.existsSync(dataPath)){
    console.error('MISSING data file:', dataPath);
    return false;
  }

  const d  = JSON.parse(fs.readFileSync(dataPath,'utf8'));
  const wz = fs.existsSync(wizardPath)
    ? fs.readFileSync(wizardPath,'utf8')
    : JSON.stringify({slug,serviceLabel:d.name,steps:[]});

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script>window.Mangomint = window.Mangomint || {}; window.Mangomint.CompanyId = 770971;</script>
  <script src="https://booking.mangomint.com/app.js" async></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(d.meta_title||d.name+' | [COMPANY NAME]')}</title>
  <meta name="description" content="${esc(d.meta_description||d.hero_value_prop||'')}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${esc(d.canonical||'https://www.[DOMAIN]/services/'+slug+'.html')}">
  <meta property="og:title" content="${esc(d.meta_title||d.name)}">
  <meta property="og:description" content="${esc(d.meta_description||'')}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(d.canonical||'')}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../css/styles.css?v=28">
  <link rel="stylesheet" href="../assets/css/service.css?v=23">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <!-- Markdown mirror discovery -->
  <link rel="alternate" type="text/markdown" href="/services/${slug}.md">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${esc(d.meta_title||d.name)}",
    "url": "${esc(d.canonical||'https://www.[DOMAIN]/services/'+slug+'.html')}",
    "description": "${esc(d.meta_description||d.hero_value_prop||'')}",
    "sameAs": "https://www.[DOMAIN]/services/${slug}.md",
    "encodingFormat": "text/html",
    "isAccessibleForFree": true,
    "provider": {
      "@type": "Person",
      "name": "[PROVIDER NAME], [CREDENTIALS]",
      "jobTitle": "Board Certified Family Nurse Practitioner"
    }
  }
  </script>
</head>
<body class="service-page" x-data="wizardData('${slug}')" data-wizard-root x-cloak>

${WIZARD}

${NAV}

${breadcrumb(d.name)}

${hero(d, wz)}

${valuePropSection(d)}

${aboutSection(d)}

${howItWorks(d)}

${menuSection(d)}

${gallery(d)}

${steps(d)}

${testimonial(d)}

${serviceArea(d)}

${credentialStrip(d)}

${faqSection(d.faq)}

${relatedServices(d)}

${FOOTER}

<script src="../wizard/modules.js"></script>
<script>
const PAGE_WIZARD = ${wz};
</script>
<script src="../wizard/engine.js"></script>
<script>
// FAQ accordion
document.querySelectorAll('.faq-question').forEach(function(q){
  q.addEventListener('click', function(){
    q.closest('.faq-item').classList.toggle('open');
  });
});
// Promo bar close
var promoClose = document.querySelector('.promo-close');
var promoBar = document.querySelector('.promo-bar');
if(promoClose && promoBar){
  promoClose.addEventListener('click', function(){ promoBar.style.display='none'; });
}
</script>

</body>
</html>`;

  const outPath = path.join(ROOT,'services',slug+'.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Built:', outPath, '('+(html.length/1024).toFixed(1)+'KB)');

  // Generate markdown mirror
  buildMarkdown(slug, d);

  return true;
}

// ---- Audit -----------------------------------------------------------------

/**
 * Sections tracked per service page.
 */
const TRACKED_SECTIONS = ['hero','about','how_it_works','menu','steps','testimonial','faq','provider'];

function audit(){
  const slugs = MANIFEST.pages.map(p=>p.slug);
  const today = new Date().toISOString().slice(0,10);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[COMPANY] Markdown Mirror Audit — ${today}`);
  console.log(`${'='.repeat(60)}\n`);

  let needsCustom = [];
  let missingMd   = [];

  slugs.forEach(slug=>{
    const dataPath = path.join(ROOT,'data/services',slug+'.json');
    const mdPath   = path.join(ROOT,'services',slug+'.md');
    if(!fs.existsSync(dataPath)) return;

    const d       = JSON.parse(fs.readFileSync(dataPath,'utf8'));
    const mdExists = fs.existsSync(mdPath);
    const seo     = d.seo || {};

    // staleness: compare mtime of data json vs md file
    let stale = false;
    if(mdExists){
      const dataMtime = fs.statSync(dataPath).mtimeMs;
      const mdMtime   = fs.statSync(mdPath).mtimeMs;
      stale = dataMtime > mdMtime;
    }

    // count custom SEO sections
    const customSections = TRACKED_SECTIONS.filter(s=> seo[s] && seo[s].length > 0);
    const totalTerms     = TRACKED_SECTIONS.reduce((sum,s)=> sum + (seo[s]?seo[s].length:0), 0);

    const statusIcon = !mdExists ? '❌' : stale ? '⚠️ ' : '✅';
    const seoIcon    = customSections.length === 0 ? ' [⚠️  no custom SEO yet]'
                     : customSections.length < 3   ? ' [⚠️  partial custom SEO]'
                     : '';

    console.log(`${statusIcon} ${slug.padEnd(36)} custom: ${String(customSections.length).padStart(1)}/${TRACKED_SECTIONS.length} sections, ${String(totalTerms).padStart(3)} terms${seoIcon}`);

    if(!mdExists) missingMd.push(slug);
    if(customSections.length === 0) needsCustom.push(slug);
  });

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Service pages: ${slugs.length} total`);

  if(missingMd.length){
    console.log(`\n❌ Missing .md files (run node build.js to fix):`);
    missingMd.forEach(s=> console.log(`   ${s}`));
  }

  if(needsCustom.length){
    console.log(`\n⚠️  Pages with no custom SEO terms yet (${needsCustom.length}/${slugs.length}):`);
    needsCustom.forEach(s=> console.log(`   ${s}`));
    console.log(`\n   → Add custom terms in data/services/<slug>.json under "seo": {}`);
    console.log(`   → Each section key maps to an array of keyword strings`);
    console.log(`   → build.js ONLY READS this key — it never overwrites it`);
  }

  // Check for any service pages with sections having thin auto SEO (< 3 terms)
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`\nSEO schema reminder:`);
  console.log(`  data/services/<slug>.json → "seo": {`);
  TRACKED_SECTIONS.forEach(s=>{
    console.log(`    "${s}": ["term 1", "term 2"]   // appended to auto-generated terms`);
  });
  console.log(`  }`);
  console.log(`\nCustom terms are NEVER deleted by build.js — they only accumulate.`);
  console.log(`\nFor static pages (.md mirrors of index, about, contact, faqs, pricing...):`);
  console.log(`  Run: node mirrors.js`);
  console.log(`  Custom SEO: data/static-seo.json (append-only, never auto-written)`);
  console.log(`\n${'='.repeat(60)}\n`);
}

// ---- Main ------------------------------------------------------------------

const target = process.argv[2];
if(target === '--audit'){
  audit();
} else if(target){
  buildPage(target);
  require('./build-sitemap')();
} else {
  const slugs = MANIFEST.pages.map(p=>p.slug);
  let ok=0, fail=0;
  slugs.forEach(s=>{ buildPage(s) ? ok++ : fail++; });
  console.log(`\nDone: ${ok} built, ${fail} missing data files`);
  require('./build-sitemap')();
}
