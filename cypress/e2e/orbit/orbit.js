const { isCompetition, isTeam } = require('./utils.js');
const matches = require('../../../../leisu/res/predict/predict.json');
const filters = require('./data/templates.json');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function runTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://www.orbitexch.com'); // 起始 URL

  const arry = [];

  // Loop through each match
  for (const match of matches) {
    try {
      await page.locator('text=Soccer').first().click(); // Click 'Soccer'

      let market = 'Asian Handicap';
      let foundCompetition = false;

      // Loop through each competition
      await page.waitForSelector('[data-test-collapse="_ITEM"][datatype="competition"]'); // 等待元素可见
      const competitions = await page.locator('[data-test-collapse="_ITEM"][datatype="competition"]').allTextContents();
      for (const competition of competitions) {
        if (foundCompetition) break;
        // Check if competition matches the match league
        if (isCompetition(competition, match.league)) {
          foundCompetition = true;

          await page.locator(`text=${competition}`).click();  // Click the matching competition
          let foundTeam = false;
          // Loop through the rows of the competition
          await page.waitForSelector('div.rowsContainer'); // 等待元素可见
          const rows = await page.locator('div.rowsContainer [role="row"]').all();

          for (const row of rows) {
            if (foundTeam) break;
            const titleElements = await row.locator('p[title]').allTextContents();
            const c_home = titleElements[0] || '';
            const c_away = titleElements[1] || '';

            // Check if the team matches
            if (isTeam(c_home, c_away, match.home_team, match.away_team)) {
              foundTeam = true

              let filter;
              // Set filter based on match criteria
              if (match.team === match.home_team) {
                filter = match.filter === 'VS_TAW' ? structuredClone(filters['VS_TAW']) :
                  match.filter === 'VS_TAWTAW' ? structuredClone(filters['VS_TAWTAW']) :
                    match.filter === 'VS_TAWDRAW' ? structuredClone(filters['VS_TAWDRAW']) :
                      match.filter === 'VS_RAW' ? structuredClone(filters['VS_TAW']) :
                        match.filter === 'VS_RAWRAW' ? structuredClone(filters['VS_TAWTAW']) :
                          structuredClone(filters['VS_TAWDRAW']);
                filter.runner = c_away + ' +0.5';
                filter.oth_runner = c_home + ' -0.5';
              } else {
                filter = match.filter === 'VS_TAW' ? structuredClone(filters['VS_TAW']) :
                  match.filter === 'VS_TAWTAW' ? structuredClone(filters['VS_TAWTAW']) :
                    match.filter === 'VS_TAWDRAW' ? structuredClone(filters['VS_TAWDRAW']) :
                      match.filter === 'VS_RAW' ? structuredClone(filters['VS_TAW']) :
                        match.filter === 'VS_RAWRAW' ? structuredClone(filters['VS_TAWTAW']) :
                          structuredClone(filters['VS_TAWDRAW']);
                filter.runner = c_home + ' +0.5';
                filter.oth_runner = c_away + ' -0.5';
              }

              // Save home and away
              filter.home = c_home;
              filter.away = c_away;

              // Get event ID
              const dataEventId = await row.getAttribute('data-event-id');
              filter['data-event-id'] = dataEventId;

              // Click home team to open the selection options
              await row.locator('p[title]').first().click();

              const marketLocator = await page.locator(`a:has-text("${market}")`);

              // 获取该 <a> 元素的 'data-sport-id' 属性值
              const sportId = await marketLocator.getAttribute('data-sport-id');

              filter['data-market-id'] = sportId;
              await page.locator(`text=${market}`).first().click();

              // Ensure URL contains sport ID
              const url = page.url();
              if (url.includes(sportId)) {
                // Get selection ID for runner
                const escapedRunner = filter.runner.replace(/(\s?[+-]?\d+(\.\d+)?)/, '').trim();
                const selectedLocator = await page.locator(`span:has-text("${escapedRunner}")`).nth(0);
                const grandParentDivLocator = await selectedLocator.locator('xpath=ancestor::div[3]');
                const firstBetContentLocator = await grandParentDivLocator.locator('div[data-selection-id]').first();
                filter.selectionId = await firstBetContentLocator.getAttribute('data-selection-id');

                const escapedOthRunner = filter.oth_runner.replace(/(\s?[+-]?\d+(\.\d+)?)/, '').trim();
                const oth_selectedLocator = await page.locator(`span:has-text("${escapedOthRunner}")`).nth(0);
                const oth_grandParentDivLocator = await oth_selectedLocator.locator('xpath=ancestor::div[3]');
                const oth_firstBetContentLocator = await oth_grandParentDivLocator.locator('div[data-selection-id]').first();
                filter.oth_selectionId = await oth_firstBetContentLocator.getAttribute('data-selection-id');

                if (filter.selectionId && filter.oth_selectionId && filter['data-event-id']) {
                  filter.competition = competition;
                  arry.push(filter);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // 捕获每场比赛中的错误并输出日志，但不会中断循环
      console.error(`Error occurred while processing match ${match}:`, error.message);
      // 继续处理下一个比赛
      continue;
    }
  }

  // Save the data to a file (local storage)
  const filePath = path.join(__dirname, 'data', 'cands.json');
  fs.writeFileSync(filePath, JSON.stringify(arry, null, 2), 'utf8');

  // Close the browser
  await browser.close();
}

runTest().catch(console.error);
