# CCR Mobile App — Release, OTA & Signing Guide

This guide details how to build, sign, distribute, and publish over-the-air (OTA) updates and plain APK releases for the **Course Coverage Report (CCR)** system.

---

## ⚠️ Critical Android Signing Rules

> [!CAUTION]
> **EVERY RELEASE MUST BE SIGNED WITH THE EXACT SAME KEYSTORE.**
> Android verifies certificate signatures when updating an existing app. If a new APK is signed with a different key, Android will fail with `INSTALL_FAILED_UPDATE_INCOMPATIBLE` and users will be forced to manually uninstall the app (losing un-synced offline SQLite data).
>
> **Action required:** Always back up your release keystore in a secure institutional vault (e.g., 1Password, Bitwarden, or encrypted secure cloud backup). **NEVER commit the keystore or passwords to Git.**

---

## 🔑 Production Keystore Configuration

To sign production release APKs with your institutional key:

1. Create a production keystore (if not already done):
   ```bash
   keytool -genkeypair -v -keystore ccr-release-key.keystore -alias ccr-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Store the keystore outside Git or in a gitignored path (e.g. `frontend/android/app/release.keystore`).
3. Set the following environment variables or place them in `~/.gradle/gradle.properties`:
   ```properties
   CCR_RELEASE_STORE_FILE=../app/release.keystore
   CCR_RELEASE_STORE_PASSWORD=your_keystore_password
   CCR_RELEASE_KEY_ALIAS=ccr-key-alias
   CCR_RELEASE_KEY_PASSWORD=your_key_password
   ```
   *(If not set, `build.gradle` automatically defaults to `debug.keystore` for development and local testing).*

---

## 🚀 Step-by-Step Release Workflow

### Step 1: Bump Version Numbers
Increment `versionCode` (strictly increasing integer) and `versionName` (semantic `x.y.z`).
We provide a one-command bumper that synchronizes `build.gradle`, `app.json`, and `package.json`:
```bash
cd backend
npm run version:bump 1.0.1 2
```
* Syntax: `npm run version:bump <versionName> <versionCode>`

### Step 2: Build Signed Release APK
Navigate to `frontend/android` and run Gradle:
```bash
cd ../frontend/android
./gradlew assembleRelease
```
On Windows:
```powershell
.\gradlew.bat assembleRelease
```
The output APK is generated at:
`frontend/android/app/build/outputs/apk/release/app-release.apk`

### Step 3: Upload to GitHub Releases
1. Create a new release tag on GitHub matching your version name (e.g. `v1.0.1`).
2. Attach the generated `app-release.apk` to the GitHub release.
3. Note the public asset URL, for example:
   `https://github.com/Hariprasath2611/CCR-App/releases/download/v1.0.1/app-release.apk`

### Step 4: Publish Release to Backend (One-Command Publish)
Run the automated release publisher script in `backend`:
```bash
cd ../../backend
npm run release:publish ../frontend/android/app/build/outputs/apk/release/app-release.apk 1.0.1 2 https://github.com/Hariprasath2611/CCR-App/releases/download/v1.0.1/app-release.apk
```
This script automatically:
1. Computes the streaming SHA-256 hash of the APK file.
2. Measures the exact file size in bytes.
3. Authenticates with Render using `ADMIN_RELEASE_TOKEN`.
4. Registers the new release on the backend API.

### Step 5: Verify the Live Endpoints
Test that the public endpoints are active and returning the new version:
```bash
# Check version info
curl "https://ccms-backend-0zmp.onrender.com/api/v1/app/version?versionCode=1"

# Check remote configuration
curl "https://ccms-backend-0zmp.onrender.com/api/v1/app/config"
```

### Step 6: Test on a Real Device
1. Keep the previous APK (`versionCode: 1`) installed on a test Android phone.
2. Launch the app.
3. The app queries `/api/v1/app/version`, displays the "Update Available" ribbon dialog, downloads the APK with real-time percentage progress, verifies the SHA-256 integrity hash, and launches the Android installer.
4. Verify that the app updates seamlessly without data loss or re-login.

---

## 🔄 Emergency Rollback Procedure

If an installed update contains a critical defect, rollback instantly to the previous release without redeploying:
```bash
curl -X POST "https://ccms-backend-0zmp.onrender.com/api/v1/admin/rollback" \
  -H "Authorization: Bearer <ADMIN_RELEASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"target": "release"}'
```
Targets available: `"release"`, `"config"`, or `"all"`.

---

## 📡 Remote Control & Feature Flags (Zero-App-Update Remote Config)

To modify maintenance mode, push announcements, or toggle feature flags without shipping an APK:
```bash
curl -X POST "https://ccms-backend-0zmp.onrender.com/api/v1/admin/config" \
  -H "Authorization: Bearer <ADMIN_RELEASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "maintenance": {
      "enabled": true,
      "title": "Scheduled University Cloud Maintenance",
      "message": "Anna University syllabus servers are undergoing sync. CCR will resume at 4:00 PM.",
      "allowedRoles": ["ADMIN", "PRINCIPAL"]
    },
    "featureFlags": {
      "offlineSyncV2": true,
      "advancedAnalytics": true,
      "pdfExport": true
    },
    "banners": [
      {
        "id": "banner-exam-week",
        "text": "Internal Assessment Week: Please submit syllabus reports by Friday 5 PM.",
        "type": "warning",
        "startsAt": "2026-10-17T00:00:00.000Z",
        "endsAt": "2026-10-24T23:59:59.000Z",
        "dismissible": true
      }
    ],
    "texts": {
      "supportContact": "support@jec.ac.in",
      "loginHelp": "Use your institutional @jec.com account to sign in."
    },
    "theme": {
      "blue": "#2B35E0",
      "amber": "#FFB020",
      "coral": "#FF5D73",
      "mint": "#3DDBB0",
      "ink": "#0E1030"
    }
  }'
```

---

## ⚡ EAS Update & React Native OTA Notes

For Expo / React Native UI and JavaScript updates without native rebuilds:
- **What CAN be updated OTA:** React component hierarchies, styling, theme colors, strings, workflow business logic, images, fonts.
- **What CANNOT be updated OTA (requires new APK via Layer 3):**
  1. Adding new native Android modules or C++ libraries.
  2. Modifying `AndroidManifest.xml` (e.g., adding `REQUEST_INSTALL_PACKAGES` or new permissions).
  3. Updating Gradle dependencies, `compileSdkVersion`, or NDK versions.
  4. React Native engine version upgrades.
