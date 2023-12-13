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
      on('task', {
        readJsonFile(file) {
          return readJson(file)
        }
      });
      on('task', {
        sendEmail({subject, text, html}) {
          json = readJson('cypress/e2e/orbit/data/profile.json')
          const transporter = nodemailer.createTransport({
            service: '163',
            auth: {
              user: json['mailadress'],
              pass: json['mailpass']
            }
          });
          let mailOptions = {
            from: 'psnewer@163.com',
            to: '969941416@qq.com',
            subject: subject,
            text: text,
            html: html
          };
          return transporter.sendMail(mailOptions)
            .then(info => {
                            return info.response;
                          })
            .catch(err => {
                            throw err;
                          });
        }
      });
    },
  },
  headless: true,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 2
});

function readJson(file) {
  const filePath = path.join(__dirname, file); // 根据您的文件结构进行调整
  const rawData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(rawData);
}
