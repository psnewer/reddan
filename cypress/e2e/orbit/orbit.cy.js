// cypress/integration/login_test.js
import {matches} from "./data/matches.json.js";
import StrategyExecutor from './strategy.js';
import {getHandicap, getOth} from './utils.js';

describe('Login to www.orbitxch.com', function() {

  it(`Navigate and retrieve data for ${matches.match}`, () => {

  //   cy.visit('www.orbitxch.com'); // 起始 URL

  //   //遍历每场比赛，找到比赛ID，供直接request请求比赛数据使用。
  //   const arry = [];
  //   matches.forEach(match => {
  //     let matchItem = match;
  //   // 点击 match.sport
  //     cy.contains(match.sport,{timeout: 30000}).click();

  //   // 点击 match.competition
  //     cy.contains(match.competition,{timeout: 20000}).click();

  //   // 点击同时含有 team1 和 team2 的组件
  //     cy.get(`:has(p:contains(${match.home})):has(p:contains(${match.away}))`,{timeout:30000}).as('targetMatch')
  //       .closest('div[data-event-id]')
  //       .invoke('attr', 'data-event-id')
  //       .then(eventId => {
  //         matchItem['data-event-id'] = eventId;
  //       });
  //     cy.get('@targetMatch',{timeout: 30000}).closest('div.biab_market-title-cell').click()
    
  //     matchItem['oth_runner'] = getOth(match.home, match.away, match.runner);
  //     matchItem['handicap'] = Number(getHandicap(match.runner,match.home,match.away))
  //     matchItem['oth_handicap'] = Number(getHandicap(match.oth_runner,match.home,match.away))

  //   // 点击 match.market
  //     cy.contains(match.market,{timeout: 40000}).closest('[data-sport-id]')
  //       .invoke('attr', 'data-sport-id')
  //       .then(sportId => {
  //         matchItem['data-market-id'] = sportId;
  //         cy.contains(match.market).click()
  //         cy.url().should('include',sportId).then(runner_url => {
  //         matchItem['runner_url'] = runner_url;
  //         //获取selectionId
  //         cy.get('body').then($body => {
  //           if ($body.find('span:contains("Show all")').length) {
  //             // 如果找到了包含 'Show all' 的 span，则点击
  //             cy.contains('span', 'Show all').click();
  //           } 
  //         }).then(() => {
  //           let runnerEscaped = matchItem['runner'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //           cy.contains('span', new RegExp(`^${runnerEscaped}$`)).closest('div[data-market-id]')
  //             .find('[data-selection-id]').first()
  //             .invoke('attr', 'data-selection-id')
  //             .then(dataSelectionId => {
  //               matchItem['selectionId'] = dataSelectionId;
  //             });
  //           let oth_runnerEscaped = matchItem['oth_runner'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //           cy.contains('span', new RegExp(`^${oth_runnerEscaped}$`)).closest('div[data-market-id]')
  //             .find('[data-selection-id]').first()
  //             .invoke('attr', 'data-selection-id')
  //             .then(dataSelectionId => {
  //               matchItem['oth_selectionId'] = dataSelectionId;
  //             });
  //         });
  //     })
  //     });
  //     arry.push(matchItem);
  // });

  // cy.task('saveToFile', arry);

});
})

describe('Execution after login', function() {

  // Cypress 默认在每个测试用例之前会清除 cookies，要阻止这一行为，我们可以使用以下代码
  beforeEach(() => {
    cy.session('loggedInSession', () => {
        cy.login('abc', 'abc');
    });
  });

  for (let i = 0; i < 1; i++) {
it(`Navigate match events and place bets`, () => {

const executor = new StrategyExecutor('./data/strategy.json');

// cy.visit('http://www.orbitxch.com',{timeout:20000})

function setupInterception() {

  cy.wait(5000).then(() => {
  //获取currentBets
  cy.intercept({
    hostname : 'www.orbitxch.com',
    pathname : "/customer/api/currentBets"
  }).as('currentBets')

  // cy.wait('@currentBets',{timeout:60000}).then( res => {
        
    cy.task('readJsonFile','cypress/e2e/orbit/data/bets.json').then(betIds => {
      betIds.forEach(bet => {
        // try{
              // bet.currentBets = res.response.body;
              let params = {
                "bet": {
                    "sport": "Tennis",
                    "competition": "ATP World Tour Finals 2023",
                    "home": "Jannik Sinner",
                    "away": "Daniil Medvedev",
                    "market": "Match Odds",
                    "runner": "Daniil Medvedev",
                    "strategy": {
                        "name": "soccer_1",
                        "params":{'notInPlay':{'side':'BACK','vol':6,'price':1.8},'notMatchOne':{'side':'BACK','vol':6,'cut_time':5},'notPlaceTwo':{'oth':true,'side':'BACK','profit':0.3,'scale':1.0},'isRunnerAdvance':{'oth':true,'side':'BACK','scale':0.5},'timeElapseTo':{'oth':true,'time_to':45,'side':'BACK','scale':0.5}}
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
                        },
                        {
                            "offerId": 128478879,
                            "marketId": "1.221414380",
                            "eventId": "32809962",
                            "price": 1.63,
                            "averagePrice": 0,
                            "averagePriceRounded": 0,
                            "size": "0.00",
                            "selectionId": 10372253,
                            "selectionName": "Jannik Sinner",
                            "lineSide": null,
                            "marketName": "Match Odds",
                            "marketType": "MATCH_ODDS",
                            "eventName": "Sinner v Medvedev",
                            "eventTypeId": 2,
                            "raceName": "",
                            "side": "BACK",
                            "offerState": "PLACED",
                            "placedDate": 1700322347000,
                            "matchedDate": null,
                            "marketStartDate": 1700313360000,
                            "cancelledDate": null,
                            "sizePlaced": "14.40",
                            "sizeMatched": "0.00",
                            "sizeRemaining": "14.40",
                            "sizeLapsed": "0.00",
                            "sizeCancelled": "0.00",
                            "sizeVoided": "0.00",
                            "settledDate": null,
                            "profit": "0.00",
                            "liability": "0.00",
                            "profitNet": "0.00",
                            "potentialProfit": "0.00",
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
                            "totalWinnings": "0.00",
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
                    "oth_back_odds": 1.42,
                    "oth_lay_odds": 1.43,
                    "back_odds": 3.3,
                    "lay_odds": 3.4,
                    "score_home": 0,
                    "score_away": 1,
                    "timeElapsed": 3
                }
            }
              // cy.getEventData(bet).then(params => {
              //   cy.log(params)
                cy.executeStrategy(executor,params.bet.strategy.name, params)
              //     .then(undefined, (error) => {
              //                                 console.error(error);
              //       });
              //  }).then(undefined, (error) => {
              //       console.error(error);
              //     });
        // }catch {
        //         (error) => {
        //           console.error(error);
        //         }
          // }
      })
    })
  // });
})
}

setupInterception();

});
  }
})