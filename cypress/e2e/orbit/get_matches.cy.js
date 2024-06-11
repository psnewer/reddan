// cypress/integration/fill_data_spec.js

describe('Extract and Fill Data', () => {
  it('Visits orbitxch.com, extracts necessary values and fills the array of objects', () => {
    // 存储结果的数组
    const results = [];

    // 访问指定的网站
    cy.visit('https://www.orbitxch.com');

    // 确保页面加载完成
    cy.wait(2000); // 根据需要调整等待时间

    // 点击包含 "Tennis" 的 li 元素
    cy.get('li[data-test-collapse="_ITEM"][datatype="sport"]').contains('Tennis').click();

    // 确保页面部分加载完成
    cy.wait(2000); // 根据需要调整等待时间

    // 定义一个递归函数来处理 competition 项的点击
    function clickCompetitions(index) {
      cy.get('li[data-test-collapse="_ITEM"][datatype="competition"]').should('be.visible').then(($competitionItems) => {
        if (index < $competitionItems.length) {
          const $competitionLi = $competitionItems.eq(index);
          const competitionText = $competitionLi.text();

          if (!competitionText.includes('Challenger') && !competitionText.includes('UTP') && !competitionText.includes('ITF') && (competitionText.includes('ATP Stuttgart'))) {
            cy.wrap($competitionLi).click();

            // 点击后等待子元素加载
            cy.wait(2000); // 根据需要调整等待时间

            // 定义一个递归函数来处理 group 项的点击
            function clickGroups(index) {
              cy.get('body').then(($body) => {
              const groupItems = $body.find('li[data-test-collapse="_ITEM"][datatype="group"]');

              if (groupItems.length > 0){
                if (index < groupItems.length) {
                  const $groupLi = groupItems.eq(index);
                  const groupText = $groupLi.text();

                  if (!groupText.includes('Double')) {
                    cy.wrap($groupLi).click();

                    // 点击后等待子元素加载
                    cy.wait(2000); // 根据需要调整等待时间

                    // 定义一个递归函数来处理 event 项的点击
                    function clickEvents(eventIndex) {
                      cy.get('body').then(($body) => {
                        const eventItems = $body.find('li[data-test-collapse="_ITEM"][datatype="event"]');
                        if (eventItems.length > 0){
                        if (eventIndex < eventItems.length) {
                          const $eventLi = eventItems.eq(eventIndex);
                          
                          // 确保元素存在并可见，然后点击
                          // cy.wrap($eventLi).click();
                          const data_event_id = $eventLi.attr('data-navigation-id')
                          // 确保 event 页面加载
                          // cy.wait(2000); // 根据需要调整等待时间

                          // 处理 event 页面上的数据提取
                          cy.get(`div[role="row"][data-event-id="${data_event_id}"]`).then(($rowDiv) => {
                            
                            const data_market_id = $rowDiv.attr('data-market-id');
                            const homeName = $rowDiv.find('p[title]').eq(0).attr('title');
                            const awayName = $rowDiv.find('p[title]').eq(1).attr('title');

                            const selectionDivs = $rowDiv.find('div[data-selection-id]');
                            const homeDiv = selectionDivs.eq(0);
                            const awayDiv = selectionDivs.eq(1);

                            const homeOdds = homeDiv.find('button[class*="back-cell"]').find('span[class*="betOdds"]').first().text();
                            const homeSelectionId = homeDiv.attr('data-selection-id');

                            const awayOdds = awayDiv.find('button[class*="back-cell"]').find('span[class*="betOdds"]').first().text();
                            const awaySelectionId = awayDiv.attr('data-selection-id');

                            if (!homeOdds || !awayOdds) {
                              cy.wrap($rowDiv).click();
                              
                            }
                                let runner,oth_runner,selectionId,oth_selectionId;
                                if (homeOdds <= awayOdds) {
                                  runner = homeName;
                                  oth_runner = awayName;
                                  selectionId = homeSelectionId;
                                  oth_selectionId = awaySelectionId;
                                } else {
                                  runner = awayName;
                                  oth_runner = homeName
                                  selectionId = awaySelectionId;
                                  oth_selectionId = homeSelectionId;
                                }

                                // 创建目标对象
                                const result =   {
                                  "sport": "Tennis",
                                  "competition": competitionText,
                                  "home": homeName,
                                  "away": awayName,
                                  "market": "Match Odds",
                                  "runner": runner,
                                  "vol": 6,
                                  "strategy": {
                                    "name": "tennis_2",
                                    "params": {
                                      "breakdown": {
                                        "until": 2,
                                        "side": "BACK",
                                        "first_runner": true,
                                        "first_oth": false,
                                        "last_runner": true,
                                        "last_oth": false
                                      },
                                      "eitherLose": {
                                        "first_runner": true,
                                        "first_oth": true,
                                        "side": "BACK",
                                        "until": 1
                                      },
                                      "eitherDraw": {
                                        "side": "BACK",
                                        "scale": 0.0
                                      },
                                      "drawGames": {
                                        "side": "BACK"
                                      }
                                    }
                                  },
                                  "oth_runner": oth_runner,
                                  "handicap": 0,
                                  "oth_handicap": 0,
                                  "data-event-id": data_event_id,
                                  "data-market-id": data_market_id,
                                  "selectionId": selectionId,
                                  "oth_selectionId": oth_selectionId
                                };

                                // 将结果添加到数组中
                                results.push(result);
                          });
                              clickEvents(eventIndex + 1);

                        }
                      }
                      });
                    }

                    // 开始处理 event 项的点击
                    clickEvents(0);
                    cy.wait(2000).then(() => {
                      cy.go('back').then(() => {
                        // 等待页面回退加载完成
                        cy.wait(2000);
                      });
                    });
                  } 

                        clickGroups(index + 1);

                    
                
                }
              }
              });
            }
            clickGroups(0);
            cy.wait(2000).then(() => {
              cy.go('back').then(() => {
                // 等待页面回退加载完成
                cy.wait(2000);
              });
            });
          } 

          clickCompetitions(index + 1);
        } else {
          // 在所有操作完成后将结果保存到文件
          cy.task('saveToFile', results);
        }
      });
    }

    // 开始处理 competition 项的点击
    clickCompetitions(0);
  });
});
