#!/usr/bin/env node
/**
 * [COMPANY] Static Page Mirror Generator
 * Generates .md markdown mirrors for all static (non-service) pages.
 *
 * Usage:
 *   node mirrors.js           — build all static mirrors
 *   node mirrors.js <slug>    — build one (e.g. node mirrors.js about)
 *   node mirrors.js --audit   — check which .md files exist and SEO coverage
 *
 * Custom SEO terms: data/static-seo.json
 *   — Add terms to any section key. This file is NEVER auto-written.
 *   — Terms are merged with auto-generated terms on every run.
 *   — Terms only accumulate; they are never deleted.
 *
 * Service page mirrors: use build.js (generates alongside HTML automatically).
 */

'use strict';
const fs   = require('fs');
const path = require('path');
const ROOT = __dirname;

const SEO_FILE = path.join(ROOT, 'data/static-seo.json');
const CUSTOM   = fs.existsSync(SEO_FILE) ? JSON.parse(fs.readFileSync(SEO_FILE, 'utf8')) : {};
const TODAY    = new Date().toISOString().slice(0, 10);

// ---- Helpers ----------------------------------------------------------------

function mergeSeo(auto, pageSlug, section) {
  const custom = (CUSTOM[pageSlug] && CUSTOM[pageSlug][section]) || [];
  return [...new Set([...auto, ...custom])].join(', ');
}

function fm(title, desc, url) {
  return `---\ntitle: ${title}\ndescription: ${desc}\nurl: ${url}\nprovider: [PROVIDER NAME], [CREDENTIALS]\ngenerated: ${TODAY}\n---\n\n`;
}

const SITE   = 'https://www.[DOMAIN]';
const PHONE  = '[PHONE]';
const FOOTER = `\n---\n\n**Book a free consultation:** [${PHONE}](tel:+1[PHONE]) | [Book Online](${SITE}/book-now.html)  \n**Service area:** [CITY], [CITY], [CITY], [CITY], [CITY], and all of [COUNTY], FL.  \n**Website:** ${SITE}  \n\n*This markdown mirror is auto-generated for AI readability. Custom SEO terms live in \`data/static-seo.json\`.*\n`;

// ---- Page definitions -------------------------------------------------------
// Each PAGE_DEF is a function(customSeo) => markdown string.
// Content is defined here (not parsed from HTML) for reliability.
// Update this file when you significantly change a static page's content.

