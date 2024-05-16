const { chromium } = require('playwright');
const fs = require('fs').promises;
const StrategyExecutor = require('./strategy.js');
const { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail, checkBets } = require('./utils.js');
const { login, getEventData, currentBets, placeBet, cancelBet } = require('./commands.js');
const util = require('util');

(async () => {
  // const browser = await chromium.launch({ headless: true });
  // const context = await browser.newContext();
  // const page = await context.newPage();

  // global.currentBets = ''; // 初始化全局变量来存储 WebSocket 响应
  // page.on('websocket', websocket => {
  //   // 检查 WebSocket URL 是否包含 "current-bets"
  //   if (websocket.url().includes("current-bets")) {
  //     console.log(`WebSocket connected: ${websocket.url()}`);

  //     websocket.on('framereceived', event => {
  //       console.log(`Received message: ${event}`);
  //       // console.dir(event, { depth: null });
  //       // 将接收到的消息存储到全局变量中
  //       if (event.payload && event.payload.includes('a'))
  //         global.currentBets = parseBet(event)
  //     });

  //     websocket.on('close', () => {
  //       console.log('websocket close')
  //       global.currentBets = ''
  //       process.exit(1)
  //     });

  //     websocket.on('socketerror', (error) => {
  //       console.log('websocket error')
  //       global.currentBets = ''
  //       process.exit(1)
  //     });

  //   }
  // });

  // const ret = await login(page);

  // if (ret) {
    const executor = new StrategyExecutor('./data/strategy.json');
    await executor.initialize();

  //     const betIds = JSON.parse(await fs.readFile('./cypress/e2e/orbit/data/bets.json', 'utf8'));

  //   for (let i = 0; i < 500; i++) {
  //     await page.waitForTimeout(10000);

  //     global.placing = false

  //     // const response = await currentBets(page); // 需要实现 currentBets 方法

  //     let currentDate = formatDate(new Date());
  //     const event_soccer_url = `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
  //     const event_tennis_url = `https://prod-public-api.livescore.com/v1/api/app/date/tennis/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
  //     // const event_basketball_url = `https://prod-public-api.livescore.com/v1/api/app/date/basketball/${currentDate}/8?countryCode=CN&locale=en&MD=1`;


  //     if (global.currentBets !== '') {
  //       try {
  //         const [score_soccer, score_tennis, score_basketball] = await Promise.all([
  //           fetchData(event_soccer_url),
  //           fetchData(event_tennis_url)
  //           // fetchData(event_basketball_url)
  //         ]);
  //         for (let bet of betIds) {
  //           let origin_bet = {...bet}
  //           bet.page = page;
  //           bet.currentBets = global.currentBets.filter(item => item.marketId === params.bet['data-market-id']);
  //           bet.currentBets.sort((a, b) => {
  //             return a.matchedDate - b.matchedDate;
  //           });
  //           bet.score_soccer = score_soccer;
  //           bet.score_tennis = score_tennis;
  //           // bet.score_basketball = score_basketball;
            // const params = await getEventData(bet);
            if (bet.hasOwnProperty('pre'))
              params.event = {...bet.pre}
            let params = {
              "bet": {
                  "sport": "Tennis",
                  "competition": "ATP World Tour Finals 2023",
                  "home": "Jannik Sinner",
                  "away": "Daniil Medvedev",
                  "market": "Match Odds",
                  "runner": "Daniil Medvedev",
                  "strategy": {
                      "name": "tennis_1",
                      "params": {
                        "breakdown" : {
                          "until": 1
                        },
                        "loseSets": {
                            "side": "BACK",
                            "vol": 10,
                            "delta": 6,
                            "set": 1,
                            "scale": 1.0,
                            "until": 3
                        },
                        "drawSets": {
                            "side": "BACK",
                            "scale": 1.0
                        }
                      }
                  },
                  "oth_runner": "Jannik Sinner",
                  "handicap": 0,
                  "oth_handicap": 0,
                  "data-event-id": "32809962",
                  "data-market-id": "1.221414380",
                  "runner_url": "https://orbitxch.com/customer/sport/2/market/1.221414380",
                  "selectionId": "19924831",
                  "oth_selectionId": "10372253",
                  "currentBets": [

                  ]
              },
              "event": {
                  "inPlay": true,
                  "oth_back_odds": 4.0,
                  "oth_lay_odds": 1.43,
                  "back_odds": 3.3,
                  "lay_odds": 3.4,
                  "score_homeS": 0,
                  "score_awayS": 0,
                  "score_home": [
        
                  ],
                  "score_away": [
       
                  ]
              }
          }
            if (checkBets(params))
              await executor.execute(params.bet.strategy.name, params);

            if (params.event.lastIsRunner_breakdown != bet.pre.lastIsRunner_breakdown || params.event.lastSet_breakdown != bet.pre.lastSet_breakdown) {
                bet.pre.lastIsRunner_breakdown = params.event.lastIsRunner_breakdown
                bet.pre.lastSet_breakdown = params.event.lastSet_breakdown
                await fs.writeFile('./cypress/e2e/orbit/data/bets.json', JSON.stringify(betIds, null, 2), 'utf8')
            }
            console.log(params.event)


  //         }
  //       } catch (error) {
  //         const subject = 'Test Failure';
  //         const text = `A test has failed: Navigate match events and place bets`;
  //         const errorDetails = error; // 获取错误的堆栈信息
  //         const html = `
  //         <p>A test has failed: <strong>Navigate match events and place bets</strong></p>
  //         <p>Error details:</p>
  //         <pre>${errorDetails}</pre>
  //       `;
  //         await sendEmail({ subject: subject, text: text, html: html });
  //       }
  //     }
  //   }
  // await fs.writeFile('./cypress/e2e/orbit/data/bets.json', JSON.stringify(betIds, null, 2), 'utf8')
  // }

  // await browser.close();
})();

