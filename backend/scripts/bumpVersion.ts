import fs from 'fs';
import path from 'path';

/**
 * Script to bump versionCode and versionName across the project
 * Usage:
 *   npx ts-node scripts/bumpVersion.ts [newVersionName] [newVersionCode]
 */

const rootDir = path.resolve(__dirname, '../..');
const gradlePath = path.join(rootDir, 'frontend/android/app/build.gradle');
const appJsonPath = path.join(rootDir, 'frontend/app.json');
const packageJsonPath = path.join(rootDir, 'frontend/package.json');

// 1. Read gradle file
let gradleContent = fs.readFileSync(gradlePath, 'utf8');

const codeMatch = gradleContent.match(/versionCode\s+(\d+)/);
const nameMatch = gradleContent.match(/versionName\s+"([^"]+)"/);

if (!codeMatch || !nameMatch) {
  console.error('❌ Could not locate versionCode or versionName in build.gradle');
  process.exit(1);
}

const currentVersionCode = parseInt(codeMatch[1], 10);
const currentVersionName = nameMatch[1];

let nextVersionCode = currentVersionCode + 1;
if (process.argv[3]) {
  nextVersionCode = parseInt(process.argv[3], 10);
}

let nextVersionName = process.argv[2];
if (!nextVersionName) {
  const parts = currentVersionName.split('.').map((n) => parseInt(n, 10));
  if (parts.length === 3 && !isNaN(parts[2])) {
    parts[2] += 1;
    nextVersionName = parts.join('.');
  } else {
    nextVersionName = `${currentVersionName}-next`;
  }
}

console.log(`\n🔄 Bumping version:`);
console.log(`  Version Name: ${currentVersionName} -> ${nextVersionName}`);
console.log(`  Version Code: ${currentVersionCode} -> ${nextVersionCode}`);

// 2. Update build.gradle
gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${nextVersionCode}`);
gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "${nextVersionName}"`);
fs.writeFileSync(gradlePath, gradleContent, 'utf8');
console.log(`  ✅ Updated frontend/android/app/build.gradle`);

// 3. Update app.json
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (appJson.expo) {
    appJson.expo.version = nextVersionName;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    console.log(`  ✅ Updated frontend/app.json`);
  }
}

// 4. Update package.json
if (fs.existsSync(packageJsonPath)) {
  const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  pkgJson.version = nextVersionName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkgJson, null, 2) + '\n', 'utf8');
  console.log(`  ✅ Updated frontend/package.json`);
}

console.log(`\n🎉 Version successfully bumped to ${nextVersionName} (${nextVersionCode})\n`);
