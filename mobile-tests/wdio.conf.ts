// wdio.conf.ts
import type { Options } from '@wdio/types'
import path from 'path'
import allure from '@wdio/allure-reporter'

// >>> Força Allure a salvar SEMPRE em mobile-tests/reports/allure/raw
const isInsideMobileTests = /(^|[\\/])mobile-tests([\\/])?$/.test(__dirname)
const ALLURE_RAW = isInsideMobileTests
  ? path.resolve(__dirname, 'reports', 'allure', 'raw')
  : path.resolve(__dirname, 'mobile-tests', 'reports', 'allure', 'raw')

export const config: Options.Testrunner = {
  runner: 'local',

  specs: ['./test/specs/**/*.js'],
  maxInstances: 1,

  // Appium via service
  hostname: '127.0.0.1',
  port: 4725,
  path: '/',
  services: [[
    'appium',
    {
      args: {
        address: '127.0.0.1',
        port: 4725,
        basePath: '/',
        relaxedSecurity: true,
        logLevel: 'info',
        allowCors: true,
        useDrivers: 'uiautomator2',
      }
    }
  ]],

  logLevel: 'info',

  framework: 'mocha',
  mochaOpts: { timeout: 240000 },

  // Spec + Allure (escrevendo no ALLURE_RAW calculado acima)
  reporters: [
    'spec',
    ['allure', {
      outputDir: ALLURE_RAW,
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false
    }] as any
  ],

  // Capabilities Android (UiAutomator2)
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:app': path.join(__dirname, 'app', 'demo.apk'),
    'appium:noReset': true,
    'appium:newCommandTimeout': 240,
    'appium:ignoreHiddenApiPolicyError': true,
    'appium:disableWindowAnimation': true,
    'appium:adbExecTimeout': 120000,
    'appium:uiautomator2ServerInstallTimeout': 120000,
    'appium:uiautomator2ServerLaunchTimeout': 120000,
  }],

  // Metadados no Allure
  before: function (capabilities, _specs) {
    const caps = capabilities as any
    try {
      const deviceName = caps['appium:deviceName'] || caps.deviceName || ''
      const platformVer = caps['appium:platformVersion'] || caps.platformVersion || ''
      const automation = caps['appium:automationName'] || caps.automationName || ''
      allure.addEnvironment('Device', String(deviceName))
      allure.addEnvironment('Platform', `${caps.platformName || ''} ${platformVer}`)
      allure.addEnvironment('Automation', String(automation))
    } catch {}
  },

  // Em falha: screenshot + XML da tela
  afterTest: async function (_test, _context, { error, passed }) {
    if (!passed) {
      try { await browser.takeScreenshot() } catch {}
      try {
        const xml = await browser.getPageSource()
        allure.addAttachment('UI hierarchy (XML)', xml, 'text/xml')
      } catch {}
      if (error) {
        try { allure.addAttachment('Error stack', String(error.stack || error), 'text/plain') } catch {}
      }
    }
  }
}
