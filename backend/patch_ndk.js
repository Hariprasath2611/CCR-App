const fs = require('fs');

function patchNdk(version) {
  const p = `C:/Users/D Hariprasath/AppData/Local/Android/Sdk/ndk/${version}/build/cmake/android-legacy.toolchain.cmake`;
  if (!fs.existsSync(p)) {
    console.log(`Path not found: ${p}`);
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  if (content.includes('list(APPEND ANDROID_CXX_STANDARD_LIBRARIES "-lc++_shared")')) {
    console.log(`${version} already patched.`);
    return;
  }
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex(l => l.includes('ANDROID_STL STREQUAL c++_shared'));
  if (idx !== -1) {
    lines.splice(idx + 1, 0, '  list(APPEND ANDROID_CXX_STANDARD_LIBRARIES "-lc++_shared")');
    fs.writeFileSync(p, lines.join('\r\n'), 'utf8');
    console.log(`Successfully patched ${version} at line ${idx + 1}`);
  } else {
    console.log(`Could not find target line in ${version}`);
  }
}

patchNdk('27.1.12297006');
patchNdk('27.0.12077973');
