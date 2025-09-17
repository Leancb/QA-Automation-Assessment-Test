// wdio.conf.js
/**
 * WDIO config — mobile-tests (CI-safe)
 */
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = path.resolve(__dirname, 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

// ---- Appium/Server defaults (evita "Invalid URL" quando env vem vazia) ----
const APPIUM_HOST = (process.env.APPIUM_HOST || '127.0.0.1').trim();
const APPIUM_PORT = Number(process.env.APPIUM_PORT || 4723);
const rawBase = (process.env.APPIUM_BASE_PATH || '/').trim();
const APPIUM_BASE_PATH = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;

const AVD_NAME = process.env.AVD_NAME || 'Pixel_5_API_30';

exports.config = {
  runner: 'local',
  specs: ['./test/specs/**/*.e2e.js'],
  maxInstances: 1,

  // URL explícita do servidor (alinha com o serviço do Appium abaixo)
  protocol: 'http',
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: APPIUM_BASE_PATH, // Appium 2: '/'. Se usar '/wd/hub', alinhar o service.

  logLevel: 'info',

  framework: 'mocha',
  mochaOpts: { timeout: 120000 },

  reporters: ['spec'],

  services: [
    ['appium', {
      // O serviço sobe o Appium com os mesmos parâmetros do WDIO
      args: {
        address: APPIUM_HOST,
        port: APPIUM_PORT,
        // Para Appium 2 o padrão é '/', deixe assim.
        // Se quiser usar /wd/hub, troque AQUI e também config.path acima.
        'base-path': APPIUM_BASE_PATH,
        relaxedSecurity: true,
        // opcionalmente: allowCors: true
      },
    }]
  ],

  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    // use o emulador que o runner já iniciou
    'appium:udid': process.env.ANDROID_UDID || 'emulator-5554',
    'appium:autoGrantPermissions': true,
    'appium:appWaitActivity': '*',
    maxInstances: 1,
  }],
  /**
   * Hooks
   */
  before: async function () {
    const url = `http://${APPIUM_HOST}:${APPIUM_PORT}${APPIUM_BASE_PATH}`;
    try { new URL(url); }
    catch (e) { throw new Error(`Appium URL inválida no CI: ${url}`); }
    console.log('[WDIO] Appium URL:', url);
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
