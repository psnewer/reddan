import StrategyExecutor from './strategy.js';
import {formatDate} from './utils.js';

describe('Execution after login', function() {

  // Cypress 默认在每个测试用例之前会清除 cookies，要阻止这一行为，我们可以使用以下代码
  beforeEach(() => {
    cy.session('loggedInSession', () => {
        cy.login('abc', 'abc');
    });
  });

  for (let i = 0; i < 200; i++) {
    it(`Navigate match events and place bets`, () => {

      const executor = new StrategyExecutor('./data/strategy.json');

      cy.wait(2000).then(() => {
        //获取currentBets
        cy.intercept({
          hostname : 'www.orbitxch.com',
          pathname : "/customer/api/currentBets"
        }).as('currentBets')

        cy.setEnv('placing',false)

        cy.wait('@currentBets',{timeout:60000}).then( res => {

        //从LiveScore获取全部soccer和tennis比分
        let currentDate = formatDate(new Date());
        const event_soccer_url = 'https://prod-public-api.livescore.com/v1/api/app/date/soccer/20240103/8?countryCode=CN&locale=en&MD=1'.replace('20240103', currentDate);
        const event_tennis_url = 'https://prod-public-api.livescore.com/v1/api/app/date/tennis/20240103/8?countryCode=CN&locale=en&MD=1'.replace('20240103', currentDate);
        const event_basketball_url = 'https://prod-public-api.livescore.com/v1/api/app/date/basketball/20240103/8?countryCode=CN&locale=en&MD=1'.replace('20240103', currentDate);
        let score_soccer, score_tennis, score_basketball
        cy.request('GET', event_soccer_url).then(response => {score_soccer = response.body});
        cy.request('GET', event_tennis_url).then(response => {score_tennis = response.body});
        cy.request('GET', event_basketball_url).then(response => {score_basketball = response.body});
        cy.then(() => {
          cy.task('readJsonFile','cypress/e2e/orbit/data/bets.json').then(betIds => {
            betIds.forEach(bet => {
              try{
                  bet.currentBets = res.response.body;
                  bet.score_soccer = score_soccer;
                  bet.score_tennis = score_tennis;
                  bet.score_basketball = score_basketball;
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
        })
     
      });
    })
  });
  }

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      const subject = 'Test Failure';
      const text = `A test has failed: ${this.currentTest.title}`;
      const errorDetails = this.currentTest.err.stack; // 获取错误的堆栈信息
      const html = `
        <p>A test has failed: <strong>${this.currentTest.title}</strong></p>
        <p>Error details:</p>
        <pre>${errorDetails}</pre>
      `;

      cy.task('sendEmail', {
        subject: subject,
        text: text,
        html: html
        }).then(response => {
                              console.log(response);
                            });
    }
  });

})