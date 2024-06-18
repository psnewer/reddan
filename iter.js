const { chromium } = require('playwright');
const fs = require('fs').promises;
const StrategyExecutor = require('./strategy.js');
const { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail, checkBets } = require('./utils.js');
const { login, getEventData, currentBets, placeBet, cancelBet } = require('./commands.js');
const util = require('util');

(async () => {
  const browser = await chromium.launch({ headless: true,
    executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'});
  const context = await browser.newContext();
  const page = await context.newPage();

  const ret = await login(page);
  await page.reload();

  global.currentBets = ''; // 初始化全局变量来存储 WebSocket 响应

  page.on('response', async response => {
    if (response.url().includes('/customer/api/currentBets')) {
      console.log(`Response status: ${response.status()}`);
      global.currentBets = await response.json();
    }
  });

  page.on('websocket', websocket => {
    // 检查 WebSocket URL 是否包含 "current-bets"
    console.log(websocket.url())
    if (websocket.url().includes("/ws/general") || websocket.url().includes("current-bets")) {
      console.log(`WebSocket connected: ${websocket.url()}`);

      websocket.on('framereceived', event => {
        console.log(`Received message: ${event}`);

        if (event.payload && event.payload.includes('a')) {
          if (websocket.url().includes("/ws/general") && !event.payload.includes('CURRENT_BETS'))
            return
          global.currentBets = parseBet(event)
        }
      });

      websocket.on('close', () => {
        console.log('websocket close')
        global.currentBets = ''
        process.exit(1)
      });

      websocket.on('socketerror', (error) => {
        console.log('websocket error')
        global.currentBets = ''
        process.exit(1)
      });

    }
  });


  if (ret) {

    const executor = new StrategyExecutor('./data/strategy.json');
    await executor.initialize();

    for (let i = 0; i < 600; i++) {
      await page.waitForTimeout(6000);

      global.placing = false

      // const response = await currentBets(page); // 需要实现 currentBets 方法

      let currentDate = formatDate(new Date());
      const event_tennis_url = `https://prod-public-api.livescore.com/v1/api/app/date/tennis/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
      // const event_soccer_url = `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
      // const event_basketball_url = `https://prod-public-api.livescore.com/v1/api/app/date/basketball/${currentDate}/8?countryCode=CN&locale=en&MD=1`;

      const betIds = JSON.parse(await fs.readFile('./cypress/e2e/orbit/data/bets.json', 'utf8'));
      const _betIds = JSON.parse(JSON.stringify(betIds));
      if (global.currentBets !== '') {

        const [score_tennis] = await Promise.all([
          fetchData(event_tennis_url)
          // fetchData(event_soccer_url),
          // fetchData(event_basketball_url)
        ]);

        const promises = [];

        for (let i = 0; i < betIds.length; i++) {
          const promise = (async (i) => {
            let bet = betIds[i]
            let _bet = _betIds[i]
            bet.page = page;
            bet.currentBets = global.currentBets.filter(item => item.marketId === bet['data-market-id']);
            bet.currentBets.sort((a, b) => {
              return a.matchedDate - b.matchedDate;
            });
            bet.score_tennis = score_tennis;
            // bet.score_soccer = score_soccer;
            // bet.score_basketball = score_basketball;

            try {
              const params = await getEventData(bet);
              if (checkBets(params))
                await executor.execute(params.bet.strategy.name, params);
              if (params.event.hasOwnProperty('lastIsRunner_breakdown') && params.event.hasOwnProperty('lastSet_breakdown') || params.event.hasOwnProperty('hasBreakdown')) {
                if (!bet.hasOwnProperty('pre')) {
                  _bet.pre = {}
                  bet.pre = {}
                }
                if (params.event.lastIsRunner_breakdown != bet.pre.lastIsRunner_breakdown || params.event.lastSet_breakdown != bet.pre.lastSet_breakdown || params.event.hasBreakdown != bet.pre.hasBreakdown) {
                  _bet.pre.lastIsRunner_breakdown = params.event.lastIsRunner_breakdown
                  _bet.pre.lastSet_breakdown = params.event.lastSet_breakdown
                  _bet.pre.hasBreakdown = params.event.hasBreakdown
                  await fs.writeFile('./cypress/e2e/orbit/data/bets.json', JSON.stringify(_betIds, null, 2), 'utf8')
                }
              }
            } catch (error) {
              const subject = 'Test Failure';
              const text = `A test has failed: Navigate match events and place bets`;
              const errorDetails = error.stack; // 获取错误的堆栈信息
              const html = `
                <p>A test has failed: <strong>Navigate match events and place bets ${error.message} ${error}</strong></p>
                <p>Error details:</p>
                <pre>${errorDetails}</pre>
              `;
              await sendEmail({ subject: subject, text: text, html: html });

              if (error.message.includes('405'))
                process.exit(1)
            }
          })(i);
          promises.push(promise);
        }
        await Promise.all(promises);
        console.log(`Loop iteration ${i} completed`);
      }
    }
  }

  await browser.close();
})();

