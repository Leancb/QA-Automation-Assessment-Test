import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import * as cucumber from "@badeball/cypress-cucumber-preprocessor";
import * as cucumberEsbuild from "@badeball/cypress-cucumber-preprocessor/esbuild";
import mochawesome from "cypress-mochawesome-reporter/plugin.js";

export default defineConfig({
  e2e: {
    baseUrl: "https://www.saucedemo.com",
    specPattern: "cypress/e2e/features/**/*.feature",
    supportFile: "cypress/support/index.js",
    async setupNodeEvents(on, config) {
      const addCucumber =
        cucumber.addCucumberPreprocessorPlugin || cucumber.default;
      if (typeof addCucumber !== "function") {
        throw new Error(
          "Não foi possível carregar addCucumberPreprocessorPlugin do @badeball/cypress-cucumber-preprocessor."
        );
      }
      await addCucumber(on, config);

      const createEsbuild =
        cucumberEsbuild.createEsbuildPlugin || cucumberEsbuild.default;
      on(
        "file:preprocessor",
        createBundler({ plugins: [createEsbuild(config)] })
      );

      // Mochawesome
      mochawesome(on);

      
      return config;
    },
  },
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true,
    reportPageTitle: "Relatório E2E",
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: true,
    html: true,
    json: true
  },
  video: false,
  chromeWebSecurity: false
});
