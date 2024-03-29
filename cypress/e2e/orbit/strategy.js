const fs = require('fs');
import {countElementsGE, assertBet} from './utils.js';

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
            if ((params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) || params.event.inplay)
                return false
        return true;
    }

    isStop(params,condition) {
        if (params.hasOwnProperty('event'))
            if (Object.keys(params.event).some(key => key.includes('odds')))
                return false;
        return true
    }

    notStop(params,condition) {
        return !this.isStop(params,condition)
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
        if (params.bet.sport === "Soccer") {
            if (params.bet.runner.includes(params.bet.home))
                return Number(params.event.score_home) > Number(params.event.score_away)
            else
                return Number(params.event.score_away) > Number(params.event.score_home)
        }
        else if (params.bet.sport === "Basketball") {
            let delta = params.bet.strategy.params[condition].delta
            if (params.bet.runner.includes(params.bet.home))
                return Number(params.event.score_home) - Number(params.event.score_away) >= delta
            else
                return Number(params.event.score_away) - Number(params.event.score_home) >= delta
        }
    }

    timeElapseTo(params,condition) {
        if (params.event.hasOwnProperty('timeElapsed'))
            return params.event.timeElapsed >= params.bet.strategy.params[condition].time_to
        return false
    }

    notTimeElapseTo(params,condition) {
        if (params.event.hasOwnProperty('timeElapsed'))
            return (params.event.timeElapsed < params.bet.strategy.params[condition].time_to)
        return false
    }

    ending(params,condition) {
        if (params.event.hasOwnProperty('timeElapsed'))
            return params.event.timeElapsed >= params.bet.strategy.params[condition].time_to
        return false
    }

    isDraw(params,condition) {
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
            if (params.event.score_home == params.event.score_away)
                return true
        return false
    }

    deltaGE(params,condition) {
        let delta = params.bet.strategy.params[condition].delta
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
            if (params.bet.runner.includes(params.bet.home))
                return (Number(params.event.score_home) - Number(params.event.score_away) >= delta)
            else
                return (Number(params.event.score_away) - Number(params.event.score_home) >= delta)
        }
        return false
    }

    loseSet(params,condition) {
        if (params.bet.sport === "Tennis") {
            let set = params.event.score_home.length
            if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                set = params.bet.strategy.params[condition].set
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (set >= 1 && params.event.score_home.length >= set && params.event.score_away.length >= set){
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (countElementsGE(away_squence, home_squence) > 0)
                            return true;  
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (countElementsGE(home_squence, away_squence) > 0)
                            return true;
                    }
                }
            }
            return false
        }
        else if (params.bet.sport === "Soccer") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (params.event.score_home > 0 || params.event.score_away > 0){
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (params.event.score_away > params.event.score_home)
                            return true;  
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (params.event.score_home > params.event.score_away)
                            return true;
                    }
                }
            }
            return false
        }
        else if (params.bet.sport === "Basketball") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (params.event.score_home > 0 || params.event.score_away > 0){
                    let delta = params.bet.strategy.params[condition].delta
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (params.event.score_away - params.event.score_home >= delta)
                            return true;  
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (params.event.score_home - params.event.score_away >= delta)
                            return true;
                    }
                }
            }
            return false
        }
    }

    winSet(params,condition) {
        if (params.bet.sport === "Tennis") {
            let set = params.event.score_home.length
            if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                set = params.bet.strategy.params[condition].set
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (set >= 1 && params.event.score_home.length >= set && params.event.score_away.length >= set){
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (countElementsGE(home_squence, away_squence) >= 0)
                            return true;  
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (countElementsGE(away_squence, home_squence) >= 0)
                            return true;
                    }
                }
            }
            return false
        }
        else if (params.bet.sport === "Soccer") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (params.event.score_home > 0 && params.event.score_away > 0){
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (params.event.score_home >= params.event.score_away)
                            return true;  
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (params.event.score_away >= params.event.score_home)
                            return true;
                    }
                }
            }
            return false
        }
        else if (params.bet.sport === "Basketball") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (params.event.score_home > 0 && params.event.score_away > 0){
                    let delta = params.bet.strategy.params[condition].delta
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (params.event.score_home - params.event.score_away >= delta)
                            return true;  
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (params.event.score_away - params.event.score_home >= delta)
                            return true;
                    }
                }
            }
            return false
        }
    }

    eitherLose(params,condition){
        if (params.bet.sport === "Tennis") {
            let set = params.event.score_home.length
            if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                set = params.bet.strategy.params[condition].set
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (set >= 1 && params.event.score_home.length >= set && params.event.score_away.length >= set){
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (countElementsGE(home_squence, away_squence) > 0) {
                        if (params.bet.runner.includes(params.bet.home))
                            params.bet.strategy.params[condition]['oth'] = true 
                        return true
                    }
                    else if (countElementsGE(away_squence, home_squence) > 0) {
                        if (params.bet.runner.includes(params.bet.away))
                            params.bet.strategy.params[condition]['oth'] = true
                        return true
                    }    
                }
            }
            return false
        }
        else if (params.bet.sport === "Soccer") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (Number(params.event.score_home) > 0 || Number(params.event.score_away) > 0) {
                    if (params.event.score_home > params.event.score_away) {
                        if (params.bet.runner.includes(params.bet.home))
                            params.bet.strategy.params[condition]['oth'] = true 
                        return true
                    }
                    else if (params.event.score_away > params.event.score_home) {
                        if (params.bet.runner.includes(params.bet.away))
                            params.bet.strategy.params[condition]['oth'] = true
                        return true
                    }    
                }
            }
            return false
        }
        else if (params.bet.sport === "Basketball") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (Number(params.event.score_home) > 0 || Number(params.event.score_away) > 0) {
                    let delta = params.bet.strategy.params[condition].delta
                    if (params.event.score_home - params.event.score_away >= delta) {
                        if (params.bet.runner.includes(params.bet.home))
                            params.bet.strategy.params[condition]['oth'] = true 
                        return true
                    }
                    else if (params.event.score_away - params.event.score_home >= delta) {
                        if (params.bet.runner.includes(params.bet.away))
                            params.bet.strategy.params[condition]['oth'] = true
                        return true
                    }    
                }
            }
            return false
        }
    }

    loseWin(params,condition){
        if (params.bet.sport === "Tennis") {
            let set = params.event.score_home.length
            if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                set = params.bet.strategy.params[condition].set
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (set >= 2 && params.event.score_home.length >= set && params.event.score_away.length >= set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    const home_squence_pre = params.event.score_home.slice(0, set-1)
                    const away_squence_pre = params.event.score_away.slice(0, set-1)
                    if (countElementsGE(away_squence, home_squence) >= 0 && countElementsGE(away_squence_pre, home_squence_pre) < 0){
                        return true
                    }
                    else if (countElementsGE(home_squence, away_squence) >= 0 && countElementsGE(home_squence_pre, away_squence_pre) < 0) {
                        return true
                    }  
                }
            }
            return false
        }
        else if (params.bet.sport === "Soccer") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (params.event.score_home > 0 && params.event.score_away > 0) {
                    if (params.event.score_home == params.event.score_away){
                        return true
                    }
                }
            }
            return false           
        }
        else if (params.bet.sport === "Basketball") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                if (params.event.score_home > 0 && params.event.score_away > 0) {
                    let delta = params.bet.strategy.params[condition].delta
                    if (Math.abs(params.event.score_home - params.event.score_away) <= delta){
                        return true
                    }
                }
            }
            return false           
        }
    }

    deltaIn(params,condition) {
        let delta = params.bet.strategy.params[condition].delta
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
            if (params.bet.sport === "Tennis") {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set) 
                    return (Math.abs(Number(params.event.score_home[set -1]) - Number(params.event.score_away[set -1])) <= delta)
            }
            else {
                return (Math.abs(params.event.score_home - params.event.score_away) <= delta)
            }
        }
        return false
    }

    commission(params,condition) {
        if ((params.event.back_odds - 1.0) * (params.event.oth_back_odds - 1.0) > params.bet.strategy.params[condition].guarantee)
            return true
        return false
    }

    // 动作函数
    placeBet(params, condition) {
        let net_profit = 0.0
        let sizeMatched = 0.0
        let current_odds = 0.0
        let pre_side = ''
        let pre_handicap = 0
        let thresh_back_odds = 0.0
        let thresh_lay_odds = 0.0
        let CANCEL = false
        // 首先判断currentBets中是否已经place,如果place则cancel
        let currentBets = params.bet.currentBets.filter(item => item.marketId === params.bet['data-market-id'])
        currentBets.forEach(placed => {

            if (Number(placed.sizeMatched) > 0.0){
                sizeMatched = Number(placed.sizeMatched)
                pre_handicap = Number(placed.handicap)
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
                    cy.getEnv('placing').then(placing => {
                        if (!placing) {
                            cy.setEnv('placing',true)
                            cy.cancelBet(placed.marketId,placed.offerId)
                        }
                    })
                } 
            }
            
        })

        if (CANCEL)
            return true

        //如果已有超过两个Matched order,则返回
        if (currentBets.length < 2){

            //根据matched bet设置oth
            if (currentBets.length == 1) {
                params.bet.strategy.params[condition]['oth'] = false
                if (params.bet.strategy.params[condition].hasOwnProperty('side')) {
                    if (currentBets[0].selectionId == params.bet.selectionId) {
                        if (pre_side == params.bet.strategy.params[condition].side) {
                            params.bet.strategy.params[condition]['oth'] = true
                        }
                    }
                    else {
                        if (pre_side != params.bet.strategy.params[condition].side) {
                            params.bet.strategy.params[condition]['oth'] = true
                        }    
                    }

                    if (pre_side == params.bet.strategy.params[condition].side) {
                        params.bet.strategy.params[condition].handicap = -pre_handicap
                    }
                    else if (pre_side != params.bet.strategy.params[condition].side) {
                        params.bet.strategy.params[condition].handicap = pre_handicap
                    } 
                }
                else {
                    if (currentBets[0].selectionId == params.bet.selectionId) {
                        if (pre_side == 'BACK')
                            params.bet.strategy.params[condition].side = 'LAY'
                        else
                            params.bet.strategy.params[condition].side = 'BACK'
                    }
                    else {
                        if (pre_side == 'BACK')
                            params.bet.strategy.params[condition].side = 'BACK'
                        else
                            params.bet.strategy.params[condition].side = 'LAY'
                    }
                }
            }

            let selectionId = params.bet.selectionId
            let handicap = params.bet.handicap
            if (params.bet.strategy.params[condition]['oth']) {
                selectionId = params.bet.oth_selectionId
                handicap = params.bet.oth_handicap
            }

            //如果策略为either，纠正handicap，并纠正odds
            if (params.bet.strategy.params[condition].hasOwnProperty('handicap')) {
                if (Number(params.bet.strategy.params[condition].handicap) != Number(handicap)) {
                    handicap = params.bet.strategy.params[condition].handicap   
                    params.event.back_odds = params.event.back_odds_either
                    params.event.lay_odds = params.event.lay_odds_either
                    params.event.oth_back_odds = params.event.oth_back_odds_either
                    params.event.oth_lay_odds = params.event.oth_lay_odds_either
                }
            }

            let rec = 0.0
            if (params.bet.strategy.params[condition].hasOwnProperty('rec')) {
                rec = params.bet.strategy.params[condition].rec
                thresh_back_odds = 1.0 + (thresh_back_odds - 1.0) * (1.0 - rec)
                thresh_lay_odds = 1.0 + (thresh_lay_odds - 1.0) * (1.0 + rec)
            }

            //找到当前赔率
            if (params.bet.strategy.params[condition].oth){
                if (params.bet.strategy.params[condition].side === 'BACK'){
                    current_odds = params.event.oth_back_odds;
                    if (!current_odds || (pre_side != '' && (thresh_back_odds === 0.0 || current_odds < thresh_back_odds)))
                        return
                }
                else {
                    current_odds = params.event.oth_lay_odds;
                    if (!current_odds || (pre_side != '' && (thresh_lay_odds === 0.0 || current_odds > thresh_lay_odds)))
                        return
                }
            }else{
                if (params.bet.strategy.params[condition].side === 'BACK'){
                    current_odds = params.event.back_odds;
                    if (!current_odds || (pre_side != '' && (thresh_back_odds === 0.0 || current_odds < thresh_back_odds)))
                        return
                }
                else {
                    current_odds = params.event.lay_odds;
                    if (!current_odds || (pre_side != '' && (thresh_lay_odds === 0.0 || current_odds > thresh_lay_odds)))
                        return
                }
            }

            let size = 0;
            let price = current_odds
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
            else if (params.bet.strategy.params[condition].hasOwnProperty('price')) {
                if (params.bet.strategy.params[condition].side == 'BACK' && price < params.bet.strategy.params[condition]['price'])
                    return
                else if (params.bet.strategy.params[condition].side == 'LAY' && price > params.bet.strategy.params[condition]['price'])
                    return
            }
                
            if (size.toFixed(2) >= 6.0 && price >= 1.0) {
                if (!assertBet(currentBets[0], selectionId, params, condition)) 
                    return
                // cy.log('PLACE')
                // return

                cy.getEnv('placing').then(placing => {
                    if (!placing) {
                        cy.setEnv('placing',true)
                        cy.placeBet(params.bet['data-market-id'],price.toFixed(2),size.toFixed(2),selectionId,handicap,params.bet.strategy.params[condition].side)
                    }
                })
            }

    }
    }
}

