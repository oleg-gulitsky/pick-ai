const fs = require('fs');
// const plist = require('plist');

const packageJson = require('../package.json');
const newVersion = packageJson.version;

// === Android ===
const buildGradlePath = './android/app/build.gradle';
let gradle = fs.readFileSync(buildGradlePath, 'utf8');

gradle = gradle.replace(/versionName ".*?"/, `versionName "${newVersion}"`);

let versionCodeMatch = gradle.match(/versionCode (\d+)/);
if (versionCodeMatch) {
  const newVersionCode = parseInt(versionCodeMatch[1], 10) + 1;
  gradle = gradle.replace(/versionCode \d+/, `versionCode ${newVersionCode}`);
}

fs.writeFileSync(buildGradlePath, gradle);

// === iOS ===
// const plistPath = './ios/YourAppName/Info.plist'; // замените на свое имя папки
// const plistContent = fs.readFileSync(plistPath, 'utf8');
// const parsedPlist = plist.parse(plistContent);

// parsedPlist.CFBundleShortVersionString = newVersion;
// parsedPlist.CFBundleVersion = `${
//   parseInt(parsedPlist.CFBundleVersion || '0') + 1
// }`;

// const updatedPlist = plist.build(parsedPlist);
// fs.writeFileSync(plistPath, updatedPlist);

console.log(`✅ Native versions updated to ${newVersion}`);