const PAGE_DEFS = {

  // ------ index.html -------------------------------------------------------
  index: {
    output: 'index.md',
    build() {
      const slug = 'index';
      let md = fm(
        'Concierge Healthcare in [CITY], FL | We Come To You | [COMPANY NAME]',
        'Concierge healthcare delivered to your home. [SERVICE NAME], [service category], [SERVICE NAME], [service category], [SERVICE NAME], and more. Serving [CITY] and all of [COUNTY], FL.',
        `${SITE}/`
      );
      md += `# [COMPANY NAME] — We Come To You\n\n`;
      md += `> Concierge healthcare delivered to your home or office in [CITY] and [COUNTY], FL. One provider. No waiting rooms. We come to you.\n\n`;
      md += `**Phone:** ${PHONE} | **Text:** ${PHONE} | **Email:** [EMAIL] | **Hours:** 7 days, 8am–8pm\n\n---\n\n`;

      md += `## Hero\n\n**Keywords:** ${mergeSeo(['concierge healthcare wellington fl','we come to you healthcare palm beach county','in-home healthcare wellington florida','mobile healthcare palm beach county fl','beyond concierge healthcare wellington','home visit nurse practitioner florida'], slug, 'hero')}\n\n`;
      md += `Concierge Healthcare. We Come to You. Free [SERVICE NAME] Meet & Greet with [PROVIDER NAME] — no commitment, no waiting room.\n\n`;
      md += `- 100+ five-star reviews\n- 90-minute average response\n- One-on-one care — no assembly line\n- Same-day appointments frequently available\n\n`;

      md += `## [SERVICES]\n\n**Keywords:** ${mergeSeo(['concierge healthcare services wellington fl','in-home medical services palm beach county','mobile healthcare services florida','nurse practitioner services wellington'], slug, 'services')}\n\n`;
      md += `All services delivered to your home, office, or via [SERVICE NAME]:\n\n`;
      md += `| Service | Starting Price | Details |\n|---|---|---|\n`;
      md += `| In-Home [SERVICE CATEGORY] | $100+ | [/services/in-home-primary-care.md](${SITE}/services/in-home-primary-care.md) |\n`;
      md += `| [SERVICE CATEGORY] at Home | $100+ | [/services/urgent-care.md](${SITE}/services/urgent-care.md) |\n`;
      md += `| [SERVICE NAME] | $60+ | [/services/[SERVICE NAME].md](${SITE}/services/[SERVICE NAME].md) |\n`;
      md += `| [service name] | $100+ | [/services/iv-therapy.md](${SITE}/services/iv-therapy.md) |\n`;
      md += `| [SERVICE NAME] & [SERVICE NAME] | — | [/services/botox.md](${SITE}/services/botox.md) |\n`;
      md += `| [SERVICE NAME] | — | [/services/dermal-fillers.md](${SITE}/services/dermal-fillers.md) |\n`;
      md += `| [SERVICE NAME] | — | [/services/[SERVICE NAME].md](${SITE}/services/[SERVICE NAME].md) |\n`;
      md += `| [SERVICE NAME] Vampire Facial | — | [/services/prp-facial.md](${SITE}/services/prp-facial.md) |\n`;
      md += `| [SERVICE NAME] Restoration | $300+ | [/services/prp-hair.md](${SITE}/services/prp-hair.md) |\n`;
      md += `| [SERVICE CATEGORY] | $300+ | [/services/weight-loss.md](${SITE}/services/weight-loss.md) |\n`;
      md += `| [SERVICE NAME] Therapy | — | [/services/peptides.md](${SITE}/services/peptides.md) |\n`;
      md += `| [SERVICE NAME] | — | [/services/hormone-replacement-therapy.md](${SITE}/services/hormone-replacement-therapy.md) |\n`;
      md += `| [SERVICE NAME] | — | [/services/[SERVICE NAME].md](${SITE}/services/[SERVICE NAME].md) |\n`;
      md += `| [SERVICE NAME] | — | [/services/[SERVICE NAME]-injections.md](${SITE}/services/[SERVICE NAME]-injections.md) |\n`;
      md += `| [SERVICE NAME] Care | — | [/services/[SERVICE NAME].md](${SITE}/services/[SERVICE NAME].md) |\n`;
      md += `| [SERVICE CATEGORY] | — | [/services/skilled-nursing.md](${SITE}/services/skilled-nursing.md) |\n`;
      md += `| [SERVICE CATEGORY] | — | [/services/wellness.md](${SITE}/services/wellness.md) |\n`;
      md += `| [SERVICE NAME] | $149–$549/mo | [/services/[SERVICE NAME].md](${SITE}/services/[SERVICE NAME].md) |\n\n`;

      md += `## How It Works\n\n**Keywords:** ${mergeSeo(['how beyond concierge healthcare works','book concierge healthcare wellington fl','in-home healthcare process florida','schedule nurse practitioner palm beach county'], slug, 'how_it_works')}\n\n`;
      md += `**Step 1: Book Your Free Meet & Greet** — Schedule a free [SERVICE NAME] session with [PROVIDER NAME]. No commitment.\n\n`;
      md += `**Step 2: Receive Your Custom Plan** — [PROVIDER NAME] evaluates, listens, and builds a plan around your life.\n\n`;
      md += `**Step 3: Care Comes to You** — At-home, in-office, or [SERVICE NAME]. Same provider every time.\n\n`;

      md += `## Patient [REVIEWS]\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare reviews wellington fl','gabrielle radabaugh reviews palm beach county','concierge healthcare testimonials florida'], slug, 'reviews')}\n\n`;
      md += `> "[PROVIDER NAME] is an excellent provider and talented healer. I called her when I got sick and she came to my house to help." — Niki C.\n\n`;
      md += `> "[PROVIDER NAME] has been giving me IVs for 3 years anytime I'm feeling sick or need a pick me up. She is consistent, punctual and trustworthy." — Paulina Canini\n\n`;
      md += `> "I could not be happier with the service and genuine care I have been given. It's rare to find someone that truly cares for you." — Michele Badgley\n\n`;

      md += `## [PRICING] Summary\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare pricing wellington fl','concierge healthcare cost palm beach county','nurse practitioner pricing florida'], slug, 'pricing')}\n\n`;
      md += `In-Home [SERVICE CATEGORY] $100+ | [SERVICE NAME] $60+ | [SERVICE CATEGORY] $300+ | [SERVICE CATEGORY] $100+ | [SERVICE NAME] $149–$549/mo | Cosmetics $100+\n\nInsurance not accepted (some lab exceptions). Cash, Visa, Mastercard, Amex, Discover. [NAVIGATION ITEM] available.\n\n`;

      md += `## About the Provider\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh arnp fnp-c wellington fl','nurse practitioner palm beach county florida','board certified family nurse practitioner','beyond concierge healthcare owner'], slug, 'provider')}\n\n`;
      md += `[PROVIDER NAME], [CREDENTIALS] — Board Certified Family Nurse Practitioner, 6+ years experience, Master of Science (South University), AANP member. Lives in [CITY]. Personally delivers every service across all of [COUNTY].\n\n`;

      md += `## Contact\n\n**Keywords:** ${mergeSeo(['book beyond concierge healthcare wellington fl','contact gabrielle radabaugh','schedule in-home visit palm beach county','free [SERVICE NAME] consultation florida'], slug, 'contact')}\n\n`;
      md += `**Phone/Text:** ${PHONE} | **Email:** [EMAIL]  \n**Address:** [ADDRESS], Unit G, [CITY, STATE ZIP] (appointment required)  \n**Book Online:** ${SITE}/book-now.html\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ about/index.html -------------------------------------------------
  about: {
    output: 'about/index.md',
    outputAlso: 'about.md',  // flat alias so /about.md works too
    build() {
      const slug = 'about';
      let md = fm(
        'About [PROVIDER NAME], [CREDENTIALS] | [COMPANY NAME]',
        'Meet [PROVIDER NAME], [CREDENTIALS] — Board Certified Family Nurse Practitioner serving [CITY] and [COUNTY], FL. Concierge healthcare delivered to your home.',
        `${SITE}/about/`
      );
      md += `# About [PROVIDER NAME], [CREDENTIALS]\n\n`;
      md += `> Meet the provider behind [COMPANY NAME]. [PROVIDER NAME] personally delivers every treatment — no staff substitutions, no assembly line.\n\n---\n\n`;

      md += `## Hero\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh arnp fnp-c wellington fl','about beyond concierge healthcare','nurse practitioner biography palm beach county','concierge np loxahatchee fl'], slug, 'hero')}\n\n`;
      md += `About [PROVIDER NAME], [CREDENTIALS] — certified Nurse Practitioner with over six years of healthcare experience serving all of [COUNTY].\n\n`;

      md += `## Bio\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh nurse practitioner background','fnp-c palm beach county florida','concierge healthcare provider biography','nurse practitioner loxahatchee fl'], slug, 'bio')}\n\n`;
      md += `My name is [PROVIDER NAME], a certified Nurse Practitioner with over six years of experience in healthcare. I live in [CITY] and service all of [COUNTY], FL. I am dedicated to providing comprehensive, patient-centered care. I specialize in family medicine, aesthetic procedures, weight loss, and [service name].\n\n`;
      md += `I founded [COMPANY NAME] because I believe healthcare should fit your life — not the other way around. No waiting rooms, no rushed 10-minute appointments, no assembly-line medicine. Just you and me, focused entirely on your health and goals.\n\n`;
      md += `- Goal: make each patient feel loved and cared for\n- 5-star customer service\n- One-on-one care — every appointment\n- I come to you — saving you time and making healthcare more enjoyable\n\n`;

      md += `## Credentials\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh credentials','arnp fnp-c florida license','board certified nurse practitioner wellington','aanp member palm beach county','master of science nurse practitioner'], slug, 'credentials')}\n\n`;
      md += `- **Degree:** Master of Science, South University\n- **Certification:** Board Certified Family Nurse Practitioner ([CREDENTIALS])\n- **License:** [STATE] Licensed [CREDENTIALS]\n- **[SERVICE NAME]:** AANP (American Association of Nurse Practitioners)\n- **Experience:** 6+ years in healthcare\n- **Specializations:** Family medicine, aesthetics, weight loss, [service name]\n- **HIPAA Compliant Practice**\n\n`;

      md += `## Patient [REVIEWS]\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh reviews','beyond concierge healthcare testimonials palm beach','nurse practitioner reviews wellington fl'], slug, 'reviews')}\n\n`;
      md += `> "[PROVIDER NAME] is an excellent provider and talented healer." — Niki C.\n\n`;
      md += `> "I could not be happier with the service and genuine care I have been given." — Michele Badgley\n\n`;
      md += `> "[PROVIDER NAME] is a God send! My elderly mother... [PROVIDER NAME] was over the next morning giving her IV infusions, caring for her and was very kind and patient." — Ryan DePotter\n\n`;

      md += `## Contact\n\n**Keywords:** ${mergeSeo(['contact gabrielle radabaugh wellington fl','book nurse practitioner palm beach county','schedule consultation beyond concierge healthcare'], slug, 'contact')}\n\n`;
      md += `**Phone/Text:** ${PHONE} | **Email:** [EMAIL] | **Book:** ${SITE}/book-now.html\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ contact.html -----------------------------------------------------
  contact: {
    output: 'contact.md',
    build() {
      const slug = 'contact';
      let md = fm(
        'Contact [COMPANY NAME] | [CITY], FL',
        'Contact [PROVIDER NAME], [CREDENTIALS] at [COMPANY NAME]. Call, text, or book online. Serving [CITY] and all of [COUNTY], FL.',
        `${SITE}/contact.html`
      );
      md += `# Contact [COMPANY NAME]\n\n`;
      md += `> Reach [PROVIDER NAME] directly. Response within 90 minutes on average.\n\n---\n\n`;

      md += `## Contact Information\n\n**Keywords:** ${mergeSeo(['contact beyond concierge healthcare wellington fl','call nurse practitioner palm beach county','book in-home healthcare florida','gabrielle radabaugh contact information'], slug, 'form')}\n\n`;
      md += `**Phone:** ${PHONE}  \n**Text:** ${PHONE}  \n**Email:** [EMAIL]  \n**Book Online:** ${SITE}/book-now.html  \n\n`;
      md += `**Office Address:** [ADDRESS], Unit G, [CITY, STATE ZIP] *(appointment required — not a walk-in location)*  \n**Hours:** 7 days a week, 8am–8pm  \n**Response time:** 90-minute average  \n\n`;

      md += `## [LOCATION PAGE]\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare service area','in-home healthcare wellington loxahatchee','mobile nurse practitioner royal palm beach fl','concierge healthcare westlake jupiter fl'], slug, 'location')}\n\n`;
      md += `[CITY] · [CITY] · [CITY] · [CITY] · [CITY] · and all of [COUNTY], FL  \n[Service available statewide across [STATE]].\n\n`;

      md += `## Cancellation Policy\n\nValid credit card required at booking. Less than 24hr notice: $25 charge. No-show without notice: $50 charge.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ faqs.html --------------------------------------------------------
  faqs: {
    output: 'faqs.md',
    build() {
      const slug = 'faqs';
      let md = fm(
        '[FAQ] | Concierge Healthcare [CITY], FL | [COMPANY NAME]',
        'Frequently asked questions about [COMPANY NAME]. Learn about in-home visits, services, pricing, appointments, and how concierge healthcare works in [CITY] and [COUNTY], FL.',
        `${SITE}/faqs.html`
      );
      md += `# Frequently Asked Questions — [COMPANY NAME]\n\n---\n\n`;

      md += `## About the Practice\n\n**Keywords:** ${mergeSeo(['what is beyond concierge healthcare','concierge healthcare faq wellington fl','how does in-home healthcare work florida','nurse practitioner house calls palm beach county'], slug, 'general')}\n\n`;
      md += `**Q: What is [COMPANY NAME]?**  \nA: [COMPANY NAME] ([COMPANY]) is a mobile concierge medical practice owned and operated by [PROVIDER NAME], [CREDENTIALS]. We deliver [SERVICE NAME], [service category], aesthetics, weight loss, [SERVICE NAME] care, and more directly to patients across [CITY] and [COUNTY], FL.\n\n`;
      md += `**Q: Do you take insurance?**  \nA: [COMPANY] does not currently accept insurance, with the exception of some lab work. All fees are paid directly by patients. See /pricing.md for rates.\n\n`;
      md += `**Q: Who performs the services?**  \nA: [PROVIDER NAME] personally delivers every service. There are no substitute providers.\n\n`;
      md += `**Q: What areas do you serve?**  \nA: [CITY], [CITY], [CITY], [CITY], [CITY], and all of [COUNTY]. [SERVICE NAME] available statewide in [STATE].\n\n`;

      md += `## [SERVICES]\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare services faq','what services does bch offer','in-home iv therapy faq wellington','mobile botox faq palm beach county'], slug, 'services')}\n\n`;
      md += `**Q: What services do you offer?**  \nA: [SERVICE NAME], urgent care, [SERVICE NAME], [service name], [SERVICE NAME] & [SERVICE NAME], [SERVICE NAME], [SERVICE NAME], [SERVICE NAME] facial/hair, [service category] ([SERVICE NAME]/[SERVICE NAME]), [service name], [SERVICE NAME], [SERVICE NAME], [SERVICE NAME], [SERVICE NAME] care, [service category], wellness services, and [SERVICE NAME].\n\n`;
      md += `**Q: Do you offer same-day appointments?**  \nA: Yes. Same-day appointments are frequently available. Average response time is 90 minutes.\n\n`;

      md += `## [PRICING] & Payment\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare pricing faq','how much does in-home healthcare cost wellington','concierge healthcare [NAVIGATION ITEM] florida','nurse practitioner visit cost palm beach'], slug, 'pricing')}\n\n`;
      md += `**Q: How much do services cost?**  \nA: Starting prices: In-Home [SERVICE CATEGORY] $100+, [SERVICE NAME] $60+, [SERVICE CATEGORY] $300+, [SERVICE CATEGORY] $100+, Cosmetics $100+. See /pricing.md for the full schedule.\n\n`;
      md += `**Q: What payment methods do you accept?**  \nA: Cash, Visa, Mastercard, American Express, Discover. [NAVIGATION ITEM] available.\n\n`;
      md += `**Q: What is the [SERVICE NAME] discount?**  \nA: [SERVICE CATEGORY] members save 25% on all other [COMPANY] services. [SERVICE NAME] plans: Basic $149/mo, Plus $349/mo, Elite $549/mo.\n\n`;

      md += `## Appointments\n\n**Keywords:** ${mergeSeo(['how to book beyond concierge healthcare','cancel reschedule appointment wellington fl','concierge healthcare booking process','new patient beyond concierge healthcare'], slug, 'appointments')}\n\n`;
      md += `**Q: How do I book?**  \nA: Call or text ${PHONE}, email [EMAIL], or book online at ${SITE}/book-now.html. New patients get a free [SERVICE NAME] meet & greet.\n\n`;
      md += `**Q: What is the cancellation policy?**  \nA: Valid credit card required at booking. Less than 24hr cancellation/reschedule: $25 charge. No-show: $50 charge.\n\n`;
      md += `**Q: Is the first consultation really free?**  \nA: Yes. New patients receive a free [SERVICE NAME] meet & greet valued at $100.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ pricing.html -----------------------------------------------------
  pricing: {
    output: 'pricing.md',
    build() {
      const slug = 'pricing';
      let md = fm(
        '[PRICING] | Concierge Healthcare [CITY], FL | [COMPANY NAME]',
        'Transparent pricing for concierge healthcare in [CITY] and [COUNTY]. [SERVICE NAME], [service category], [service category], aesthetics, and [SERVICE NAME] plans.',
        `${SITE}/pricing.html`
      );
      md += `# [COMPANY NAME] — [PRICING]\n\n---\n\n`;

      md += `## Service [PRICING]\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare pricing wellington fl','in-home healthcare cost palm beach county','nurse practitioner visit price florida','concierge healthcare fees wellington'], slug, 'table')}\n\n`;
      md += `| Service | Starting Price |\n|---|---|\n`;
      md += `| In-Home [SERVICE CATEGORY] | $100+ |\n`;
      md += `| [SERVICE NAME] Visit | $60+ |\n`;
      md += `| [SERVICE CATEGORY] Program | $300+ |\n`;
      md += `| [service name] (per session) | $100+ |\n`;
      md += `| [SERVICE NAME] Restoration | $300+ |\n`;
      md += `| Cosmetic Procedures (general) | $100+ |\n\n`;
      md += `Insurance not accepted (some lab exceptions). Payment: Cash, Visa, Mastercard, Amex, Discover. [NAVIGATION ITEM] available.\n\n`;

      md += `## [SERVICE CATEGORY] [SERVICE NAME] Plans\n\n**Keywords:** ${mergeSeo(['iv therapy [SERVICE NAME] wellington fl','beyond concierge [SERVICE NAME] plans palm beach','monthly iv therapy [SERVICE NAME] florida','25% off healthcare [SERVICE NAME]'], slug, '[SERVICE NAME]')}\n\n`;
      md += `| Plan | Monthly Price | IV Sessions | [NAVIGATION ITEM] |\n|---|---|---|---|\n`;
      md += `| Basic | $149/mo | 1 IV/mo | 25% off all other services |\n`;
      md += `| Plus | $349/mo | 3 IVs/mo | 25% off all other services |\n`;
      md += `| Elite | $549/mo | 5 IVs/mo | 25% off all other services |\n\n`;
      md += `All [SERVICE NAME] plans include 25% off all other [COMPANY] services. No contracts. Cancel anytime.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ gabby/index.html -------------------------------------------------
  gabby: {
    output: 'gabby/index.md',
    outputAlso: 'gabby.md',  // flat alias so /gabby.md works too
    build() {
      const slug = 'gabby';
      let md = fm(
        'Meet [PROVIDER NAME] | [PROVIDER NAME], [CREDENTIALS] | [COMPANY NAME]',
        'Get to know [PROVIDER NAME], [CREDENTIALS] — the owner and sole provider of [COMPANY NAME] in [CITY], FL.',
        `${SITE}/gabby/`
      );
      md += `# Meet [PROVIDER NAME] — [PROVIDER NAME], [CREDENTIALS]\n\n`;
      md += `> The person behind [COMPANY NAME]. Every appointment, every service, personally delivered by [PROVIDER NAME].\n\n---\n\n`;

      md += `## Hero\n\n**Keywords:** ${mergeSeo(['meet gabrielle radabaugh np wellington fl','gabby radabaugh nurse practitioner palm beach','beyond concierge healthcare provider background','nurse practitioner loxahatchee florida'], slug, 'hero')}\n\n`;
      md += `[PROVIDER NAME], [CREDENTIALS] — certified Nurse Practitioner, 6+ years experience, serving all of [COUNTY] from her home base in [CITY], FL.\n\n`;

      md += `## Bio\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh biography','fnp-c wellington fl background','concierge np personal story florida','nurse practitioner family medicine palm beach'], slug, 'bio')}\n\n`;
      md += `[PROVIDER NAME] is a certified Nurse Practitioner with over six years of experience. She holds a Master of Science from South University and is board certified as a Family Nurse Practitioner ([CREDENTIALS]). She lives in [CITY] and personally services all of [COUNTY]. Her interests include family, horseback riding, and providing truly personal healthcare.\n\n`;

      md += `## Credentials\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh arnp license florida','fnp-c board certification','aanp [SERVICE NAME] nurse practitioner','master of science south university fnp'], slug, 'credentials')}\n\n`;
      md += `- Master of Science — South University\n- Board Certified [CREDENTIALS]\n- [STATE] Licensed [CREDENTIALS]\n- AANP Member\n- 6+ years healthcare experience\n- Specializations: family medicine, aesthetics, weight loss, [service name]\n\n`;

      md += `## Experience\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh professional experience','nurse practitioner work history florida','beyond concierge healthcare founded','concierge healthcare palm beach county history'], slug, 'experience')}\n\n`;
      md += `[PROVIDER NAME] has worked across multiple healthcare settings throughout [COUNTY] before founding [COMPANY NAME]. Her philosophy: every patient deserves unhurried, personalized care — delivered where they are most comfortable.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ savings.html -----------------------------------------------------
  savings: {
    output: 'savings.md',
    build() {
      const slug = 'savings';
      let md = fm(
        'Save on Concierge Healthcare | [SERVICE NAME] Plans | [COMPANY NAME]',
        'Save up to 25% on all [COMPANY] services with an [SERVICE CATEGORY] [SERVICE NAME]. Basic, Plus, and Elite monthly plans. [CITY] and [COUNTY], FL.',
        `${SITE}/savings.html`
      );
      md += `# Save on Concierge Healthcare — [SERVICE NAME] Plans\n\n---\n\n`;

      md += `## Save with [SERVICE NAME]\n\n**Keywords:** ${mergeSeo(['save on healthcare wellington fl','beyond concierge healthcare [SERVICE NAME] discount','iv therapy [SERVICE NAME] 25% off palm beach','monthly healthcare plan florida'], slug, '[SERVICE NAME]')}\n\n`;
      md += `Join an [SERVICE CATEGORY] [SERVICE NAME] plan and save 25% on all other [COMPANY] services. No contracts. Cancel anytime.\n\n`;
      md += `| Plan | Price | Sessions | Discount |\n|---|---|---|---|\n`;
      md += `| Basic | $149/mo | 1 IV/mo | 25% off everything |\n`;
      md += `| Plus | $349/mo | 3 IVs/mo | 25% off everything |\n`;
      md += `| Elite | $549/mo | 5 IVs/mo | 25% off everything |\n\n`;

      md += `## Free New Patient Offer\n\n**Keywords:** ${mergeSeo(['free [SERVICE NAME] consultation wellington fl','new patient beyond concierge healthcare','free meet and greet nurse practitioner palm beach','first visit free concierge healthcare florida'], slug, 'hero')}\n\n`;
      md += `New patients receive a free [SERVICE NAME] Meet & Greet with [PROVIDER NAME] — valued at $100. No commitment required.\n\nBook: ${SITE}/book-now.html\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ locations/wellington-fl.html -------------------------------------
  'locations-wellington': {
    output: 'locations/wellington-fl.md',
    build() {
      const slug = 'locations-wellington';
      let md = fm(
        'Concierge Healthcare in [CITY], FL | [COMPANY NAME]',
        'Concierge healthcare delivered to your home in [CITY], FL. [SERVICE NAME], [service category], [SERVICE NAME], weight loss, and more from [PROVIDER NAME], [CREDENTIALS].',
        `${SITE}/locations/wellington-fl.html`
      );
      md += `# Concierge Healthcare in [CITY], FL\n\n`;
      md += `> [COMPANY NAME] delivers in-home and [SERVICE NAME] services throughout [CITY], FL and surrounding [COUNTY] communities.\n\n---\n\n`;

      md += `## [SERVICES] in [CITY], FL\n\n**Keywords:** ${mergeSeo(['concierge healthcare wellington florida','[SERVICE NAME] wellington fl','[SERVICE NAME] therapy wellington fl','botox wellington florida','[service category] wellington fl','nurse practitioner wellington fl','home healthcare wellington palm beach'], slug, 'services')}\n\n`;
      md += `All [COMPANY] services are available throughout [CITY], FL. [PROVIDER NAME] comes directly to your home, office, or preferred location:\n\n`;
      md += `In-Home [SERVICE CATEGORY] · [SERVICE CATEGORY] · [SERVICE NAME] · [service name] · [SERVICE NAME] & [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME]/Hair · [SERVICE CATEGORY] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] Care · [SERVICE CATEGORY] · [SERVICE CATEGORY]\n\n`;

      md += `## About [CITY], FL [LOCATION PAGE]\n\n**Keywords:** ${mergeSeo(['wellington fl healthcare provider','wellington florida nurse practitioner','beyond concierge healthcare wellington service area','wellington palm beach county medical care'], slug, 'area')}\n\n`;
      md += `[CITY] is [COMPANY]'s primary service area. [PROVIDER NAME] serves all [CITY] communities including [COUNTY] Point, the equestrian areas, and all surrounding neighborhoods. Same-day appointments frequently available.\n\n`;
      md += `**Address:** [ADDRESS], Unit G, [CITY, STATE ZIP] | **Phone:** ${PHONE}\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ locations/loxahatchee-fl.html ------------------------------------
  'locations-loxahatchee': {
    output: 'locations/loxahatchee-fl.md',
    build() {
      const slug = 'locations-loxahatchee';
      let md = fm(
        'Concierge Healthcare in [CITY], FL | [COMPANY NAME]',
        'In-home concierge healthcare in [CITY], FL. [PROVIDER NAME], [CREDENTIALS] lives locally and delivers all [COMPANY] services to your home.',
        `${SITE}/locations/loxahatchee-fl.html`
      );
      md += `# Concierge Healthcare in [CITY], FL\n\n---\n\n`;

      md += `## [SERVICES] in [CITY], FL\n\n**Keywords:** ${mergeSeo(['concierge healthcare loxahatchee florida','in-home nurse practitioner loxahatchee fl','mobile healthcare loxahatchee palm beach county','iv therapy loxahatchee fl','home visit doctor loxahatchee florida'], slug, 'services')}\n\n`;
      md += `[PROVIDER NAME] lives in [CITY] and serves the community directly. All [COMPANY] services available: primary care, [service category], aesthetics, weight loss, peptides, and more.\n\n`;

      md += `## About [CITY] [LOCATION PAGE]\n\n**Keywords:** ${mergeSeo(['loxahatchee fl healthcare provider','loxahatchee nurse practitioner','beyond concierge healthcare loxahatchee','loxahatchee palm beach county medical care'], slug, 'area')}\n\n`;
      md += `[CITY] is home to [PROVIDER NAME] personally. Residents receive fast, local, in-home healthcare from a provider who truly knows the community.\n\n**Phone:** ${PHONE}\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ services/service-slug.html --------------------------------------
  'service-slug': {
    output: 'services/service-slug.md',
    build() {
      const slug = 'service-slug';
      let md = fm(
        '[SERVICE CATEGORY] [SERVICE NAME] in [CITY], FL | [COMPANY NAME]',
        'Save up to 25% on all [COMPANY] services with a monthly [service category] [SERVICE NAME]. Basic, Plus, and Elite plans. [service name] delivered to your home in [CITY] and [COUNTY], FL.',
        `${SITE}/services/service-slug.html`
      );
      md += `# [SERVICE CATEGORY] [SERVICE NAME] — [CITY], FL\n\n`;
      md += `> Regular [service category]. Real savings. [PROVIDER NAME] delivers every session to your home, office, or event.\n\n---\n\n`;

      md += `## Overview\n\n**Keywords:** ${mergeSeo(['iv therapy [SERVICE NAME] wellington fl','monthly iv therapy plan palm beach county','iv [SERVICE NAME] 25% off all services','beyond concierge iv [SERVICE NAME] florida','[SERVICE NAME] subscription wellington fl'], slug, 'hero')}\n\n`;
      md += `Join a monthly [SERVICE NAME] and save 25% on all other [COMPANY] services. No contracts. Cancel anytime. [PROVIDER NAME] personally delivers every session.\n\n`;

      md += `## [SERVICE NAME] Plans\n\n**Keywords:** ${mergeSeo(['iv [SERVICE NAME] plans pricing wellington fl','basic plus elite iv [SERVICE NAME] palm beach','monthly [SERVICE NAME] plan cost florida','iv therapy subscription plans near me'], slug, 'plans')}\n\n`;
      md += `| Plan | Price | Sessions/mo | [NAVIGATION ITEM] |\n|---|---|---|---|\n`;
      md += `| Basic | $149/mo | 1 IV session | 25% off all [COMPANY] services |\n`;
      md += `| Plus | $349/mo | 3 IV sessions | 25% off all [COMPANY] services |\n`;
      md += `| Elite | $549/mo | 5 IV sessions | 25% off all [COMPANY] services |\n\n`;
      md += `All plans: mobile delivery, same provider ([PROVIDER NAME]), no contracts, cancel anytime.\n\n`;

      md += `## Why [SERVICE NAME]\n\n**Keywords:** ${mergeSeo(['benefits of iv therapy [SERVICE NAME]','why join iv therapy plan wellington','iv [SERVICE NAME] vs single session palm beach','regular iv therapy benefits florida'], slug, 'why')}\n\n`;
      md += `- 25% off IV sessions plus all other [COMPANY] services\n- Priority scheduling\n- Same trusted provider every session\n- We come to you — home, office, or event\n- Ideal for energy, immunity, recovery, and [SERVICE NAME] routines\n\n`;

      md += `## How to Join\n\n**Keywords:** ${mergeSeo(['join iv [SERVICE NAME] wellington fl','sign up iv therapy plan palm beach county','book iv [SERVICE NAME] beyond concierge healthcare'], slug, 'steps')}\n\n`;
      md += `Book a free consultation with [PROVIDER NAME]. She will recommend the right plan based on your goals and frequency.\n\n**Book:** ${SITE}/book-now.html | **Call/Text:** ${PHONE}\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ services/iv-basics.html ------------------------------------------
  'iv-basics': {
    output: 'services/iv-basics.md',
    build() {
      const slug = 'iv-basics';
      let md = fm(
        'Basic IV Packages in [CITY], FL | [COMPANY NAME]',
        'Simple [service name] packages delivered to your home in [CITY] and [COUNTY]. [service name], immune boost, energy, and more. Starting at $100+.',
        `${SITE}/services/iv-basics.html`
      );
      md += `# Basic IV Packages — [CITY], FL\n\n`;
      md += `> Simple, effective [service category] delivered to your home. No complicated menus — just the core drips that work.\n\n---\n\n`;

      md += `## Overview\n\n**Keywords:** ${mergeSeo(['basic iv packages wellington fl','simple iv therapy palm beach county','[SERVICE NAME] packages near me florida','affordable iv therapy wellington fl','starter iv package mobile palm beach'], slug, 'hero')}\n\n`;
      md += `[COMPANY] Basic IV Packages cover the most-requested drip infusions: [service name], immune support, energy and focus, [SERVICE NAME] recovery, and general wellness. All delivered to your location by [PROVIDER NAME]. Starting at $100+.\n\n`;

      md += `## Package Options\n\n**Keywords:** ${mergeSeo(['iv therapy package options wellington','[service name] drip palm beach county','immune boost iv wellington fl','[SERVICE NAME] iv therapy palm beach','energy [SERVICE NAME] florida'], slug, 'packages')}\n\n`;
      md += `- [service name] Drip — rehydrate fast, no downtime\n- Immune Boost — vitamin C, zinc, B-complex blend\n- Energy & Focus — [SERVICE NAME], B-complex, magnesium\n- [SERVICE NAME] Recovery — fluids, anti-nausea, vitamins\n- [SERVICE NAME] — the all-around foundation drip\n\nStarting at $100+ per session. 25% off with [SERVICE NAME].\n\n`;

      md += `## How It Works\n\n**Keywords:** ${mergeSeo(['how [SERVICE NAME] therapy works wellington','basic iv session process palm beach county','iv appointment at home florida','book [SERVICE NAME] near me wellington'], slug, 'how')}\n\n`;
      md += `**Time:** 30-45 min | **Downtime:** None | **Location:** We come to you\n\n[PROVIDER NAME] arrives at your home or office with everything needed. She selects the right blend, sets up the IV line, and monitors you throughout the session.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ services/iv-cocktails.html ---------------------------------------
  'iv-cocktails': {
    output: 'services/iv-cocktails.md',
    build() {
      const slug = 'iv-cocktails';
      let md = fm(
        'IV Cocktails & Specialty Drips in [CITY], FL | [COMPANY NAME]',
        'Custom IV cocktail blends for beauty, [SERVICE NAME]+, weight loss support, and more. Mobile delivery to your home in [CITY] and [COUNTY], FL.',
        `${SITE}/services/iv-cocktails.html`
      );
      md += `# IV Cocktails & Specialty Drips — [CITY], FL\n\n`;
      md += `> Custom IV blends built for results. Specialty drips beyond the basics — beauty, [SERVICE NAME]+, weight loss support, and more.\n\n---\n\n`;

      md += `## Overview\n\n**Keywords:** ${mergeSeo(['iv cocktails wellington fl','specialty [SERVICE NAME]s palm beach county','custom iv blend florida mobile','[SERVICE NAME] cocktail wellington','beauty [SERVICE NAME] palm beach county fl'], slug, 'hero')}\n\n`;
      md += `[COMPANY] IV Cocktails are specialty blends designed for specific goals: [SERVICE NAME] and beauty, [SERVICE NAME]+ cellular renewal, weight loss support, pregnancy and morning sickness, and more. All delivered to your home by [PROVIDER NAME].\n\n`;

      md += `## Cocktail Menu\n\n**Keywords:** ${mergeSeo(['iv cocktail menu wellington fl','beauty [SERVICE NAME] florida','[SERVICE NAME] therapy palm beach county','myers cocktail wellington fl','weight loss [SERVICE NAME] florida','morning sickness iv therapy palm beach'], slug, 'menu')}\n\n`;
      md += `- **Beauty** — [SERVICE NAME], vitamin C, biotin for skin, hair, and nails\n- **[SERVICE NAME]+** — nicotinamide adenine dinucleotide for cellular energy and [SERVICE NAME]\n- **[SERVICE CATEGORY] Support** — [SERVICE NAME], L-carnitine, MIC blend\n- **Morning Sickness / Pregnancy** — safe anti-nausea, fluids, B6\n- **[SERVICE NAME]** — full-spectrum immune + energy foundation\n- **High-Dose Vitamin C** — antioxidant and immune support\n- **Jet Lag & Travel Recovery** — rapid rehydration and reset\n\n25% off all cocktails with [SERVICE NAME].\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ services/iv-extras.html ------------------------------------------
  'iv-extras': {
    output: 'services/iv-extras.md',
    build() {
      const slug = 'iv-extras';
      let md = fm(
        '[SERVICE NAME] & Boosters in [CITY], FL | [COMPANY NAME]',
        'Enhance any IV session with targeted [SERVICE NAME]: [SERVICE NAME], zinc, magnesium, B-complex, and more. Mobile [SERVICE NAME] in [CITY] and [COUNTY].',
        `${SITE}/services/iv-extras.html`
      );
      md += `# [SERVICE NAME] & Boosters — [CITY], FL\n\n`;
      md += `> Add a targeted booster to any IV session. $25 each. Elite members get 2 free [SERVICE NAME] per session.\n\n---\n\n`;

      md += `## Overview\n\n**Keywords:** ${mergeSeo(['iv [SERVICE NAME] wellington fl','iv boosters palm beach county','[SERVICE NAME] push wellington fl','iv extras near me florida','vitamin iv booster palm beach'], slug, 'hero')}\n\n`;
      md += `[COMPANY] [SERVICE NAME] are individual ingredients you can add to any base drip or cocktail. Each add-on is $25. Elite [SERVICE NAME] members receive 2 free [SERVICE NAME] per session.\n\n`;

      md += `## Available [SERVICE NAME]\n\n**Keywords:** ${mergeSeo(['[SERVICE NAME] iv push wellington fl','zinc magnesium iv add-on palm beach','b-complex iv booster florida','iv vitamin push near me wellington','extra [SERVICE NAME] iv shot palm beach county'], slug, 'menu')}\n\n`;
      md += `- **[SERVICE NAME] Push** — master antioxidant, skin brightening, detox ($25)\n- **Zinc & Magnesium** — immune support, muscle function ($25)\n- **Extra B-Complex** — energy, metabolism, nervous system ($25)\n- **Extra [SERVICE NAME]** — energy and focus boost ($25)\n- **Extra Vitamin C** — immune boost and antioxidant ($25)\n\nElite [SERVICE NAME]: 2 free [SERVICE NAME] per session included.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ services/service-slug.html ---------------------------------------------
  'service-slug': {
    output: 'services/service-slug.md',
    build() {
      const slug = 'service-slug';
      let md = fm(
        '[SERVICE NAME]+ [SERVICE CATEGORY] in [CITY], FL | [COMPANY NAME]',
        'Mobile [SERVICE NAME]+ [service category] delivered to your home in [CITY] and [COUNTY]. Cellular energy, [SERVICE NAME], brain clarity, and recovery support from [PROVIDER NAME], [CREDENTIALS].',
        `${SITE}/services/service-slug.html`
      );
      md += `# [SERVICE NAME]+ [SERVICE CATEGORY] — [CITY], FL\n\n`;
      md += `> Nicotinamide Adenine Dinucleotide ([SERVICE NAME]+) [service category] for cellular renewal, energy, brain clarity, and recovery. Delivered to your home by [PROVIDER NAME].\n\n---\n\n`;

      md += `## What is [SERVICE NAME]+ [SERVICE CATEGORY]?\n\n**Keywords:** ${mergeSeo(['[SERVICE NAME] therapy wellington fl','[SERVICE NAME]+ [service name] palm beach county','nicotinamide adenine dinucleotide iv florida','[SERVICE NAME] [SERVICE NAME] wellington','mobile [SERVICE NAME]+ therapy palm beach fl'], slug, 'hero')}\n\n`;
      md += `[SERVICE NAME]+ (nicotinamide adenine dinucleotide) is a coenzyme essential for cellular energy production, DNA repair, and metabolic function. IV delivery bypasses digestion and delivers [SERVICE NAME]+ directly to cells — far more effective than oral supplements.\n\n`;

      md += `## Benefits\n\n**Keywords:** ${mergeSeo(['[SERVICE NAME] benefits wellington fl','[SERVICE NAME]+ therapy for energy florida','[SERVICE NAME]+ brain clarity palm beach county','[SERVICE NAME]+ [SERVICE NAME] [SERVICE NAME] florida','[SERVICE NAME]+ addiction recovery iv therapy'], slug, 'benefits')}\n\n`;
      md += `Clients report: sustained energy without stimulants · improved mental clarity and focus · reduced brain fog · [SERVICE NAME] cellular support · improved athletic recovery · support for addiction recovery · better sleep quality.\n\n`;

      md += `## How It Works\n\n**Keywords:** ${mergeSeo(['how [SERVICE NAME] therapy works','[SERVICE NAME] session process wellington fl','how long does [SERVICE NAME] take','[SERVICE NAME] dose palm beach county florida'], slug, 'how')}\n\n`;
      md += `**Time:** 1-4 hours depending on dose | **Downtime:** None | **Location:** We come to you\n\n[PROVIDER NAME] administers [SERVICE NAME]+ slowly via IV to minimize any discomfort. Dose is tailored to your goals and health history. Sessions are done in your home — you can read, work, or relax during the [service name].\n\n`;

      md += `## Provider Note\n\n**Keywords:** ${mergeSeo(['gabrielle radabaugh [SERVICE NAME]+ therapy','nurse practitioner [SERVICE NAME]+ wellington fl','board certified [SERVICE NAME] provider florida'], slug, 'provider')}\n\n`;
      md += `All [SERVICE NAME]+ sessions are administered by [PROVIDER NAME], [CREDENTIALS]. She evaluates your health history before your first session and adjusts dosing based on your response.\n\n*[PROVIDER NAME], [CREDENTIALS]. Board Certified Family Nurse Practitioner. AANP Member.*\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ book-now.html ---------------------------------------------------
  'book-now': {
    output: 'book-now.md',
    build() {
      const slug = 'book-now';
      let md = fm(
        'Book a Consultation in [CITY], FL | [COMPANY NAME]',
        'Book a free [SERVICE NAME] meet & greet or schedule any [COMPANY] service. [SERVICE NAME], [service category], [SERVICE NAME], weight loss, and more in [CITY] and [COUNTY], FL.',
        `${SITE}/book-now.html`
      );
      md += `# Book a Consultation — [COMPANY NAME]\n\n`;
      md += `> Start with a free [SERVICE NAME] meet & greet. No commitment. [PROVIDER NAME] will answer your questions and build a plan.\n\n---\n\n`;

      md += `## [CTA TEXT]\n\n**Keywords:** ${mergeSeo(['book concierge healthcare wellington fl','schedule nurse practitioner palm beach county','book in-home healthcare appointment florida','free consultation beyond concierge healthcare','book iv therapy wellington fl'], slug, 'hero')}\n\n`;
      md += `**Phone/Text:** ${PHONE}  \n**Email:** [EMAIL]  \n**Online booking:** ${SITE}/book-now.html  \n\nNew patients: free [SERVICE NAME] meet & greet (valued at $100).  \nExisting patients: book online via Mangomint.\n\n`;

      md += `## [SERVICES] Available to Book\n\n**Keywords:** ${mergeSeo(['book iv therapy palm beach county','schedule botox wellington fl','book weight loss consultation florida','book [SERVICE NAME] wellington'], slug, 'services')}\n\n`;
      md += `In-Home [SERVICE CATEGORY] · [SERVICE CATEGORY] · [SERVICE NAME] · [service name] · [SERVICE NAME] & [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME]/Hair · [SERVICE CATEGORY] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE NAME] · [SERVICE CATEGORY] · [SERVICE CATEGORY]  \n\nSee full service list: ${SITE}/index.md\n\n`;

      md += `## Cancellation Policy\n\nValid credit card required at booking. Less than 24hr cancellation: $25 charge. No-show: $50 charge.\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ [SERVICE NAME].html (root) ------------------------------------------
  '[SERVICE NAME]-root': {
    output: '[SERVICE NAME].md',
    build() {
      const slug = '[SERVICE NAME]-root';
      let md = fm(
        '[SERVICE CATEGORY] [SERVICE NAME] [CITY], FL | [COMPANY NAME]',
        'Monthly [service category] [SERVICE NAME] plans with 25% savings on all [COMPANY] services. Basic, Plus, and Elite tiers. Mobile delivery in [CITY] and [COUNTY], FL.',
        `${SITE}/[SERVICE NAME].html`
      );
      md += `# [SERVICE CATEGORY] [SERVICE NAME] — [CITY], FL\n\n`;
      md += `> Join a monthly plan. [PROMOTIONAL MESSAGE] [PROVIDER NAME] delivers every session to your door.\n\n---\n\n`;

      md += `## Plans\n\n**Keywords:** ${mergeSeo(['iv therapy [SERVICE NAME] wellington fl','monthly healthcare [SERVICE NAME] palm beach county','25% off all services iv [SERVICE NAME] florida','iv [SERVICE NAME] plan near me wellington'], slug, 'plans')}\n\n`;
      md += `| Plan | Price | Sessions/mo | [NAVIGATION ITEM] |\n|---|---|---|---|\n`;
      md += `| Basic | $149/mo | 1 IV/mo | 25% off all [COMPANY] services |\n`;
      md += `| Plus | $349/mo | 3 IVs/mo | 25% off all [COMPANY] services |\n`;
      md += `| Elite | $549/mo | 5 IVs/mo | 25% off all [COMPANY] services + 2 free [SERVICE NAME]/session |\n\n`;
      md += `No contracts. Cancel anytime. See also: [/services/service-slug.md](${SITE}/services/service-slug.md)\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ privacy.html -----------------------------------------------------
  'privacy': {
    output: 'privacy.md',
    build() {
      const slug = 'privacy';
      let md = fm(
        'Privacy Policy | [COMPANY NAME] [CITY], FL',
        'Privacy policy for [COMPANY NAME]. How we collect, use, and protect your information.',
        `${SITE}/privacy.html`
      );
      md += `# Privacy Policy — [COMPANY NAME]\n\n`;
      md += `**Effective date:** See live page at ${SITE}/privacy.html  \n**Contact:** [EMAIL] | ${PHONE}\n\n---\n\n`;
      md += `[COMPANY NAME] is a HIPAA-compliant practice. We do not sell your personal information. Health data is stored only in HIPAA-secured systems (Mangomint). Marketing data (name, email, phone, service interest) is used solely to contact you about your inquiry.\n\n`;
      md += `For the full privacy policy, visit: ${SITE}/privacy.html\n\n`;
      md += FOOTER;
      return md;
    }
  },

  // ------ locations/west-palm-beach-fl.html --------------------------------
  'locations-west-palm-beach': {
    output: 'locations/west-palm-beach-fl.md',
    build() {
      const slug = 'locations-west-palm-beach';
      let md = fm(
        'Concierge Healthcare in [CITY], FL | [COMPANY NAME]',
        'In-home and [SERVICE NAME] concierge healthcare in [CITY], FL. All [COMPANY] services delivered to your home by [PROVIDER NAME], [CREDENTIALS].',
        `${SITE}/locations/west-palm-beach-fl.html`
      );
      md += `# Concierge Healthcare in [CITY], FL\n\n---\n\n`;

      md += `## [SERVICES] in [CITY], FL\n\n**Keywords:** ${mergeSeo(['concierge healthcare west palm beach florida','in-home nurse practitioner west palm beach fl','[SERVICE NAME] therapy west palm beach','botox west palm beach fl','home visit healthcare west palm beach palm beach county'], slug, 'services')}\n\n`;
      md += `All [COMPANY] services available in [CITY]. [PROVIDER NAME] delivers [SERVICE NAME], [service category], aesthetics, weight loss, and more throughout [CITY] and greater [COUNTY].\n\n`;

      md += `## [LOCATION PAGE] Notes\n\n**Keywords:** ${mergeSeo(['west palm beach fl healthcare provider','west palm beach nurse practitioner','beyond concierge healthcare west palm beach','west palm beach palm beach county medical care'], slug, 'area')}\n\n`;
      md += `[CITY] is part of [COMPANY]'s full service territory across [COUNTY].  \n**Phone:** ${PHONE} | **Book:** ${SITE}/book-now.html\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ about/service-area.html ------------------------------------------
  'service-area': {
    output: 'about/service-area.md',
    build() {
      const slug = 'service-area';
      let md = fm(
        '[LOCATION PAGE] | [COMPANY NAME] | [CITY], [COUNTY], FL',
        '[COMPANY NAME] serves [CITY], [CITY], [CITY], [CITY], [CITY], [CITY], and all of [COUNTY], FL. [SERVICE NAME] statewide.',
        `${SITE}/about/service-area.html`
      );
      md += `# [COMPANY NAME] — [LOCATION PAGE]\n\n---\n\n`;

      md += `## Locations Served\n\n**Keywords:** ${mergeSeo(['beyond concierge healthcare service area florida','in-home healthcare palm beach county cities','mobile nurse practitioner cities served','concierge healthcare coverage palm beach fl','[SERVICE NAME] florida statewide nurse practitioner'], slug, 'area')}\n\n`;
      md += `**In-Home & On-Site [LOCATION PAGE]:**  \n[CITY] · [CITY] · [CITY] · [CITY] · [CITY] · [CITY] · [COUNTY] Gardens · Lake Worth · Boynton Beach · Boca Raton · and all of [COUNTY], FL\n\n**[SERVICE NAME]:** Available statewide across [STATE].\n\n`;
      md += `**Response time:** 90-minute average. Same-day appointments frequently available.  \n**Phone:** ${PHONE} | **Book:** ${SITE}/book-now.html\n\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ services/index.html ----------------------------------------------
  'services-index': {
    output: 'services/index.md',
    outputAlso: 'services.md',
    build() {
      const slug = 'services-index';
      let md = fm(
        'Concierge Healthcare [SERVICES] in [CITY], FL | [COMPANY NAME]',
        'Full list of concierge healthcare services delivered to your home in [CITY] and [COUNTY]. Primary care, [service category], aesthetics, weight loss, [SERVICE NAME], and more.',
        `${SITE}/services/`
      );
      md += `# All [COMPANY] [SERVICES] — [CITY], FL\n\n`;
      md += `> Every service below is delivered to your home, office, or via [SERVICE NAME] across [CITY] and [COUNTY].\n\n---\n\n`;

      md += `## Service Directory\n\n**Keywords:** ${mergeSeo(['concierge healthcare services wellington fl','in-home medical services palm beach county','all beyond concierge healthcare services','nurse practitioner services directory florida'], slug, 'services')}\n\n`;
      const services = [
        ['[SERVICE CATEGORY]', 'iv-therapy'], ['[SERVICE NAME]', 'service-slug'], ['Basic IV Packages', 'iv-basics'],
        ['IV Cocktails', 'iv-cocktails'], ['[SERVICE NAME]', 'iv-extras'], ['[SERVICE NAME]+ [SERVICE CATEGORY]', 'service-slug'],
        ['[SERVICE NAME] & [SERVICE NAME]', 'botox'], ['[SERVICE NAME]', 'dermal-fillers'], ['[SERVICE NAME]', '[SERVICE NAME]'],
        ['[SERVICE NAME] Vampire Facial', 'prp-facial'], ['[SERVICE NAME] Restoration', 'prp-hair'],
        ['[SERVICE CATEGORY]', 'weight-loss'], ['[SERVICE NAME] Therapy', 'peptides'],
        ['[SERVICE NAME]', 'hormone-replacement-therapy'], ['[SERVICE NAME]', '[SERVICE NAME]'],
        ['[SERVICE NAME]', '[SERVICE NAME]-injections'], ['[SERVICE NAME] Care', '[SERVICE NAME]'],
        ['In-Home [SERVICE CATEGORY]', 'in-home-primary-care'], ['[SERVICE CATEGORY] at Home', 'urgent-care'],
        ['[SERVICE NAME]', '[SERVICE NAME]'], ['[SERVICE CATEGORY]', 'skilled-nursing'],
        ['[SERVICE CATEGORY]', 'wellness'], ['[SERVICE NAME] Plans', '[SERVICE NAME]'],
      ];
      services.forEach(([name, slug]) => {
        md += `- [${name}](${SITE}/services/${slug}.md)\n`;
      });
      md += `\n`;

      md += FOOTER;
      return md;
    }
  },

  // ------ locations/royal-palm-beach-fl.html --------------------------------
  'locations-royal-palm-beach': {
    output: 'locations/royal-palm-beach-fl.md',
    build() {
      const slug = 'locations-royal-palm-beach';
      let md = fm(
        'Concierge Healthcare in [CITY], FL | [COMPANY NAME]',
        'In-home and [SERVICE NAME] concierge healthcare in [CITY], FL. All [COMPANY] services delivered to your home by [PROVIDER NAME], [CREDENTIALS].',
        `${SITE}/locations/royal-palm-beach-fl.html`
      );
      md += `# Concierge Healthcare in [CITY], FL\n\n---\n\n`;

      md += `## [SERVICES] in [CITY], FL\n\n**Keywords:** ${mergeSeo(['concierge healthcare royal palm beach florida','in-home nurse practitioner royal palm beach fl','[SERVICE NAME] therapy royal palm beach','botox royal palm beach fl','healthcare delivery royal palm beach palm beach county'], slug, 'services')}\n\n`;
      md += `All [COMPANY] services are available in [CITY]. [PROVIDER NAME] serves all of [COUNTY] including [CITY] with the same personal, one-on-one care.\n\n`;

      md += `## [LOCATION PAGE] Notes\n\n**Keywords:** ${mergeSeo(['royal palm beach fl healthcare provider','royal palm beach nurse practitioner','beyond concierge healthcare royal palm beach','royal palm beach palm beach county medical'], slug, 'area')}\n\n`;
      md += `[CITY] is part of [COMPANY]'s core service territory. Same-day appointments frequently available.\n\n**Phone:** ${PHONE}\n\n`;

      md += FOOTER;
      return md;
    }
  },
};

