// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // where your specs live:
    specPattern: 'cypress/integration/**/*.spec.{js,ts,jsx,tsx}',

    // your dev‐server URL
    baseUrl: 'http://localhost:8081',

    // turn off video to speed up CI
    video: false,

    // simulate a phone viewport (optional)
    viewportWidth:  375,
    viewportHeight: 667,

    // support file can be 'cypress/support/index.js' (default) or false to disable
    supportFile: 'cypress/support/index.js'
  }
})
