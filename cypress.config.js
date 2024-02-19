const { defineConfig } = require("cypress");

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = defineConfig({
  projectId: 'ocxuww',
  e2e: {
    testIsolation : false,
    setupNodeEvents(on, config) {
      
    },
  },
  headless: true,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 2
});
