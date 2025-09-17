.conf.js
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = path.resolve(__dirname, 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

// Defaults seguros p/ Appium URL
const APPIUM_HOST = (process.env.APPIUM_HOST || '127.0.0.1').trim();
const APPIUM_PORT = Number(process.env.APPIUM_PORT || 4723);
const rawBase = (process.env.APPIUM_BASE_PATH || '/').trim();
const APPIUM_BASE_PATH = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;

const AVD_UDID = process.env.ANDROID_UDID || 'emulator-5554';

// ---- App under test por ENV ----
const ANDROID_APP_APK = process.env.ANDROID_APP_APK; // ex: mobile-tests/apps/app-debug.apk
const ANDROID_APP_PACKAGE = process.env.ANDROID_APP_PACKAGE; // ex: com.wdiodemoapp
const ANDROID_APP_ACTIVITY = process.env.ANDROID_APP_ACTIVITY; // ex: .MainActivity

// Monta caps do app (APK OU package/activity)
const appCaps = {};
if (ANDROID_APP_APK) {
  appCaps['appium:app'] = path.resolve(__dirname, ANDROID_APP_APK);
} else if (ANDROID_APP_PACKAGE && ANDROID_APP_ACTIVITY) {
  appCaps['appium:appPackage'] = ANDROID_APP_PACKAGE;
  appCaps['appium:appActivity'] = ANDROID_APP_ACTIVITY;
  appCaps['appium:appWaitActivity'] = '*';
}

exports.config = {
  runner: 'local',
  specs: ['./test/specs/**/*.e2e.js'],
  maxInstances: 1,

  protocol: 'http',
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: APPIUM_BASE_PATH, // Appium 2 => '/'

  // Logs do WDIO em arquivo + console
  logLevel: 'debug',
  outputDir: path.resolve(__dirname, 'logs', 'wdio'),

  framework: 'mocha',
  mochaOpts: { timeout: 120000 },

  reporters: [
    'spec',
    // opcional: Allure
    // ['allure', { outputDir: path.resolve(__dirname, 'allure-results'), useCucumberStepReporter: false }]
  ],

  services: [
    ['appium', {
      // Usa o binário via npx, então não precisa do appium instalado como dep do projeto
      command: 'npx appium',
      logPath: path.resolve(__dirname, 'logs'), // appium.log ficará aqui
      args: {
        address: APPIUM_HOST,
        port: APPIUM_PORT,
        'base-path': APPIUM_BASE_PATH,
        relaxedSecurity: true
      }
    }]
  ],

  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:udid': AVD_UDID,          // conecta no emulador já iniciado pelo runner
    'appium:autoGrantPermissions': true,
    ...appCaps,
    maxInstances: 1,
  }],

  before: async function () {
    const url = `http://${APPIUM_HOST}:${APPIUM_PORT}${APPIUM_BASE_PATH}`;
    try { new URL(url); } catch (e) { throw new Error(`Appium URL inválida: ${url}`); }
    console.log('[WDIO] Appium URL:', url);
    console.log('[WDIO] Using UDID:', AVD_UDID);
    if (ANDROID_APP_APK) console.log('[WDIO] APK:', path.resolve(__dirname, ANDROID_APP_APK));
    if (ANDROID_APP_PACKAGE) console.log('[WDIO] appPackage:', ANDROID_APP_PACKAGE, 'appActivity:', ANDROID_APP_ACTIVITY);
  },

  afterTest: async function (test, context, { error }) {
    if (!error) return;
    try {
      const ts = Date.now();
      const safe = (s) => String(s || '').replace(/[^\w\d\-_.]+/g, '_').slice(0, 80);
      const name = `${ts}_${safe(test.parent)}_${safe(test.title)}`;

      try {
        const png = await browser.takeScreenshot();
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}.png`), png, 'base64');
      } catch (e) { console.error('[afterTest] screenshot error:', e?.message || e); }

      try {
        const xml = await browser.getPageSource();
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}.xml`), xml);
      } catch (e) { console.error('[afterTest] pageSource error:', e?.message || e); }
    } catch (e) {
      console.error('[afterTest] artifact write error:', e?.message || e);
    }
  }
};