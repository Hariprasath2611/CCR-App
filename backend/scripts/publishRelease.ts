import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import https from 'https';

/**
 * Script to publish an APK release to the CCR backend API
 * Usage:
 *   npx ts-node scripts/publishRelease.ts [apkPath] [versionName] [versionCode] [apkUrl]
 * Or via env vars:
 *   APK_PATH, VERSION_NAME, VERSION_CODE, MIN_SUPPORTED_VERSION_CODE, APK_URL, ADMIN_RELEASE_TOKEN, BACKEND_URL
 */

const defaultApkPath = path.resolve(__dirname, '../../../APK/app-release.apk');
const apkPath = process.argv[2] || process.env.APK_PATH || defaultApkPath;

if (!fs.existsSync(apkPath)) {
  console.error(`❌ APK file not found at: ${apkPath}`);
  console.error(`Please provide a valid path to your built release APK.`);
  process.exit(1);
}

// 1. Calculate file stats & SHA-256 hash
console.log(`📦 Analyzing APK: ${apkPath}`);
const apkStats = fs.statSync(apkPath);
const apkSizeBytes = apkStats.size;

const fileBuffer = fs.readFileSync(apkPath);
const apkSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

console.log(`  Size: ${(apkSizeBytes / (1024 * 1024)).toFixed(2)} MB (${apkSizeBytes} bytes)`);
console.log(`  SHA-256: ${apkSha256}`);

// 2. Read metadata
const versionName = process.argv[3] || process.env.VERSION_NAME || '1.0.0';
const versionCode = parseInt(process.argv[4] || process.env.VERSION_CODE || '1', 10);
const minSupportedVersionCode = parseInt(process.env.MIN_SUPPORTED_VERSION_CODE || '1', 10);
const channel = process.env.CHANNEL || 'stable';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const adminToken = process.env.ADMIN_RELEASE_TOKEN || 'ccr_admin_secret_token_dev_2026';

const defaultApkUrl = `https://github.com/Hariprasath2611/CCR-App/releases/download/v${versionName}/app-release.apk`;
const apkUrl = process.argv[5] || process.env.APK_URL || defaultApkUrl;

const releaseNotes = process.env.RELEASE_NOTES
  ? process.env.RELEASE_NOTES.split(';').map((s) => s.trim())
  : [
      `CCR Release v${versionName} (Build ${versionCode})`,
      'Over-the-air remote configuration updates',
      'Stability enhancements and syllabus syncing optimizations',
    ];

const payload = JSON.stringify({
  latestVersionName: versionName,
  latestVersionCode: versionCode,
  minSupportedVersionCode,
  apkUrl,
  apkSha256,
  apkSizeBytes,
  releaseNotes,
  channel,
});

console.log(`\n🚀 Publishing Release to ${backendUrl}/api/v1/admin/release ...`);
console.log(`  Version Name: ${versionName}`);
console.log(`  Version Code: ${versionCode}`);
console.log(`  Min Supported Version Code: ${minSupportedVersionCode}`);
console.log(`  Channel: ${channel}`);
console.log(`  APK URL: ${apkUrl}`);

const urlObj = new URL(`${backendUrl}/api/v1/admin/release`);
const client = urlObj.protocol === 'https:' ? https : http;

const req = client.request(
  urlObj,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      Authorization: `Bearer ${adminToken}`,
    },
  },
  (res) => {
    let responseBody = '';
    res.on('data', (chunk) => (responseBody += chunk));
    res.on('end', () => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`\n✅ Release successfully published! Response:`);
        console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
      } else {
        console.error(`\n❌ Failed to publish release (HTTP ${res.statusCode}):`);
        console.error(responseBody);
        process.exit(1);
      }
    });
  }
);

req.on('error', (err) => {
  console.error(`\n❌ Network error while publishing release:`, err.message);
  process.exit(1);
});

req.write(payload);
req.end();
