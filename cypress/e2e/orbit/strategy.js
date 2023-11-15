const fs = require('fs');

export default class StrategyExecutor {
    constructor(strategyFile) {
        cy.readFile('./cypress/e2e/orbit/data/strategy.json').then((content) => {
            this.strategies = content;
        });
    }

    execute(strategyName, params) {
        const strategy = this.strategies[strategyName];
        if (!strategy) {
            console.log('Strategy not found.');
            return;
        }

        for (let rule of strategy) {
            if (this[rule.condition](params,rule.condition)) {
                if (rule.hasOwnProperty('checktion')) {
                    for (let check of rule.checktion) {
                        if (!this[check](params,rule.condition))
                            return
                    }
                }
                this[rule.action](params,rule.condition);
                break;  // 结束策略执行
            }
        }
    }

    // 条件判断函数
    notInPlay(params,condition) {
        if (params.hasOwnProperty('event'))
            if (params.event.hasOwnProperty('inPlay'))
                return !params.event.inPlay;
        return true;
    }

    hasCompleted(params,condition) {
        if (params.hasOwnProperty('event'))
            return false;
        else
            return true
    }

    break(params, condition) {
        return true
    }

    notPlaceOne(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.eventId === params.bet['data-event-id']);
        if (currentBets.length > 0)
            return false;
        return true;
    }

    notPlaceTwo(params,condition) {
        if (!this.notMatchOne(params)){
            const currentBets = params.bet.currentBets.filter(item => item.eventId === params.bet['data-event-id']);
            if (currentBets.length > 1)
                return false;
        }
        return true;
    }

    notMatchOne(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.eventId === params.bet['data-event-id']);
        currentBets.forEach(placed => {
            if (Number(placed.sizeMatched) > 0.0)
                return false;
        })
        return true;
    }

    notMatchTwo(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.eventId === params.bet.selectionId);
        const currentOthBets = params.bet.currentBets.filter(item => item.eventId === params.bet.oth_selectionId);
        currentBets.forEach(placed => {
            if (Number(placed.sizeMatched) > 0.0)
                currentOthBets.forEach(oth_placed => {
                    if (Number(oth_placed.sizeMatched) > 0.0)
                        return false;
                })
        })
        return true;
    }

    isWeakAdvance(params,condition) {
        if (params.bet.runner.includes(params.bet.home))
            return Number(params.event.score_home) > Number(params.event.score_away);
        else
            return Number(params.event.score_away) > Number(params.event.score_home) ;
    }

    timeElapseTo(params,condition) {
        return params.event.timeElapsed > params.bet.strategy.params[condition].time_to
    }

    notTimeElapseTo(params,condition) {
        return !(params.event.timeElapsed > params.bet.strategy.params[condition].cut_time)
    }

    loseSet(params,condition) {
        let set = params.bet.strategy.params[condition].set
        if (params.event.score_home.length === set && params.event.score_away.length === set){
            if (params.bet.runner.includes(params.bet.home)){
                if (Number(params.event.score_away[set - 1]) >= 6)
                    return true;  
            }
            else if (params.bet.runner.includes(params.bet.away)){
                if (Number(params.event.score_home[set - 1]) >= 6)
                    return true;
            }
        }
        return false
    }

    winSet(params,condition) {
        let set = params.bet.strategy.params[condition].set
        if (params.event.score_home.length === set && params.event.score_away.length === set){
            if (params.bet.runner.includes(params.bet.home)){
                if (Number(params.event.score_home[set - 1]) >= 6)
                    return true;
            }
            else if (params.bet.runner.includes(params.bet.away)){
                if (Number(params.event.score_away[set -1]) >= 6)
                    return true;
            }
        }
        return false
    }

    deltaIn(params,condition) {
        let set = params.bet.strategy.params[condition].set
        let delta = params.bet.strategy.params[condition].delta
        return (Math.abs(Number(params.event.score_home[set -1]) - Number(params.event.score_away[set -1])) <= delta)
    }

    // 动作函数
    placeBet(params, condition) {

        let net_profit = 0.0
        let sizeMatched = 0.0
        let current_odds = 0.0
        // 首先判断currentBets中是否已经place,如果place则cancel

        params.bet.currentBets.forEach(placed => {

            if (Number(placed.sizeMatched) > 0.0){
                sizeMatched = Number(placed.sizeMatched)
                if (placed.side === 'BACK')
                    net_profit = (placed.price - 1.0) * Number(placed.sizeMatched)
                else if(placed.side === 'LAY')
                    net_profit = Number(placed.sizeMatched)  
            }
            
            let selectionId = params.bet.selectionId
            if (params.bet.strategy.params[condition].oth)
                selectionId = params.bet.oth_selectionId
            if (placed.selectionId === Number(selectionId) && placed.side === params.bet.strategy.params[condition].side) {
                if (Number(placed.sizeMatched) != Number(placed.sizePlaced)) {
                    cy.get(`body`).then($body => {
                        if ($body.find(`div[data-offer-id="${placed.offerId}"]`).length > 0) {
                          cy.intercept({
                                hostname : 'www.orbitxch.com',
                                pathname : "/customer/api/cancelBets"
                              }).as('cancel')

                          cy.get(`div[data-offer-id="${placed.offerId}"`).find('button')
                            .contains('Cancel bet')
                            .click();

                            cy.wait('@cancel',{timeout:30000}).then(response => {
                                cy.wait(10000).then(() => {
                                    return
                                })
                               })
                        }
                      });
                } 
                return
            }
        })

        //如果已有超过两个Matched order,则返回
        if (params.bet.currentBets.filter(item => item.eventId === params.bet['data-event-id']).length < 2){

        // //访问runner_url,place_bet,intercept request,and modify request,then submit.
        // cy.visit(params.bet.runner_url,{timeout:20000}).then(()=>{

        //     cy.get('body').then($body => {
        //         if ($body.find('span:contains("Show all")').length) {
        //           // 如果找到了包含 'Show all' 的 span，则点击
        //           cy.contains('span', 'Show all').click();
        //         } 
        //       }).then(() => {

        //     let runner = params.bet.runner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        //     let selectionId = params.bet.selectionId
        //     if (params.bet.strategy.params[condition]['oth']) {
        //         runner = params.bet.oth_runner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        //         selectionId = params.bet.oth_selectionId
        //     }
        //     let side = 'biab_back-0';
        //     if (params.bet.strategy.params[condition].hasOwnProperty('side')) 
        //         if (params.bet.strategy.params[condition]['side'] === 'LAY')
        //             side = 'biab_lay-0';
            
        //     cy.contains('span', new RegExp(`^${runner}$`),{timeout:20000}).closest('div[data-market-id]')
        //         .find(`button[data-cell-id="${selectionId}"].${side}`).as('odds').click();
        //     // cy.get('@odds').find('span.betOdds').invoke('text').then((oddsText) => {
        //     //         current_odds = oddsText;
        //     //     });

        //     //找到当前赔率
        //     if (params.bet.strategy.params[condition].oth){
        //         if (params.bet.strategy.params[condition].side === 'BACK')
        //             current_odds = params.event.oth_back_odds;
        //         else
        //             current_odds = params.event.oth_lay_odds;
        //     }else{
        //         if (params.bet.strategy.params[condition].side === 'BACK')
        //             current_odds = params.event.back_odds;
        //         else
        //             current_odds = params.event.lay_odds;
        //     }

        //     let size = 0;
        //     if (params.bet.strategy.params[condition].hasOwnProperty('vol'))
        //         size = params.bet.strategy.params[condition]['vol'];
        //     else if (params.bet.strategy.params[condition].hasOwnProperty('scale'))
        //         size = params.bet.strategy.params[condition]['scale'] * (net_profit - sizeMatched/(current_odds - 1.0)) + sizeMatched/(current_odds - 1.0);          
        //     if (params.bet.strategy.params[condition].hasOwnProperty('price'))
        //         cy.get('input[data-field-type="PRICE"]').clear().type(params.bet.strategy.params[condition]['price']);

        //     if (size > 0) {
        //         cy.intercept({
        //             hostname : 'www.orbitxch.com',
        //             pathname : "/customer/api/placeBets"
        //           }).as('place')

        //         cy.get('input[data-field-type="SIZE"]').clear().type(size);
        //         cy.contains('button', 'Place bets').click();

        //         cy.wait('@place',{timeout:30000}).then(response => {
        //             cy.wait(10000).then(() => {
        //                 return
        //             })
        //         })
        //     }
         
        //   })  
        // })




    }
    }
}

