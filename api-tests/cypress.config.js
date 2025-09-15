import { defineConfig } from 'cypress'
import mochawesome from 'cypress-mochawesome-reporter/plugin.js'

export default defineConfig({
  e2e: {
    baseUrl: 'https://reqres.in/api',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    retries: { runMode: 1, openMode: 0 },
    setupNodeEvents(on, config) {
      mochawesome(on)
      return config
    },
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/html',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    reportPageTitle: 'Relatório de Testes de API',
    overwrite: true,
    html: true,
    json: true
  },
  video: false,
})
