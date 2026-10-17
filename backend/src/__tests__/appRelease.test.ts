import assert from 'assert';
import { AppReleaseService } from '../services/appRelease.service';
import {
  publishReleaseSchema,
  updateConfigSchema,
  hexColorSchema,
} from '../validators/appRelease.schema';

console.log('🧪 Starting CCR App Release & Remote Config Test Automation Suite...\n');

let passedTests = 0;
let totalTests = 0;

async function testAsync(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${error.message}\n`);
  }
}

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${error.message}\n`);
  }
}

(async () => {
  // ── TEST SUITE 1: VERSION COMPARISON & UPDATE LOGIC ──
  console.log('📌 Testing Version Comparison & Forced/Optional Update Logic:');

    await AppReleaseService._resetForTesting();

  await testAsync('Optional update: caller versionCode is 1, latest is 1, min is 1', async () => {
    const res = await AppReleaseService.getVersion({
      platform: 'android',
      versionCode: 1,
      versionName: '1.0.0',
      channel: 'stable',
    });
    assert.strictEqual(res.latestVersionCode, 1);
    assert.strictEqual(res.minSupportedVersionCode, 1);
    assert.strictEqual(res.forceUpdate, false, 'forceUpdate should be false when versionCode >= minSupported');
  });

  await testAsync('Forced update: caller versionCode is below minSupportedVersionCode', async () => {
    // Publish a release with minSupportedVersionCode = 3
    await AppReleaseService.publishRelease({
      latestVersionName: '2.0.0',
      latestVersionCode: 5,
      minSupportedVersionCode: 3,
      apkUrl: 'https://github.com/Hariprasath2611/CCR-App/releases/download/v2.0.0/app-release.apk',
      apkSha256: 'a'.repeat(64),
      apkSizeBytes: 90000000,
      releaseNotes: ['Mandatory security and architecture update'],
      channel: 'stable',
    });

    // Caller on versionCode 2 (< 3)
    const oldCaller = await AppReleaseService.getVersion({
      platform: 'android',
      versionCode: 2,
      versionName: '1.1.0',
      channel: 'stable',
    });
    assert.strictEqual(oldCaller.forceUpdate, true, 'forceUpdate must be true when caller versionCode < minSupported');

    // Caller on versionCode 3 (>= 3)
    const validCaller = await AppReleaseService.getVersion({
      platform: 'android',
      versionCode: 3,
      versionName: '1.2.0',
      channel: 'stable',
    });
    assert.strictEqual(validCaller.forceUpdate, false, 'forceUpdate must be false when caller versionCode >= minSupported');
  });

  // ── TEST SUITE 2: CONFIG & THEME VALIDATION ──
  console.log('\n📌 Testing Config & Theme Schema Validation:');

  test('Theme Hex Validator: Accepts valid 6-char and 8-char hex colors', () => {
    assert.doesNotThrow(() => hexColorSchema.parse('#2B35E0'));
    assert.doesNotThrow(() => hexColorSchema.parse('#FFB020'));
    assert.doesNotThrow(() => hexColorSchema.parse('#FF5D73FF'));
  });

  test('Theme Hex Validator: Rejects invalid color strings', () => {
    assert.throws(() => hexColorSchema.parse('blue'));
    assert.throws(() => hexColorSchema.parse('#ZZZ'));
    assert.throws(() => hexColorSchema.parse('#12345')); // 5 chars
  });

  test('Config Validator: Rejects missing required maintenance fields', () => {
    const invalidConfig = {
      maintenance: { enabled: true }, // missing title, message
      featureFlags: {},
      banners: [],
      texts: {},
    };
    const res = updateConfigSchema.safeParse(invalidConfig);
    assert.strictEqual(res.success, false, 'Should fail validation when maintenance title/message are missing');
  });

  test('Config Validator: Accepts valid config payload', () => {
    const validConfig = {
      maintenance: {
        enabled: false,
        title: 'Maintenance',
        message: 'Under maintenance',
        allowedRoles: ['ADMIN'],
      },
      featureFlags: { offlineSyncV2: true },
      banners: [
        {
          id: 'test-banner',
          text: 'Notice',
          type: 'info' as const,
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 86400000).toISOString(),
          dismissible: true,
        },
      ],
      texts: { contact: 'support@jec.ac.in' },
      theme: { blue: '#2B35E0', amber: '#FFB020' },
      minSupportedVersionCode: 1,
    };
    const res = updateConfigSchema.safeParse(validConfig);
    assert.strictEqual(res.success, true, 'Valid config should pass validation');
  });

  // ── TEST SUITE 3: RELEASE SCHEMA VALIDATION ──
  console.log('\n📌 Testing Release Payload Validation:');

  test('Release Validator: Enforces HTTPS URL', () => {
    const insecureRelease = {
      latestVersionName: '1.0.1',
      latestVersionCode: 2,
      minSupportedVersionCode: 1,
      apkUrl: 'http://insecure-site.com/app.apk',
      apkSha256: 'a'.repeat(64),
      releaseNotes: ['Note'],
      channel: 'stable' as const,
    };
    const res = publishReleaseSchema.safeParse(insecureRelease);
    assert.strictEqual(res.success, false, 'Should reject non-HTTPS URLs');
  });

  test('Release Validator: Enforces 64-character SHA-256 hash', () => {
    const invalidHash = {
      latestVersionName: '1.0.1',
      latestVersionCode: 2,
      minSupportedVersionCode: 1,
      apkUrl: 'https://example.com/app.apk',
      apkSha256: 'short-hash',
      releaseNotes: ['Note'],
      channel: 'stable' as const,
    };
    const res = publishReleaseSchema.safeParse(invalidHash);
    assert.strictEqual(res.success, false, 'Should reject invalid length SHA-256');
  });

  // ── TEST SUITE 4: ROLLBACK MECHANISM ──
  console.log('\n📌 Testing Reversibility and Rollback:');

  await testAsync('Release Rollback restores previous state', async () => {
    await AppReleaseService._resetForTesting();

    // 1. Initial state is 1.0.0 (code 1)
    const initial = await AppReleaseService.getVersion({ platform: 'android', versionCode: 1, channel: 'stable' });
    assert.strictEqual(initial.latestVersionCode, 1);

    // 2. Publish new version 1.1.0 (code 2)
    await AppReleaseService.publishRelease({
      latestVersionName: '1.1.0',
      latestVersionCode: 2,
      minSupportedVersionCode: 1,
      apkUrl: 'https://github.com/Hariprasath2611/CCR-App/releases/download/v1.1.0/app-release.apk',
      apkSha256: 'b'.repeat(64),
      releaseNotes: ['Update 1.1'],
      channel: 'stable',
    });

    const updated = await AppReleaseService.getVersion({ platform: 'android', versionCode: 1, channel: 'stable' });
    assert.strictEqual(updated.latestVersionCode, 2);

    // 3. Rollback release
    const rolledBack = await AppReleaseService.rollback('release');
    assert.strictEqual(rolledBack.release.latestVersionCode, 1, 'Should restore versionCode 1');

    const afterRollback = await AppReleaseService.getVersion({ platform: 'android', versionCode: 1, channel: 'stable' });
    assert.strictEqual(afterRollback.latestVersionCode, 1, 'State after rollback should be 1');
  });

  await testAsync('Rollback throws error when no previous state exists', async () => {
    await AppReleaseService._resetForTesting();
    try {
      await AppReleaseService.rollback('release');
      assert.fail('Should have thrown an error');
    } catch (err: any) {
      assert.ok(err.message.includes('No previous release state'));
    }
  });

  // ── TEST SUITE 5: BACKWARD COMPATIBILITY OF ROUTE ALIASES ──
  console.log('\n📌 Testing Route Aliases (/api/v1 and /v1):');

  await testAsync('Both /api/v1/app/version and /v1/app/version respond with 200 and version data', async () => {
    const app = (await import('../app')).default;
    const http = await import('http');

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    const fetchJson = (pathStr: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}${pathStr}`, (res) => {
          let body = '';
          res.on('data', (d) => (body += d));
          res.on('end', () => {
            if (res.statusCode !== 200) {
              return reject(new Error(`Expected 200 from ${pathStr}, got ${res.statusCode}`));
            }
            resolve(JSON.parse(body));
          });
        }).on('error', reject);
      });
    };

    try {
      const v1Data = await fetchJson('/v1/app/version');
      const apiV1Data = await fetchJson('/api/v1/app/version');

      assert.strictEqual(v1Data.latestVersionCode, apiV1Data.latestVersionCode);
      assert.strictEqual(v1Data.latestVersionName, apiV1Data.latestVersionName);

      const v1Config = await fetchJson('/v1/app/config');
      const apiV1Config = await fetchJson('/api/v1/app/config');
      assert.strictEqual(v1Config.configVersion, apiV1Config.configVersion);
    } finally {
      server.close();
    }
  });

  console.log(`\n======================================================`);
  console.log(`📊 App Release Suite Result: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`======================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
