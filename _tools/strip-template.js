#!/usr/bin/env node
/**
 * strip-template.js
 * Strips all BCH-specific content from the website template.
 * Run from repo root: node strip-template.js
 */

const fs = require('fs');
const path = require('path');

let totalChanged = 0;
const skipped = [];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function walkDir(dir, ext) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      results.push(...walkDir(full, ext));
    } else if (!ext || (Array.isArray(ext) ? ext.some(e => entry.name.endsWith(e)) : entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function readFile(fp) {
  return fs.readFileSync(fp, 'utf8');
}

function writeFile(fp, content) {
  fs.writeFileSync(fp, content, 'utf8');
}

function processFile(fp, processFn) {
  const original = readFile(fp);
  const updated = processFn(original, fp);
  if (updated !== original) {
    writeFile(fp, updated);
    console.log(`  ✓ ${fp}`);
    totalChanged++;
  } else {
    // console.log(`  - ${fp} (no changes)`);
  }
}

// ─────────────────────────────────────────────
// HTML STRIPPING FUNCTIONS
// ─────────────────────────────────────────────

function removeBlock(html, startPattern, endTag) {
  // Remove blocks matching startPattern up to the closing endTag (balanced or first match)
  // Uses a simple approach: find start, count depth, find end
  let result = html;
  let safetyLimit = 50;
  while (safetyLimit-- > 0) {
    const startMatch = result.search(startPattern);
    if (startMatch === -1) break;
    // Find the matching closing tag
    const tagName = endTag.replace(/<\//,'').replace('>','');
    let depth = 1;
    let pos = startMatch;
    // Skip past the opening tag
    const openTagEnd = result.indexOf('>', startMatch) + 1;
    pos = openTagEnd;
    while (depth > 0 && pos < result.length) {
      const nextOpen = result.indexOf('<' + tagName, pos);
      const nextClose = result.indexOf('</' + tagName, pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 1;
      } else {
        depth--;
        if (depth === 0) {
          const closeEnd = result.indexOf('>', nextClose) + 1;
          result = result.slice(0, startMatch) + result.slice(closeEnd);
          break;
        }
        pos = nextClose + 1;
      }
    }
    if (depth > 0) break; // Safety
  }
  return result;
}

function removeScriptBlocks(html, patterns) {
  let result = html;
  for (const pattern of patterns) {
    // Remove entire <script>...</script> blocks containing the pattern
    let safetyLimit = 20;
    while (safetyLimit-- > 0) {
      // Find a script tag
      const scriptStart = result.search(/<script[\s>]/i);
      if (scriptStart === -1) break;
      const scriptEnd = result.indexOf('</script>', scriptStart);
      if (scriptEnd === -1) break;
      const block = result.slice(scriptStart, scriptEnd + 9);
      if (new RegExp(pattern, 'i').test(block)) {
        result = result.slice(0, scriptStart) + result.slice(scriptEnd + 9);
      } else {
        // move past this script block to search for next
        const tempBefore = result.slice(0, scriptStart);
        const tempAfter = result.slice(scriptEnd + 9);
        // We need to not loop forever — mark and skip
        // Use a different approach: process all scripts at once
        break;
      }
    }
  }
  return result;
}

function removeAllMatchingScripts(html, patterns) {
  // Find all script blocks and remove those matching any pattern
  let result = '';
  let remaining = html;
  while (true) {
    const scriptStart = remaining.search(/<script[\s\n\r>]/i);
    if (scriptStart === -1) {
      result += remaining;
      break;
    }
    result += remaining.slice(0, scriptStart);
    const scriptEnd = remaining.indexOf('</script>', scriptStart);
    if (scriptEnd === -1) {
      result += remaining.slice(scriptStart);
      break;
    }
    const block = remaining.slice(scriptStart, scriptEnd + 9);
    const shouldRemove = patterns.some(p => new RegExp(p, 'i').test(block));
    if (!shouldRemove) {
      result += block;
    }
    remaining = remaining.slice(scriptEnd + 9);
  }
  return result;
}

function replaceCloudinaryUrls(html) {
  // Replace full Cloudinary URLs with placehold.co
  return html.replace(/https:\/\/res\.cloudinary\.com\/dcprgumqz\/[^\s"'`)>]*/g, (match) => {
    // Preserve Mixkit (shouldn't be Cloudinary, but just in case)
    return 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
  });
}

function replaceOgImageCloudinary(html) {
  // Replace og:image meta with Cloudinary src
  return html.replace(
    /(<meta[^>]+property=["']og:image["'][^>]+content=["'])https:\/\/res\.cloudinary\.com\/[^"']+/gi,
    '$1https://placehold.co/1200x630/e8e8e8/aaaaaa?text=OG+Image'
  ).replace(
    /(<meta[^>]+content=["'])https:\/\/res\.cloudinary\.com\/[^"']+([^>]+property=["']og:image["'])/gi,
    '$1https://placehold.co/1200x630/e8e8e8/aaaaaa?text=OG+Image$2'
  );
}

// Text replacements — order matters (longer strings first)
const TEXT_REPLACEMENTS = [
  // Company names
  ['Beyond Concierge Healthcare', '[COMPANY NAME]'],
  ['Beyond Concierge', '[COMPANY NAME]'],
  
  // Provider names
  ['Gabrielle Radabaugh', '[PROVIDER NAME]'],
  ['Gabrielle', '[PROVIDER NAME]'],
  ['Gabby', '[PROVIDER NAME]'],
  
  // Credentials
  ['ARNP, FNP-C', '[CREDENTIALS]'],
  ['FNP-C', '[CREDENTIALS]'],
  ['ARNP', '[CREDENTIALS]'],
  
  // Contact
  ['gabby@arnpfl.com', '[EMAIL]'],
  ['(561) 216-7066', '[PHONE]'],
  ['(561) 247-1554', '[PHONE]'],
  ['561-216-7066', '[PHONE]'],
  ['561-247-1554', '[PHONE]'],
  ['5612167066', '[PHONE]'],
  ['5612471554', '[PHONE]'],
  
  // Address
  ['12783 Forest Hill Blvd', '[ADDRESS]'],
  ['Wellington, FL 33414', '[CITY, STATE ZIP]'],
  ['33414', '[ZIP]'],
  
  // Domain / URLs
  ['beyondhealthcarefl.com', '[DOMAIN]'],
  ['beyondconcierge.netlify.app', '[STAGING URL]'],
  ['mangomint.com/770971', '[BOOKING URL]'],
  ['770971', '[BOOKING ID]'],
  
  // Counties and cities (in text, not CSS)
  ['Palm Beach County', '[COUNTY]'],
  ['Royal Palm Beach', '[CITY]'],
  ['West Palm Beach', '[CITY]'],
  ['Loxahatchee', '[CITY]'],
  ['Palm Beach', '[COUNTY]'],
  ['Westlake', '[CITY]'],
  ['Jupiter', '[CITY]'],
  
  // State
  ['Florida', '[STATE]'],
];

// City names that need careful handling (not in CSS class names)
const CITY_TEXT_ONLY = [
  ['Wellington', '[CITY]'],
];

/**
 * Apply text replacements carefully - avoid CSS class names / JS identifiers
 * Strategy: replace in visible text attributes and known safe contexts
 */
function applyTextReplacements(html) {
  let result = html;
  
  for (const [from, to] of TEXT_REPLACEMENTS) {
    // Simple global replace - safe for URLs, emails, phone numbers
    // For city/state names we need to be careful
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), to);
  }
  
  // Wellington needs careful handling - not in CSS class names or IDs
  // Pattern: replace Wellington when NOT preceded by . # - _ (CSS selector chars) 
  // and not inside class="" or id="" attribute values
  result = applyCarefulCityReplacement(result, 'Wellington', '[CITY]');
  
  return result;
}

function applyCarefulCityReplacement(html, city, placeholder) {
  // Replace city name in text content but not in CSS class names or IDs
  // Split on attribute contexts and process safely
  const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Replace in href values that contain the city as a word (in URLs it's ok to keep slug)
  // But in display text (title, alt, aria-label, placeholder, content) - replace
  
  // Strategy: use negative lookbehind/lookahead for CSS class contexts
  // Don't replace when: preceded by hyphen, dot, hash, underscore (class name chars)
  result = html.replace(
    new RegExp(`(?<![\\-\\.#_\\/])\\b${escaped}\\b(?![\\-_])`, 'g'),
    (match, offset) => {
      // Check surrounding context - don't replace inside class="" or id="" attributes
      // Simple heuristic: look back 200 chars for unmatched class= or id=
      const before = html.slice(Math.max(0, offset - 200), offset);
      // Check if we're inside a class or id attribute
      const lastClassOrId = before.search(/class=["'][^"']*$/);
      const lastIdAttr = before.search(/\sid=["'][^"']*$/);
      if (lastClassOrId !== -1 || lastIdAttr !== -1) {
        return match; // Don't replace inside class/id attributes
      }
      return placeholder;
    }
  );
  
  // Also need to fix 'result' not 'html' in the inner function
  return result;
}

// Overwrite the function properly
function applyCarefulCityReplacementFixed(html, city, placeholder) {
  const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let result = '';
  let remaining = html;
  const regex = new RegExp(`\\b${escaped}\\b`, 'g');
  let lastIndex = 0;
  let match;
  regex.lastIndex = 0;
  
  // Work on the string segment by segment
  // Split by tag boundaries and process text nodes
  return remaining.replace(
    new RegExp(`\\b${escaped}\\b`, 'g'),
    (match, offset) => {
      // Look back to see if we're inside a class/id attribute
      const before = remaining.slice(Math.max(0, offset - 300), offset);
      // Find the last open quote that hasn't been closed
      // Look for class= or id= pattern with unclosed quote
      const classMatch = before.match(/(?:class|id)=["']([^"']*)$/);
      if (classMatch) {
        return match; // Inside class/id attribute, don't replace
      }
      // Also skip if preceded by hyphen or forward slash (URL slug)
      const charBefore = remaining[offset - 1];
      const charAfter = remaining[offset + match.length];
      if (charBefore === '-' || charBefore === '/' || charBefore === '.' || charBefore === '#') {
        return match;
      }
      if (charAfter === '-' || charAfter === '_') {
        return match;
      }
      return placeholder;
    }
  );
}

// ─────────────────────────────────────────────
// HTML PROCESSOR
// ─────────────────────────────────────────────

function processHtml(html, filePath) {
  let result = html;
  
  // 1. Remove Facebook pixel script blocks
  result = removeAllMatchingScripts(result, [
    'fbq',
    '3868923770024232',
    'googletagmanager',
    'google-analytics',
    'gtag\\(',
    'GTM-',
    'GA_MEASUREMENT_ID',
    'ga\\(',
  ]);
  
  // 2. Remove logo splash div
  result = removeBlock(result, /<div\s[^>]*id=["']logo-splash["']/i, '</div>');
  
  // 3. Remove BCH logo animation video tags
  result = result.replace(
    /<video[^>]*>[\s\S]*?<source[^>]*beyond-concierge\/logo-animation[^>]*>[\s\S]*?<\/video>/gi,
    ''
  );
  
  // 4. Remove img tags referencing BCH specific images
  result = result.replace(
    /<img[^>]+(?:alt=["'][^"']*(?:Beyond Concierge|BCH|gabby|Gabrielle)[^"']*["']|src=["'][^"']*(?:gabby|BCH|beyond-concierge)[^"']*["'])[^>]*\/?>/gi,
    '<img src="https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image" alt="[Image]">'
  );
  
  // 5. Replace Cloudinary URLs (preserve Mixkit)
  result = replaceCloudinaryUrls(result);
  
  // 6. Replace og:image Cloudinary
  result = replaceOgImageCloudinary(result);
  
  // 7. Apply text replacements
  result = applyTextReplacements(result);
  
  // 8. Careful Wellington replacement
  result = applyCarefulCityReplacementFixed(result, 'Wellington', '[CITY]');
  
  // 9. Replace mangomint booking ID
  result = result.replace(/770971/g, '[BOOKING ID]');
  
  // 10. Replace background-image inline styles with Cloudinary URLs
  result = result.replace(
    /background-image:\s*url\(['"]?https:\/\/res\.cloudinary\.com\/[^'")\s]+['"]?\)/gi,
    "background-image: url('https://placehold.co/1600x900/e8e8e8/aaaaaa?text=Background')"
  );
  
  // 11. data-bg attributes with Cloudinary
  result = result.replace(
    /data-bg=["']https:\/\/res\.cloudinary\.com\/[^"']+["']/gi,
    'data-bg="https://placehold.co/1600x900/e8e8e8/aaaaaa?text=Background"'
  );
  
  return result;
}

// ─────────────────────────────────────────────
// JSON SERVICE FILE PROCESSOR
// ─────────────────────────────────────────────

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image';
const PLACEHOLDER_HERO = 'https://placehold.co/1600x900/e8e8e8/aaaaaa?text=Hero';
const PLACEHOLDER_OG = 'https://placehold.co/1200x630/e8e8e8/aaaaaa?text=OG+Image';

function isImageUrl(val) {
  if (typeof val !== 'string') return false;
  return val.includes('cloudinary.com') || 
         val.includes('placehold.co') ||
         (val.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) && !val.startsWith('/') && !val.startsWith('./'));
}

function isUrl(val) {
  if (typeof val !== 'string') return false;
  return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('www.');
}

function isSlug(val) {
  if (typeof val !== 'string') return false;
  return /^[a-z0-9-]+$/.test(val) && val.includes('-') && val.length < 50;
}

function isPath(val) {
  if (typeof val !== 'string') return false;
  return val.startsWith('/') || val.startsWith('./') || val.startsWith('../');
}

// Text keys that should be replaced with placeholder text
const TEXT_KEYS = new Set([
  'name', 'h1', 'meta_title', 'meta_description', 'canonical', 'hero_value_prop',
  'tagline', 'description', 'body', 'byline', 'disclaimer', 'q', 'a', 'quote',
  'author', 'title', 'subtitle', 'text', 'label', 'content', 'summary',
  'intro', 'outro', 'heading', 'subheading', 'caption', 'note', 'details',
  'time', 'downtime', 'onset', 'duration', 'location', 'category',
]);

const KEEP_KEYS = new Set([
  'slug', 'id', 'type', 'format', 'version', 'order', 'enabled', 'active',
  'price', 'priceDisplay', 'duration_min', 'duration_max',
]);

// Image keys
const IMAGE_KEYS = new Set([
  'hero_image', 'image', 'thumbnail', 'og_image', 'background', 'photo',
  'avatar', 'banner', 'cover', 'portrait', 'gallery_image', 'card_image',
  'feature_image', 'preview_image',
]);

function stripJsonValue(key, val, depth) {
  if (val === null || val === undefined) return val;
  
  if (Array.isArray(val)) {
    return val.map((item, i) => stripJsonValue(i, item, depth + 1));
  }
  
  if (typeof val === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = stripJsonValue(k, v, depth + 1);
    }
    return result;
  }
  
  if (typeof val === 'boolean' || typeof val === 'number') {
    return val;
  }
  
  if (typeof val === 'string') {
    const keyStr = String(key).toLowerCase();
    
    // Keep structural keys unchanged
    if (KEEP_KEYS.has(keyStr)) return val;
    
    // Image URL keys
    if (IMAGE_KEYS.has(keyStr) || isImageUrl(val)) {
      if (keyStr === 'og_image' || keyStr === 'og_image_url') return PLACEHOLDER_OG;
      if (keyStr === 'hero_image' || keyStr === 'hero') return PLACEHOLDER_HERO;
      return PLACEHOLDER_IMAGE;
    }
    
    // URL/path keys - check if it's a Cloudinary URL
    if (val.includes('cloudinary.com') || val.includes('dcprgumqz')) {
      return PLACEHOLDER_IMAGE;
    }
    
    // BCH domain URLs
    if (val.includes('beyondhealthcarefl.com') || val.includes('beyondconcierge')) {
      return '[URL]';
    }
    
    // Mangomint booking URL
    if (val.includes('mangomint.com')) {
      return '[BOOKING URL]';
    }
    
    // Text content keys
    if (TEXT_KEYS.has(keyStr)) {
      if (keyStr === 'name') return '[Service Name]';
      if (keyStr === 'tagline') return '[Service tagline]';
      if (keyStr === 'description') return '[Service description]';
      if (keyStr === 'meta_title') return '[Page Title | COMPANY NAME]';
      if (keyStr === 'meta_description') return '[Meta description for this service page.]';
      if (keyStr === 'h1') return '[Service Name] in [CITY], [STATE]';
      if (keyStr === 'hero_value_prop') return '[Brief hero value proposition for this service.]';
      if (keyStr === 'canonical') return '[CANONICAL URL]';
      if (keyStr === 'byline') return 'Written and medically reviewed by [PROVIDER NAME], [CREDENTIALS].';
      if (keyStr === 'disclaimer') return 'Performed by [PROVIDER NAME], [CREDENTIALS]. Individual results may vary.';
      if (keyStr === 'category') return '[Category]';
      if (keyStr === 'time') return val; // Keep timing values
      if (keyStr === 'downtime') return val;
      if (keyStr === 'onset') return val;
      if (keyStr === 'duration') return val;
      if (keyStr === 'location') return '[Location]';
      if (keyStr === 'q') return '[Frequently asked question?]';
      if (keyStr === 'a') return '[Answer to this frequently asked question.]';
      if (keyStr === 'quote') return '[Customer testimonial quote.]';
      if (keyStr === 'author') return '[Customer Name]';
      return '[placeholder text]';
    }
    
    // For string values at depth > 0 that contain BCH content, strip them
    const bchPatterns = [
      'Beyond Concierge', 'BCH', 'Gabrielle', 'Gabby', 'gabby@', 
      'Wellington', 'Palm Beach', 'beyondhealthcarefl', 'ARNP', 'FNP-C'
    ];
    if (bchPatterns.some(p => val.includes(p))) {
      return '[placeholder text]';
    }
    
    return val;
  }
  
  return val;
}

function processServiceJson(content, filePath) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error(`  ✗ Failed to parse JSON: ${filePath}: ${e.message}`);
    return content;
  }
  
  const stripped = stripJsonValue('root', data, 0);
  return JSON.stringify(stripped, null, 2);
}

function processWizardJson(content, filePath) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error(`  ✗ Failed to parse JSON: ${filePath}: ${e.message}`);
    return content;
  }
  
  // For wizard files, do a simple deep text replacement
  function stripWizard(val, key) {
    if (val === null || val === undefined) return val;
    if (Array.isArray(val)) return val.map((v, i) => stripWizard(v, i));
    if (typeof val === 'object') {
      const result = {};
      for (const [k, v] of Object.entries(val)) {
        result[k] = stripWizard(v, k);
      }
      return result;
    }
    if (typeof val === 'boolean' || typeof val === 'number') return val;
    if (typeof val === 'string') {
      const keyStr = String(key).toLowerCase();
      // Keep slugs, IDs, types, icons
      if (['slug', 'id', 'type', 'icon', 'href', 'path', 'route', 'value', 'key'].includes(keyStr)) return val;
      // Check for BCH content
      const bchPatterns = [
        'Beyond Concierge', 'BCH', 'Gabrielle', 'Gabby', 'gabby@',
        'Wellington', 'Palm Beach', 'beyondhealthcarefl', 'ARNP', 'FNP-C',
        '561', 'Florida', 'mangomint'
      ];
      if (bchPatterns.some(p => val.includes(p))) {
        return '[placeholder]';
      }
      // Short strings that look like labels/text
      if (val.length > 3 && !val.startsWith('/') && !val.startsWith('http') && !isSlug(val)) {
        // Could be display text - check for any meaningful text
        if (/[A-Z]/.test(val[0]) || val.includes(' ')) {
          // Likely a display string
          // But don't replace short ones that could be structural
          if (val.length > 20) return '[placeholder]';
        }
      }
      return val;
    }
    return val;
  }
  
  const stripped = stripWizard(data, 'root');
  return JSON.stringify(stripped, null, 2);
}

// ─────────────────────────────────────────────
// CSS PROCESSOR
// ─────────────────────────────────────────────

function processCss(content, filePath) {
  let result = content;
  
  // Replace content: "Beyond Concierge..." etc.
  result = result.replace(/content:\s*["']Beyond Concierge[^"']*["']/gi, 'content: "[COMPANY NAME]"');
  result = result.replace(/content:\s*["']BCH[^"']*["']/gi, 'content: "[COMPANY NAME]"');
  
  // Replace any Cloudinary URLs in CSS
  result = result.replace(
    /url\(['"]?https:\/\/res\.cloudinary\.com\/dcprgumqz\/[^'")\s]+['"]?\)/gi,
    "url('https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image')"
  );
  
  return result;
}

// ─────────────────────────────────────────────
// MARKDOWN / TEXT PROCESSOR
// ─────────────────────────────────────────────

function processMarkdown(content, filePath) {
  let result = content;
  
  // Apply text replacements
  for (const [from, to] of TEXT_REPLACEMENTS) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), to);
  }
  result = result.replace(/\bWellington\b/g, '[CITY]');
  
  // Cloudinary URLs
  result = result.replace(/https:\/\/res\.cloudinary\.com\/dcprgumqz\/[^\s"')>]*/g, PLACEHOLDER_IMAGE);
  
  return result;
}

// ─────────────────────────────────────────────
// NETLIFY TOML PROCESSOR
// ─────────────────────────────────────────────

function processNetlifyToml(content) {
  let result = content;
  
  // Replace BCH-specific redirect rules but keep cache headers
  // Remove redirect blocks that mention BCH domain
  result = result.replace(/beyondhealthcarefl\.com/g, '[DOMAIN]');
  result = result.replace(/beyondconcierge\.netlify\.app/g, '[STAGING URL]');
  result = result.replace(/Beyond Concierge[^"'\n]*/g, '[COMPANY NAME]');
  
  return result;
}

// ─────────────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────────────

const ROOT = __dirname;

console.log('\n═══════════════════════════════════════════');
console.log('  strip-template.js — BCH Content Stripper');
console.log('═══════════════════════════════════════════\n');

// Process HTML files
console.log('📄 Processing HTML files...');
const htmlFiles = walkDir(ROOT, '.html');
for (const fp of htmlFiles) {
  // Skip service pages — they'll be regenerated by build.js
  // Actually we still need to strip partials and main pages
  processFile(fp, processHtml);
}

// Process data/services JSON
console.log('\n📦 Processing data/services JSON files...');
const serviceJsonFiles = walkDir(path.join(ROOT, 'data', 'services'), '.json');
for (const fp of serviceJsonFiles) {
  processFile(fp, processServiceJson);
}

// Process data/wizard JSON
console.log('\n🧙 Processing data/wizard JSON files...');
const wizardJsonFiles = walkDir(path.join(ROOT, 'data', 'wizard'), '.json');
for (const fp of wizardJsonFiles) {
  processFile(fp, processWizardJson);
}

// Process data/static-seo.json if it exists
const staticSeoPath = path.join(ROOT, 'data', 'static-seo.json');
if (fs.existsSync(staticSeoPath)) {
  console.log('\n📊 Processing data/static-seo.json...');
  processFile(staticSeoPath, processServiceJson);
}

// Process CSS files
console.log('\n🎨 Processing CSS files...');
const cssFiles = walkDir(path.join(ROOT, 'css'), '.css');
for (const fp of cssFiles) {
  processFile(fp, processCss);
}

// Process Markdown files
console.log('\n📝 Processing Markdown files...');
const mdFiles = walkDir(ROOT, '.md').filter(f => !f.includes('node_modules'));
for (const fp of mdFiles) {
  processFile(fp, processMarkdown);
}

// Process netlify.toml
const netlifyToml = path.join(ROOT, 'netlify.toml');
if (fs.existsSync(netlifyToml)) {
  console.log('\n⚙️  Processing netlify.toml...');
  processFile(netlifyToml, processNetlifyToml);
}

// Process build-manifest.json
const manifestPath = path.join(ROOT, 'build-manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('\n📋 Processing build-manifest.json...');
  processFile(manifestPath, (content) => {
    let result = content;
    for (const [from, to] of TEXT_REPLACEMENTS) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), to);
    }
    result = result.replace(/\bWellington\b/g, '[CITY]');
    return result;
  });
}

// Process sitemap.xml
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  console.log('\n🗺️  Processing sitemap.xml...');
  processFile(sitemapPath, (content) => {
    return content.replace(/https?:\/\/(?:www\.)?beyondhealthcarefl\.com/g, 'https://[DOMAIN]')
                  .replace(/beyondconcierge\.netlify\.app/g, '[STAGING URL]');
  });
}

// Write generic robots.txt
console.log('\n🤖 Writing generic robots.txt...');
fs.writeFileSync(path.join(ROOT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
console.log('  ✓ robots.txt created');

console.log(`\n═══════════════════════════════════════════`);
console.log(`  ✅ Done! Modified ${totalChanged} files`);
console.log(`═══════════════════════════════════════════\n`);
