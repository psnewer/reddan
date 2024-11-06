import { getHandicap, getOth, isCompetition, isTeam } from './utils.js';
const matches = require('../../../../leisu/res/predict/predict.json')
const filters = require('./data/templates.json')

describe('Login to www.orbitxch.com', function () {

  it(`Navigate and retrieve data`, () => {

    cy.visit('www.orbitxch.com'); // 起始 URL

    const arry = [];
    //遍历每场比赛，找到比赛ID，供直接request请求比赛数据使用。
    // const arry = [];
    matches.forEach((match) => {
      cy.contains('Soccer').click();

      let market = 'Asian Handicap'
      let foundCompetition = false;
      // Step 2: 点击 'Soccer' 按钮后，处理 competition 列表项
      cy.get('[data-test-collapse="_ITEM"][datatype="competition"]').each(($li) => {
        if (foundCompetition) return false;
        const competition = $li.text();

        // 执行 isCompetition(cand, match.league) 判断条件
        if (isCompetition(competition, match.league)) {
          foundCompetition = true;
          cy.wrap($li).click();  // 点击符合条件的 li 项
   
          // Step 3: 进入 competition 页面后，遍历 rowsContainer
          let foundTeam = false;
          cy.get('div.rowsContainer [role="row"]').each(($row) => {
            const titleElements = $row.find('p[title]');
            const c_home = titleElements[0] ? titleElements[0].getAttribute('title') : '';
            const c_away = titleElements[1] ? titleElements[1].getAttribute('title') : '';

            // 检查是否满足 isTeam 的条件
            if (isTeam(c_home, c_away, match.home_team, match.away_team)) {
              if (foundTeam) return false;
              
              let filter
              if (match.team == match.home_team) {
                if (match.filter == 'VS_TAW') {
                  filter = structuredClone(filters['VS_TAW'])
                  filter.runner = c_away + ' +0.5'
                  filter.oth_runner = c_home + ' -0.5'
                }
                else if (match.filter == 'VS_TAWDRAW') {
                  filter = structuredClone(filters['VS_TAWDRAW'])
                  filter.runner = c_away + ' 0'
                  filter.oth_runner = c_home + ' 0'
                }
              } else {
                if (match.filter == 'VS_TAW') {
                  filter = structuredClone(filters['VS_TAW'])
                  filter.runner = c_home + ' +0.5'
                  filter.oth_runner = c_away + ' -0.5'
                }
                else if (match.filter == 'VS_TAWDRAW') {
                  filter = structuredClone(filters['VS_TAWDRAW'])
                  filter.runner = c_home + ' 0'
                  filter.oth_runner = c_away + ' 0'
                }
              }
              filter.home = c_home;
              filter.away = c_away;
              cy.wrap($row).invoke('attr', 'data-event-id').then((dataEventId) => {
                filter['data-event-id'] = dataEventId;
              });
              titleElements[0].click();
              
              // Step 4: 点击后弹出页面中执行 data-sport-id 查找
              cy.contains(market, { timeout: 40000 })
                .closest('[data-sport-id]')
                .invoke('attr', 'data-sport-id')
                .then((sportId) => {
                  filter['data-market-id'] = sportId;
                  cy.contains(market).click();

                  // 确保 URL 包含 sportId
                  cy.url().should('include', sportId).then((runner_url) => {
                    // Step 5: 获取 selectionId
                    cy.get('body').then(($body) => {
                      // 根据 market 判断是否需要点击 'Show all'
                      if (market.includes('Handicap')) {
                        cy.contains('span', 'Show all').click();
                      }
                    }).then(() => {
                      // 获取 runner 的 selection ID
                      const escapedRunner = filter.runner.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
                      cy.contains('span', new RegExp(`^${escapedRunner}$`))
                        .closest('div.runnerRow')
                        .find('[data-selection-id]').first()
                        .invoke('attr', 'data-selection-id')
                        .then((dataSelectionId) => {
                          filter.selectionId = dataSelectionId;
                        });

                      // 获取 oth_runner 的 selection ID
                      const escapedothRunner = filter.oth_runner.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
                      cy.contains('span', new RegExp(`^${escapedothRunner}$`))
                        .closest('div.runnerRow')
                        .find('[data-selection-id]').first()
                        .invoke('attr', 'data-selection-id')
                        .then((dataSelectionId) => {
                          filter.oth_selectionId = dataSelectionId;
                        });
                    }).then(() => {
                      if (filter.selectionId && filter.oth_selectionId && filter['data-event-id']) {
                        filter.competition = competition
                        arry.push(filter);
                      }
                    });
                  });
                });
            }
          });
        }
      });

    });

    cy.task('saveToFile', arry);

  });
})