// ---- Builder ----------------------------------------------------------------

function buildMirror(slug) {
  const def = PAGE_DEFS[slug];
  if (!def) { console.error(`Unknown slug: ${slug}`); return false; }
  const md      = def.build();
  const outPath = path.join(ROOT, def.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`Built mirror: ${def.output} (${(md.length / 1024).toFixed(1)}KB)`);
  // Write flat alias (e.g. about.md alongside about/index.md)
  if (def.outputAlso) {
    const aliasPath = path.join(ROOT, def.outputAlso);
    fs.writeFileSync(aliasPath, md, 'utf8');
    console.log(`  alias: ${def.outputAlso}`);
  }
  return true;
}

// ---- Audit ------------------------------------------------------------------

function auditMirrors() {
  const TODAY = new Date().toISOString().slice(0, 10);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[COMPANY] Static Mirror Audit — ${TODAY}`);
  console.log(`${'='.repeat(60)}\n`);

  const slugs = Object.keys(PAGE_DEFS);
  let missing = [], noCustom = [];

  slugs.forEach(slug => {
    const def      = PAGE_DEFS[slug];
    const outPath  = path.join(ROOT, def.output);
    const exists   = fs.existsSync(outPath);
    const custom   = CUSTOM[slug] || {};
    const sections = Object.keys(custom);
    const filled   = sections.filter(s => custom[s] && custom[s].length > 0);
    const terms    = sections.reduce((n, s) => n + (custom[s] ? custom[s].length : 0), 0);

    const icon   = exists ? '✅' : '❌';
    const seoTag = filled.length === 0 ? ' [⚠️  no custom SEO]' : '';
    console.log(`${icon} ${slug.padEnd(30)} custom: ${filled.length}/${sections.length} sections, ${terms} terms${seoTag}`);

    if (!exists) missing.push(slug);
    if (filled.length === 0) noCustom.push(slug);
  });

  console.log(`\n${'─'.repeat(60)}`);
  if (missing.length) {
    console.log(`\n❌ Missing mirrors (run node mirrors.js to fix):`);
    missing.forEach(s => console.log(`   ${s} → ${PAGE_DEFS[s].output}`));
  }
  if (noCustom.length) {
    console.log(`\n⚠️  Static pages with no custom SEO (${noCustom.length}/${slugs.length}):`);
    noCustom.forEach(s => console.log(`   ${s}`));
    console.log(`\n   → Add terms in data/static-seo.json under each page key`);
  }
  console.log(`\n${'='.repeat(60)}\n`);
}

// ---- Main -------------------------------------------------------------------

const arg = process.argv[2];
if (arg === '--audit') {
  auditMirrors();
} else if (arg) {
  buildMirror(arg);
  require('./build-sitemap')();
} else {
  const slugs = Object.keys(PAGE_DEFS);
  let ok = 0, fail = 0;
  slugs.forEach(s => { buildMirror(s) ? ok++ : fail++; });
  console.log(`\nDone: ${ok} built, ${fail} failed`);
  console.log(`Custom SEO terms: data/static-seo.json`);
  // Patch alternate links into static HTML, then rebuild sitemap
  require('./patch-links')();
  require('./build-sitemap')();
}
