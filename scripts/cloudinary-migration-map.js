#!/usr/bin/env node
// PHASE 1 — Generate full URL mapping (no uploads, no changes)
// Output: planning/url-map.json

const fs = require('fs');
const path = require('path');

const BCH_CLOUD = '[CLOUDINARY_CLOUD_NAME]';
const JEFF_CLOUD = 'dthdxjmgb';
const BASE = path.resolve(__dirname, '..');

const map = {};

// --- A) GitHub assets/images/* → [COMPANY] Cloudinary ---
const imgDir = path.join(BASE, 'assets', 'images');
const imgFiles = fs.readdirSync(imgDir).filter(f =>
  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
);

for (const f of imgFiles) {
  const ext = path.extname(f).toLowerCase().replace('.', '');
  const nameNoExt = path.basename(f, path.extname(f));
  const oldRelative = `assets/images/${f}`;
  const newUrl = `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/${nameNoExt}.${ext}`;
  map[oldRelative] = newUrl;
  // Also map with leading ./
  map[`./${oldRelative}`] = newUrl;
}

// https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image
if (fs.existsSync(path.join(BASE, 'assets', 'logo.jpg'))) {
  map['https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image'] = `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/logo.jpg`;
  map['https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image'] = `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/logo.jpg`;
}

// --- B) Jeff personal Cloudinary → [COMPANY] Cloudinary (images) ---
const jeffImageAssets = [
  { old_id: '[company-slug]/bch-[SERVICE NAME]-v1', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-[SERVICE NAME]-prp-v1', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-[SERVICE NAME]-prp-v2', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-payment-plans-hero', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/bch-pricing-hero', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/bch-prp-facial-hair-v1', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-prp-facial-hair-v2', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-service-area-map-v1', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-service-area-map-v2', fmt: 'png', type: 'image' },
  { old_id: '[company-slug]/bch-skin-rejuvenation-promo', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/gabby-og-image', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/logo', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/logo-reference', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/logo-reference-hq', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/logo-reference-hq-padded', fmt: 'jpg', type: 'image' },
  { old_id: '[company-slug]/services-hero-v4', fmt: 'webp', type: 'image' },
  { old_id: '[company-slug]/white-start-frame', fmt: 'jpg', type: 'image' },
];

const jeffVideoAssets = [
  { old_id: '[company-slug]/botox-commercial-v1', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/healthcare-reel-v1', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/healthcare-reel-v2', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/hero-loop-v1', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/iv-therapy-commercial-v1', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/logo-animation-v1', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/logo-animation-v2', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/logo-animation-v3', fmt: 'mp4', type: 'video' },
  { old_id: '[company-slug]/logo-animation-v4', fmt: 'mp4', type: 'video' },
];

// Map all variants of Jeff's URLs (with and without version numbers)
for (const asset of [...jeffImageAssets, ...jeffVideoAssets]) {
  const resType = asset.type === 'video' ? 'video' : 'image';
  const name = asset.old_id.split('/').pop();
  const newUrl = `https://res.cloudinary.com/${BCH_CLOUD}/${resType}/upload/f_auto,q_auto/${asset.old_id}.${asset.fmt}`;
  const newUrlClean = `https://res.cloudinary.com/${BCH_CLOUD}/${resType}/upload/${asset.old_id}.${asset.fmt}`;

  // Without version
  const oldBase = `https://res.cloudinary.com/${JEFF_CLOUD}/${resType}/upload/`;
  // We'll map the full known URLs used in the codebase
  map[`https://res.cloudinary.com/${JEFF_CLOUD}/${resType}/upload/f_auto,q_auto/${asset.old_id}`] = newUrl;
  map[`https://res.cloudinary.com/${JEFF_CLOUD}/${resType}/upload/f_auto,q_auto/${asset.old_id}.${asset.fmt}`] = newUrl;
  map[`https://res.cloudinary.com/${JEFF_CLOUD}/${resType}/upload/${asset.old_id}`] = newUrlClean;
  map[`https://res.cloudinary.com/${JEFF_CLOUD}/${resType}/upload/${asset.old_id}.${asset.fmt}`] = newUrlClean;
}

// Map versioned URLs (the ones actually found in the codebase)
const versionedMappings = [
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/v1780438192/[company-slug]/bch-[SERVICE NAME]-v1.png`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-[SERVICE NAME]-v1.png`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/v1780438931/[company-slug]/bch-[SERVICE NAME]-prp-v2.png`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-[SERVICE NAME]-prp-v2.png`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/v1780438932/[company-slug]/bch-prp-facial-hair-v2.png`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-prp-facial-hair-v2.png`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/v1780511456/[company-slug]/gabby-og-image.jpg`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/[company-slug]/gabby-og-image.jpg`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/video/upload/e_accelerate:300/v1779997688/[company-slug]/logo-animation-v4.mp4`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/video/upload/e_accelerate:300/[company-slug]/logo-animation-v4.mp4`,
  },
  // Without .mp4 extension
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-payment-plans-hero.jpg`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-payment-plans-hero.jpg`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-pricing-hero.jpg`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-pricing-hero.jpg`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-skin-rejuvenation-promo.jpg`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-skin-rejuvenation-promo.jpg`,
  },
  {
    old: `https://res.cloudinary.com/${JEFF_CLOUD}/image/upload/f_auto,q_auto/v1780450063/[company-slug]/bch-service-area-map-v2.png`,
    new: `https://res.cloudinary.com/${BCH_CLOUD}/image/upload/f_auto,q_auto/[company-slug]/bch-service-area-map-v2.png`,
  },
];

for (const m of versionedMappings) {
  map[m.old] = m.new;
}

const outPath = path.join(BASE, 'planning', 'url-map.json');
fs.mkdirSync(path.join(BASE, 'planning'), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(map, null, 2));

console.log(`✅ URL map generated: ${Object.keys(map).length} mappings → ${outPath}`);

// Print a sample
const keys = Object.keys(map).slice(0, 5);
console.log('\nSample mappings:');
for (const k of keys) console.log(`  ${k}\n  → ${map[k]}\n`);
