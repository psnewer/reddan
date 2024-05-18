const { chromium } = require('playwright');
const fs = require('fs').promises;
const StrategyExecutor = require('./strategy.js');
const { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail, checkBets } = require('./utils.js');
const { login, getEventData, currentBets, placeBet, cancelBet } = require('./commands.js');
const util = require('util');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const ret = await login(page);
  await page.reload();

  global.currentBets = ''; // 初始化全局变量来存储 WebSocket 响应
  page.on('websocket', websocket => {
    // 检查 WebSocket URL 是否包含 "current-bets"
    console.log(websocket.url())
    if (websocket.url().includes("/ws/general") || websocket.url().includes("current-bets")) {
      console.log(`WebSocket connected: ${websocket.url()}`);

      websocket.on('framereceived', event => {
        console.log(`Received message: ${event}`);
        // console.dir(event, { depth: null });
        // 将接收到的消息存储到全局变量中
        if (event.payload && event.payload.includes('a'))
          global.currentBets = parseBet(event)
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

    for (let i = 0; i < 500; i++) {
      await page.waitForTimeout(10000);

      global.placing = false

      // const response = await currentBets(page); // 需要实现 currentBets 方法

      let currentDate = formatDate(new Date());
      const event_tennis_url = `https://prod-public-api.livescore.com/v1/api/app/date/tennis/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
      // const event_soccer_url = `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
      // const event_basketball_url = `https://prod-public-api.livescore.com/v1/api/app/date/basketball/${currentDate}/8?countryCode=CN&locale=en&MD=1`;

      const betIds = JSON.parse(await fs.readFile('./cypress/e2e/orbit/data/bets.json', 'utf8'));
      if (global.currentBets !== '') {
        try {
          const [score_tennis] = await Promise.all([
            fetchData(event_tennis_url)
            // fetchData(event_soccer_url),
            // fetchData(event_basketball_url)
          ]);
          for (let bet of betIds) {
            bet.page = page;
            bet.currentBets = global.currentBets.filter(item => item.marketId === bet['data-market-id']);
            bet.currentBets.sort((a, b) => {
              return a.matchedDate - b.matchedDate;
            });
            bet.score_tennis = score_tennis;
            // bet.score_soccer = score_soccer;
            // bet.score_basketball = score_basketball;
            const params = await getEventData(bet);

            if (checkBets(params))
              await executor.execute(params.bet.strategy.name, params);

            if (params.event.hasOwnProperty('lastIsRunner_breakdown') && params.event.hasOwnProperty('lastSet_breakdown')) {
              if (!bet.hasOwnProperty('pre'))
                bet.pre = {}
              if (params.event.lastIsRunner_breakdown != bet.pre.lastIsRunner_breakdown || params.event.lastSet_breakdown != bet.pre.lastSet_breakdown) {
                bet.pre.lastIsRunner_breakdown = params.event.lastIsRunner_breakdown
                bet.pre.lastSet_breakdown = params.event.lastSet_breakdown
                delete bet.currentBets
                delete bet.score_tennis
                delete bet.page
                await fs.writeFile('./cypress/e2e/orbit/data/bets.json', JSON.stringify(betIds, null, 2), 'utf8')
              }
            }


          }
        } catch (error) {
          const subject = 'Test Failure';
          const text = `A test has failed: Navigate match events and place bets`;
          const errorDetails = error; // 获取错误的堆栈信息
          const html = `
          <p>A test has failed: <strong>Navigate match events and place bets</strong></p>
          <p>Error details:</p>
          <pre>${errorDetails}</pre>
        `;
          await sendEmail({ subject: subject, text: text, html: html });
        }
      }
    }
  }

  await browser.close();
})();

