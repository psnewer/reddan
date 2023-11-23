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

    isStop(params,condition) {
        if (params.hasOwnProperty('event') && Object.keys(params.event).some(key => key.includes('odds')))
            return false;
        else
            return true
    }

    break(params, condition) {
        return true
    }

    notPlaceOne(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.marketId === params.bet['data-market-id']);
        if (currentBets.length === 0)
            return true;
        return false;
    }

    notPlaceTwo(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.marketId === params.bet['data-market-id']);
        const matched = currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        if (currentBets.length === 1)
            if (matched.length === 1)
                return true
        return false;
    }

    notMatchOne(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.marketId === params.bet['data-market-id']);
        const matched = currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        if (currentBets.length <= 1)
            if (matched.length === 0)
                return true
        return false;
    }

    notMatchTwo(params,condition) {
        const currentBets = params.bet.currentBets.filter(item => item.marketId === params.bet['data-market-id']);
        const matched = currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        if (currentBets.length <= 2)
            if (matched.length === 1)
                return true
        return false;
    }

    isRunnerAdvance(params,condition) {
        if (params.bet.runner.includes(params.bet.home))
            return Number(params.event.score_home) > Number(params.event.score_away);
        else
            return Number(params.event.score_away) > Number(params.event.score_home) ;
    }

    timeElapseTo(params,condition) {
        return params.event.timeElapsed >= params.bet.strategy.params[condition].time_to
    }

    notTimeElapseTo(params,condition) {
        return !(params.event.timeElapsed > params.bet.strategy.params[condition].cut_time)
    }

    isDraw(params,condition) {
        if (params.event.score_home === params.event.score_away)
            return true
        return false
    }

    loseSet(params,condition) {
        let set = params.bet.strategy.params[condition].set
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
        if (params.event.score_home.length === set && params.event.score_away.length === set){
            if (params.bet.runner.includes(params.bet.home)){
                if (Number(params.event.score_away[set - 1]) > Number(params.event.score_home[set - 1]))
                    return true;  
            }
            else if (params.bet.runner.includes(params.bet.away)){
                if (Number(params.event.score_home[set - 1]) > Number(params.event.score_away[set - 1]))
                    return true;
            }
        }
        return false
    }

    winSet(params,condition) {
        let set = params.bet.strategy.params[condition].set
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
        if (params.event.score_home.length === set && params.event.score_away.length === set){
            if (params.bet.runner.includes(params.bet.home)){
                if (Number(params.event.score_home[set - 1]) > Number(params.event.score_away[set -1]))
                    return true;
            }
            else if (params.bet.runner.includes(params.bet.away)){
                if (Number(params.event.score_away[set -1]) > Number(params.event.score_home[set - 1]))
                    return true;
            }
        }
        return false
    }

    eitherLose(params,condition){
        let set = params.bet.strategy.params[condition].set
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
        if (params.event.score_home.length === set && params.event.score_away.length === set){
            if (params.bet.runner.includes(params.bet.home)){
                if (Number(params.event.score_home[set - 1]) > Number(params.event.score_away[set -1])){
                    params.bet.strategy.params[condition]['oth'] = true
                }     
            }
            else if (params.bet.runner.includes(params.bet.away)){
                if (Number(params.event.score_away[set -1]) > Number(params.event.score_home[set - 1])){
                    params.bet.strategy.params[condition]['oth'] = true
                }
            }
            return true
        }
        return false
    }

    loseWin(params,condition){
        let loseset = params.bet.strategy.params[condition].loseset
        let winset = params.bet.strategy.params[condition].winset
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
        if (params.event.score_home.length === winset && params.event.score_away.length === winset){
            if (Number(params.event.score_home[winset - 1]) < Number(params.event.score_away[winset - 1])){
                if (Number(params.event.score_home[loseset - 1]) > Number(params.event.score_away[loseset - 1])){
                    if (params.bet.runner.includes(params.bet.away)){
                        params.bet.strategy.params[condition]['oth'] = true
                    }
                    return true;
                }     
            }
            else if (Number(params.event.score_away[winset - 1]) < Number(params.event.score_home[winset - 1])){
                if (Number(params.event.score_away[loseset - 1]) > Number(params.event.score_home[loseset - 1])){
                    if (params.bet.runner.includes(params.bet.home)){
                        params.bet.strategy.params[condition]['oth'] = true
                    }
                    return true;
                }    
            }  
        }
        return false
    }

    deltaIn(params,condition) {
        let set = params.bet.strategy.params[condition].set
        let delta = params.bet.strategy.params[condition].delta
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
            return (Math.abs(Number(params.event.score_home[set -1]) - Number(params.event.score_away[set -1])) <= delta)
        return false
    }

    // 动作函数
    placeBet(params, condition) {
        
        let net_profit = 0.0
        let sizeMatched = 0.0
        let current_odds = 0.0
        let pre_side = ''
        let thresh_back_odds = 0.0
        let thresh_lay_odds = 0.0
        let CANCEL = false
        // 首先判断currentBets中是否已经place,如果place则cancel
        params.bet.currentBets.forEach(placed => {

            if (Number(placed.sizeMatched) > 0.0){
                sizeMatched = Number(placed.sizeMatched)
                if (placed.side === 'BACK'){
                    net_profit = (placed.averagePrice - 1.0) * Number(placed.sizeMatched)
                    pre_side = 'BACK'
                    thresh_back_odds = 1.0 + 1.0/(Number(placed.averagePrice) - 1.0)
                    thresh_lay_odds = Number(placed.averagePrice)
                }
                else if(placed.side === 'LAY'){
                    net_profit = (placed.averagePrice - 1.0) * Number(placed.sizeMatched) 
                    pre_side = 'LAY'
                    thresh_back_odds = Number(placed.averagePrice)
                    thresh_lay_odds = 1.0 + 1.0/(Number(placed.averagePrice) - 1.0)
                }
            }
            
            if (placed.marketId === params.bet['data-market-id']){
                if (Number(placed.sizeMatched) != Number(placed.sizePlaced)) {
                    CANCEL = true
                    // cy.log('CANCEL')
                    // return
                    cy.cancelBet(placed.marketId,placed.offerId)
                } 
            }
            
        })

        if (CANCEL)
            return true

        //如果已有超过两个Matched order,则返回
        if (params.bet.currentBets.filter(item => item.marketId === params.bet['data-market-id']).length < 2){

            let selectionId = params.bet.selectionId
            let handicap = params.bet.handicap
            if (params.bet.strategy.params[condition]['oth']) {
                selectionId = params.bet.oth_selectionId
                handicap = params.bet.oth_handicap
            }

            //找到当前赔率
            if (params.bet.strategy.params[condition].oth){
                if (params.bet.strategy.params[condition].side === 'BACK'){
                    current_odds = params.event.oth_back_odds;
                    if (pre_side != '' && (thresh_back_odds === 0.0 || current_odds < thresh_back_odds))
                        return
                }
                else {
                    current_odds = params.event.oth_lay_odds;
                    if (pre_side != '' && (thresh_lay_odds === 0.0 || current_odds > thresh_lay_odds))
                        return
                }
            }else{
                if (params.bet.strategy.params[condition].side === 'BACK'){
                    current_odds = params.event.back_odds;
                    if (pre_side != '' && (thresh_back_odds === 0.0 || current_odds < thresh_back_odds))
                        return
                }
                else {
                    current_odds = params.event.lay_odds;
                    if (pre_side != '' && (thresh_lay_odds === 0.0 || current_odds > thresh_lay_odds))
                        return
                }
            }

            let size = 0;
            let price = 1.01
            if (params.bet.strategy.params[condition].hasOwnProperty('vol'))
                size = params.bet.strategy.params[condition]['vol'];
            else if (params.bet.strategy.params[condition].hasOwnProperty('scale')){
                if (params.bet.strategy.params[condition].side === 'LAY') {
                    if (pre_side === 'BACK')
                        size = params.bet.strategy.params[condition]['scale'] * (sizeMatched - net_profit / (current_odds - 1.0)) + net_profit/(current_odds - 1.0)
                    else if (pre_side === 'LAY')
                        size = params.bet.strategy.params[condition]['scale'] * (sizeMatched / (current_odds - 1.0) - net_profit) + net_profit
                }
                else {
                    if (pre_side === 'BACK')
                        size = params.bet.strategy.params[condition]['scale'] * (net_profit - sizeMatched/(current_odds - 1.0)) + sizeMatched/(current_odds - 1.0);  
                    else if (pre_side === 'LAY')
                        size = params.bet.strategy.params[condition]['scale'] * (net_profit / (current_odds - 1.0) - sizeMatched) + sizeMatched
                }
            }  
            if (params.bet.strategy.params[condition].hasOwnProperty('profit')){
                if (params.bet.strategy.params[condition].side === 'BACK')
                    price = thresh_back_odds + params.bet.strategy.params[condition].profit
                else if (params.bet.strategy.params[condition].side === 'LAY')
                    price = thresh_lay_odds - params.bet.strategy.params[condition].profit
            }      
            else if (params.bet.strategy.params[condition].hasOwnProperty('price'))
                price = params.bet.strategy.params[condition]['price'];

            if (size >= 6.0 && price >= 1.0) {
                // cy.log('PLACE')
                // return
                cy.placeBet(params.bet['data-market-id'],price.toFixed(2),size.toFixed(2),selectionId,handicap,params.bet.strategy.params[condition].side)
            }

    }
    }
}

