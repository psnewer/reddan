// cypress/integration/login_test.js
import {matches} from "./data/matches.json.js";
import {getHandicap, getOth} from './utils.js';

describe('Login to www.orbitxch.com', function() {

  it(`Navigate and retrieve data for ${matches.match}`, () => {

    cy.visit('www.orbitxch.com'); // 起始 URL

    //遍历每场比赛，找到比赛ID，供直接request请求比赛数据使用。
    const arry = [];
    matches.forEach(match => {
      if (match.sport == 'Basketball') 
        [match.home, match.away] = [match.away, match.home]

      let matchItem = {...match};

      matchItem['oth_runner'] = getOth(matchItem.home, matchItem.away, matchItem.runner);
      matchItem['handicap'] = Number(getHandicap(matchItem.runner,matchItem.home,matchItem.away))
      matchItem['oth_handicap'] = Number(getHandicap(matchItem.oth_runner,matchItem.home,matchItem.away))
    // 点击 match.sport
      cy.contains(match.sport,{timeout: 30000}).click();

      if (match.hasOwnProperty('sub')) {
        cy.contains("More",{timeout: 30000}).click().then(() => {
          cy.contains(match.sub,{timeout: 30000}).click();
        })
      }

    // 点击 match.competition
      cy.contains(match.competition,{timeout: 30000}).click();

      match.home = matchItem.home.split(/[^a-zA-Z0-9]/).filter(Boolean).at(-1);
      match.away = matchItem.away.split(/[^a-zA-Z0-9]/).filter(Boolean).at(-1);
      match.runner = matchItem.runner.split(/[^a-zA-Z0-9]/).filter(Boolean).at(-1);
      match.oth_runner = matchItem.oth_runner.split(/[^a-zA-Z0-9]/).filter(Boolean).at(-1);

    // 点击同时含有 team1 和 team2 的组件
      cy.get(`:has(p:contains(${match.home})):has(p:contains(${match.away}))`,{timeout:30000}).as('targetMatch')
        .closest('div[data-event-id]')
        .invoke('attr', 'data-event-id')
        .then(eventId => {
          matchItem['data-event-id'] = eventId;
        });
      cy.get('@targetMatch',{timeout: 30000}).closest('div.biab_market-title-cell').click()

    // 点击 match.market
      cy.contains(match.market,{timeout: 40000}).closest('[data-sport-id]')
        .invoke('attr', 'data-sport-id')
        .then(sportId => {
          matchItem['data-market-id'] = sportId;
          cy.contains(match.market).click()
          cy.url().should('include',sportId).then(runner_url => {
          //获取selectionId
          cy.get('body').then($body => {
            if (match.market.includes('Handicap')) {
                cy.contains('span', 'Show all').click();
            }
        }).then(() => {
            // let runnerEscaped = matchItem['runner'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cy.contains('span', match.runner).closest('div.runnerRow')
              .find('[data-selection-id]').first()
              .invoke('attr', 'data-selection-id')
              .then(dataSelectionId => {
                matchItem['selectionId'] = dataSelectionId;
              });
            // let oth_runnerEscaped = matchItem['oth_runner'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cy.contains('span', match.oth_runner).closest('div.runnerRow')
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