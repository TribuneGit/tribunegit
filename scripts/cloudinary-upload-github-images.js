#!/usr/bin/env node
// PHASE 2 — Upload all GitHub-stored images to [COMPANY] Cloudinary ([CLOUDINARY_CLOUD_NAME])
// Idempotent: skips already-uploaded files
// Output: planning/upload-log.json

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

const creds = JSON.parse(fs.readFileSync('/home/node/.openclaw/workspace/secrets/cloudinary-bch.json'));
const BASE = path.resolve(__dirname, '..');
const LOG_PATH = path.join(BASE, 'planning', 'upload-log.json');

fs.mkdirSync(path.join(BASE, 'planning'), { recursive: true });

let log = {};
if (fs.existsSync(LOG_PATH)) {
  log = JSON.parse(fs.readFileSync(LOG_PATH));
}

function uploadToCloudinary(filePath, publicId) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('public_id', publicId);
    form.append('upload_preset', '');
    form.append('api_key', creds.key);

    // Generate signature
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${creds.api_secret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    form.append('timestamp', String(timestamp));
    form.append('signature', signature);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${creds.cloud_name}/image/upload`,
      method: 'POST',
      headers: form.getHeaders(),
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
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
  const imgDir = path.join(BASE, 'assets', 'images');
  const files = fs.readdirSync(imgDir).filter(f =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
  );

  // Also include https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image
  const allFiles = files.map(f => ({ src: path.join(imgDir, f), name: f }));
  if (fs.existsSync(path.join(BASE, 'assets', 'logo.jpg'))) {
    allFiles.push({ src: path.join(BASE, 'assets', 'logo.jpg'), name: 'logo.jpg' });
  }

  console.log(`📦 ${allFiles.length} files to upload to [CLOUDINARY_CLOUD_NAME]`);
  let uploaded = 0, skipped = 0, failed = 0;

  for (const { src, name } of allFiles) {
    const nameNoExt = path.basename(name, path.extname(name));
    const publicId = `${nameNoExt}`;

    if (log[publicId] && log[publicId].status === 'ok') {
      skipped++;
      continue;
    }

    try {
      const result = await uploadToCloudinary(src, publicId);
      log[publicId] = {
        status: 'ok',
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        uploaded_at: new Date().toISOString(),
      };
      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`  ✅ ${uploaded}/${allFiles.length - skipped} uploaded...`);
        fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
      }
    } catch (e) {
      console.error(`  ❌ FAILED: ${name} — ${e.message}`);
      log[publicId] = { status: 'error', error: e.message, name };
      failed++;
    }
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  console.log(`\n✅ Done. Uploaded: ${uploaded} | Skipped (already done): ${skipped} | Failed: ${failed}`);
  console.log(`Log saved to: ${LOG_PATH}`);
}

main().catch(console.error);
