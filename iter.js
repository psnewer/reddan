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

  //   for (let i = 0; i < 500; i++) {
  //     await page.waitForTimeout(10000);

  //     global.placing = false

  //     // const response = await currentBets(page); // 需要实现 currentBets 方法

  //     let currentDate = formatDate(new Date());
  //     const event_soccer_url = `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
  //     const event_tennis_url = `https://prod-public-api.livescore.com/v1/api/app/date/tennis/${currentDate}/8?countryCode=CN&locale=en&MD=1`;
  //     // const event_basketball_url = `https://prod-public-api.livescore.com/v1/api/app/date/basketball/${currentDate}/8?countryCode=CN&locale=en&MD=1`;



  //     const betIds = JSON.parse(await fs.readFile('./cypress/e2e/orbit/data/bets.json', 'utf8'));

  //     if (global.currentBets !== '') {
  //       try {
  //         const [score_soccer, score_tennis, score_basketball] = await Promise.all([
  //           fetchData(event_soccer_url),
  //           fetchData(event_tennis_url)
  //           // fetchData(event_basketball_url)
  //         ]);
  //         for (let bet of betIds) {
  //           bet.page = page;
  //           bet.currentBets = global.currentBets.filter(item => item.marketId === params.bet['data-market-id']);
  //           bet.currentBets.sort((a, b) => {
  //             return a.matchedDate - b.matchedDate;
  //           });
  //           bet.score_soccer = score_soccer;
  //           bet.score_tennis = score_tennis;
  //           // bet.score_basketball = score_basketball;
            // const params = await getEventData(bet);
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
                        "inSets" : {
                          "until": 0
                        },
                        "loseSet": {
                            "side": "BACK",
                            "vol": 10,
                            "delta": 6,
                            "set": 1
                        },
                        "winSet": {
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
                    {
                      "offerId": 128471276,
                      "marketId": "1.221414380",
                      "eventId": "32809962",
                      "price": 3.4,
                      "averagePrice": 3.55,
                      "averagePriceRounded": 3.55,
                      "size": "6.00",
                      "selectionId": 10372253,
                      "selectionName": "Daniil Medvedev",
                      "lineSide": null,
                      "marketName": "Match Odds",
                      "marketType": "MATCH_ODDS",
                      "eventName": "Sinner v Medvedev",
                      "eventTypeId": 2,
                      "raceName": "",
                      "side": "LAY",
                      "offerState": "MATCHED",
                      "placedDate": 1700318649000,
                      "matchedDate": 1700318652000,
                      "marketStartDate": 1700313360000,
                      "cancelledDate": null,
                      "sizePlaced": "6.00",
                      "sizeMatched": "6.00",
                      "sizeRemaining": "0.00",
                      "sizeLapsed": "0.00",
                      "sizeCancelled": "0.00",
                      "sizeVoided": "0.00",
                      "settledDate": null,
                      "profit": "0.00",
                      "liability": "6.00",
                      "profitNet": "15.30",
                      "potentialProfit": "15.30",
                      "groupName": "ATP World Tour Finals 2023",
                      "currency": "EUR",
                      "sportName": "Tennis",
                      "resettled": false,
                      "handicap": "0.00",
                      "bettingType": "ODDS",
                      "persistenceEnabled": false,
                      "persistenceType": "LAPSE",
                      "eachWayDivisor": null,
                      "numberOfWinners": null,
                      "minUnitValue": null,
                      "maxUnitValue": null,
                      "interval": null,
                      "marketUnit": null,
                      "commissionType": "WINNINGS",
                      "betType": "EXCHANGE",
                      "triggeredByCashOut": false,
                      "cancelledByOperator": false,
                      "alternativeBackOdds": null,
                      "alternativeBackOddsRounded": null,
                      "totalWinnings": "21.30",
                      "pastTotalLiability": null,
                      "fancyView": false,
                      "oldOfferId": null,
                      "competitionId": null,
                      "disabledLayOdds": false,
                      "priceLadderDescription": {
                          "type": "CLASSIC"
                      }
                  },
                  {
                    "offerId": 128471276,
                    "marketId": "1.221414380",
                    "eventId": "32809962",
                    "price": 3.4,
                    "averagePrice": 3.55,
                    "averagePriceRounded": 3.55,
                    "size": "6.00",
                    "selectionId": 19924831,
                    "selectionName": "Daniil Medvedev",
                    "lineSide": null,
                    "marketName": "Match Odds",
                    "marketType": "MATCH_ODDS",
                    "eventName": "Sinner v Medvedev",
                    "eventTypeId": 2,
                    "raceName": "",
                    "side": "BACK",
                    "offerState": "MATCHED",
                    "placedDate": 1700318649000,
                    "matchedDate": 1700318652000,
                    "marketStartDate": 1700313360000,
                    "cancelledDate": null,
                    "sizePlaced": "6.00",
                    "sizeMatched": "6.00",
                    "sizeRemaining": "0.00",
                    "sizeLapsed": "0.00",
                    "sizeCancelled": "0.00",
                    "sizeVoided": "0.00",
                    "settledDate": null,
                    "profit": "0.00",
                    "liability": "6.00",
                    "profitNet": "15.30",
                    "potentialProfit": "15.30",
                    "groupName": "ATP World Tour Finals 2023",
                    "currency": "EUR",
                    "sportName": "Tennis",
                    "resettled": false,
                    "handicap": "0.00",
                    "bettingType": "ODDS",
                    "persistenceEnabled": false,
                    "persistenceType": "LAPSE",
                    "eachWayDivisor": null,
                    "numberOfWinners": null,
                    "minUnitValue": null,
                    "maxUnitValue": null,
                    "interval": null,
                    "marketUnit": null,
                    "commissionType": "WINNINGS",
                    "betType": "EXCHANGE",
                    "triggeredByCashOut": false,
                    "cancelledByOperator": false,
                    "alternativeBackOdds": null,
                    "alternativeBackOddsRounded": null,
                    "totalWinnings": "21.30",
                    "pastTotalLiability": null,
                    "fancyView": false,
                    "oldOfferId": null,
                    "competitionId": null,
                    "disabledLayOdds": false,
                    "priceLadderDescription": {
                        "type": "CLASSIC"
                    }
                }
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
                    "6","3"
                  ],
                  "score_away": [
                    "3","6"
                  ]
              }
          }
            if (checkBets(params))
              await executor.execute(params.bet.strategy.name, params);
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
  // }

  // await browser.close();
})();

