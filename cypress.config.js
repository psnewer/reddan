const { defineConfig } = require("cypress");

const fs = require('fs');
const path = require('path');

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
      on('task', {
        readJsonFile(file) {
          const filePath = path.join(__dirname, file); // 根据您的文件结构进行调整
          const rawData = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(rawData);
        }
      });
    },
  },
  headless: true,
});
