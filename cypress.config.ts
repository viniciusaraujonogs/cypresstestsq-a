import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'iya9gt',
  e2e: {
    setupNodeEvents(on, config) {
      // Implementar listeners de plugins aqui caso necessário
    },
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false
  },
});