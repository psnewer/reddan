// cypress/integration/login_test.js
import {matches} from "./data/matches.json.js";
import StrategyExecutor from './strategy.js';
import {getHandicap, getOth} from './utils.js';

describe('Login to www.orbitxch.com', function() {

  it(`Navigate and retrieve data for ${matches.match}`, () => {

    cy.visit('www.orbitxch.com'); // 起始 URL

    //遍历每场比赛，找到比赛ID，供直接request请求比赛数据使用。
    const arry = [];
    matches.forEach(match => {
      let matchItem = match;
    // 点击 match.sport
      cy.contains(match.sport,{timeout: 30000}).click();

    // 点击 match.competition
      cy.contains(match.competition,{timeout: 30000}).click();

      if (match.hasOwnProperty('sub'))
        cy.contains(match.sub,{timeout: 30000}).click();

    // 点击同时含有 team1 和 team2 的组件
      cy.get(`:has(p:contains(${match.home})):has(p:contains(${match.away}))`,{timeout:30000}).as('targetMatch')
        .closest('div[data-event-id]')
        .invoke('attr', 'data-event-id')
        .then(eventId => {
          matchItem['data-event-id'] = eventId;
        });
      cy.get('@targetMatch',{timeout: 30000}).closest('div.biab_market-title-cell').click()
    
      matchItem['oth_runner'] = getOth(match.home, match.away, match.runner);
      matchItem['handicap'] = Number(getHandicap(match.runner,match.home,match.away))
      matchItem['oth_handicap'] = Number(getHandicap(match.oth_runner,match.home,match.away))

    // 点击 match.market
      cy.contains(match.market,{timeout: 40000}).closest('[data-sport-id]')
        .invoke('attr', 'data-sport-id')
        .then(sportId => {
          matchItem['data-market-id'] = sportId;
          cy.contains(match.market).click()
          cy.url().should('include',sportId).then(runner_url => {
          matchItem['runner_url'] = runner_url;
          //获取selectionId
          cy.contains('span', "Show all").then($span => {
            if ($span.length) {
              // 如果找到了包含 "Show all" 的 span，则点击
              cy.wrap($span).click();
            }
          }).then(() => {
            let runnerEscaped = matchItem['runner'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cy.contains('span', new RegExp(`^${runnerEscaped}$`)).closest('div[data-market-id]')
              .find('[data-selection-id]').first()
              .invoke('attr', 'data-selection-id')
              .then(dataSelectionId => {
                matchItem['selectionId'] = dataSelectionId;
              });
            let oth_runnerEscaped = matchItem['oth_runner'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cy.contains('span', new RegExp(`^${oth_runnerEscaped}$`)).closest('div[data-market-id]')
              .find('[data-selection-id]').first()
              .invoke('attr', 'data-selection-id')
              .then(dataSelectionId => {
                matchItem['oth_selectionId'] = dataSelectionId;
              });
          });
      })
      });
      arry.push(matchItem);
  });

  cy.task('saveToFile', arry);

});
})

describe('Execution after login', function() {

  // Cypress 默认在每个测试用例之前会清除 cookies，要阻止这一行为，我们可以使用以下代码
  beforeEach(() => {
    cy.session('loggedInSession', () => {
        cy.login('abc', 'abc');
    });
  });

  for (let i = 0; i < 1000; i++) {
it(`Navigate match events and place bets`, () => {

const executor = new StrategyExecutor('./data/strategy.json');

// cy.visit('http://www.orbitxch.com',{timeout:20000})

function setupInterception() {

  cy.wait(60000).then(() => {
  //获取currentBets
  cy.intercept({
    hostname : 'www.orbitxch.com',
    pathname : "/customer/api/currentBets"
  }).as('currentBets')

  cy.wait('@currentBets',{timeout:60000}).then( res => {
        
    cy.task('readJsonFile','cypress/e2e/orbit/data/bets.json').then(betIds => {
      betIds.forEach(bet => {
        try{
              bet.currentBets = res.response.body;
              cy.getEventData(bet).then(params => {
                cy.log(params)
                cy.executeStrategy(executor,params.bet.strategy.name, params)
                  .then(undefined, (error) => {
                                              console.error(error);
                    });
               }).then(undefined, (error) => {
                    console.error(error);
                  });
        }catch {
                (error) => {
                  console.error(error);
                }
          }
      }); 
    })
  });
})
}

setupInterception();

});
  }
})