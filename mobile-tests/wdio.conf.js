/**
 * WDIO config — mobile-tests (updated)
 * - Runs specs in series (maxInstances: 1) to avoid race on single emulator
 * - Captures screenshot + pageSource on failure into ./artifacts
 * - Adds sensible Appium caps for CI robustness
 */
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = path.resolve(__dirname, 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

exports.config = {
  runner: 'local',
  specs: [
    './test/specs/**/*.e2e.js'
  ],
  maxInstances: 1, // <— run in series on the same emulator
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    // IMPORTANT: make sure these next two match your setup or are overridden in CI
    // 'appium:appPackage': 'com.wdiodemoapp',
    // 'appium:appActivity': '.MainActivity',
    'appium:autoGrantPermissions': true,
    'appium:appWaitActivity': '*',
    maxInstances: 1,
  }],
  logLevel: 'info',
  framework: 'mocha',
  mochaOpts: {
    timeout: 120000
  },
  reporters: ['spec'],

  /**
   * Hooks
   */
  before: async function (capabilities, specs) {
    // Optionally add global helpers here
  },

  afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    if (!error) return;
    try {
      const ts = Date.now();
      const safe = (s) => s.replace(/[^\w\d\-_.]+/g, '_').slice(0, 80);
      const name = `${ts}_${safe(test.parent || 'suite')}_${safe(test.title || 'test')}`;

      // Screenshot
      try {
        const png = await browser.takeScreenshot();
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}.png`), png, 'base64');
      } catch (e) { console.error('[afterTest] screenshot error:', e?.message || e); }

      // Page source
      try {
        const xml = await browser.getPageSource();
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `${name}.xml`), xml);
      } catch (e) { console.error('[afterTest] pageSource error:', e?.message || e); }
    } catch (e) {
      console.error('[afterTest] artifact write error:', e?.message || e);
    }
  }
};
