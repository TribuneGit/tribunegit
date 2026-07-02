#!/usr/bin/env node
// PHASE 3 — Migrate [COMPANY] assets from Jeff's personal Cloudinary → [COMPANY] Cloudinary
// Downloads from dthdxjmgb, re-uploads to [CLOUDINARY_CLOUD_NAME]
// Output: planning/migrate-log.json

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const FormData = require('form-data');
const os = require('os');

const jeffCreds = JSON.parse(fs.readFileSync('/home/node/.openclaw/workspace/secrets/cloudinary.json'));
const bchCreds = JSON.parse(fs.readFileSync('/home/node/.openclaw/workspace/secrets/cloudinary-bch.json'));
const BASE = path.resolve(__dirname, '..');
const LOG_PATH = path.join(BASE, 'planning', 'migrate-log.json');
const TMP = os.tmpdir();

fs.mkdirSync(path.join(BASE, 'planning'), { recursive: true });
let log = {};
if (fs.existsSync(LOG_PATH)) log = JSON.parse(fs.readFileSync(LOG_PATH));

const ASSETS = [
  // Images
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
  // Videos
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

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', e => { fs.unlink(dest, () => {}); reject(e); });
  });
}

function uploadToCloudinary(filePath, publicId, resourceType) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('public_id', publicId);
    form.append('api_key', bchCreds.key);
    form.append('resource_type', resourceType);

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${bchCreds.api_secret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${bchCreds.cloud_name}/${resourceType}/upload`,
      method: 'POST',
      headers: form.getHeaders(),
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

async function main() {
  console.log(`🔄 Migrating ${ASSETS.length} assets from dthdxjmgb → [CLOUDINARY_CLOUD_NAME]`);
  let done = 0, skipped = 0, failed = 0;

  for (const asset of ASSETS) {
    const key = asset.old_id;
    if (log[key] && log[key].status === 'ok') {
      skipped++;
      continue;
    }

    const srcUrl = `https://res.cloudinary.com/${jeffCreds.cloud_name}/${asset.type}/upload/${asset.old_id}.${asset.fmt}`;
    const tmpFile = path.join(TMP, `bch-migrate-${asset.old_id.replace(/\//g, '-')}.${asset.fmt}`);

    try {
      process.stdout.write(`  ⬇  Downloading ${asset.old_id}...`);
      await download(srcUrl, tmpFile);
      process.stdout.write(` ⬆  Uploading to [COMPANY]...`);
      const result = await uploadToCloudinary(tmpFile, asset.old_id, asset.type);
      fs.unlinkSync(tmpFile);

      log[key] = {
        status: 'ok',
        old_url: srcUrl,
        new_url: result.secure_url,
        public_id: result.public_id,
        resource_type: asset.type,
        uploaded_at: new Date().toISOString(),
      };
      console.log(` ✅`);
      done++;
      fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
    } catch (e) {
      console.log(` ❌ ${e.message}`);
      log[key] = { status: 'error', error: e.message };
      failed++;
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  console.log(`\n✅ Done. Migrated: ${done} | Skipped: ${skipped} | Failed: ${failed}`);
}

main().catch(console.error);
