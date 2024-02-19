const { defineConfig } = require("cypress");

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = defineConfig({
  projectId: 'ocxuww',
  e2e: {
    testIsolation : false,
    setupNodeEvents(on, config) {
      on('task', {
        saveToFile: (data) => {
          const filePath = path.join(__dirname, 'cypress/e2e/orbit/data', 'bets.json');
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          return null; // task needs to return something
        }
      });
    },
  },
  headless: true,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 2
});
