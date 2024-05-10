const fs = require('fs').promises;
const { countElementsGE, assertBet } = require('./utils.js');
const { cancelBet, placeBet } = require('./commands.js');

class StrategyExecutor {

    constructor(strategyFile) {
        this.strategyFile = strategyFile;
    }

    async initialize() {
        const content = await fs.readFile(this.strategyFile, 'utf8');
        this.strategies = JSON.parse(content);
    }

    async execute(strategyName, params) {
        const strategy = this.strategies[strategyName];
        if (!strategy) {
            console.log('Strategy not found.');
            return;
        }

        for (let rule of strategy) {
            if (this[rule.condition](params, rule.condition)) {
                if (rule.hasOwnProperty('checktion')) {
                    for (let check of rule.checktion) {
                        if (!this[check](params, rule.condition))
                            return
                    }
                }
                if (rule.action === 'placeBet') 
                    await this[rule.action](params, rule.condition);
                else
                    this[rule.action](params, rule.condition);
                break;  // 结束策略执行
            }
        }
    }

    // 条件判断函数
    notInPlay(params, condition) {
        if (params.hasOwnProperty('event'))
            if ((params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) || params.event.inplay)
                return false
        return true;
    }

    isStop(params, condition) {
        if (params.hasOwnProperty('event'))
            if (Object.keys(params.event).some(key => key.includes('odds')))
                return false;
        return true
    }

    notStop(params, condition) {
        return !this.isStop(params, condition)
    }

    betweensets(params, condition) {
        if (params.event.hasOwnProperty('score_homeS') && params.event.hasOwnProperty('score_awayS'))
            if (params.event.score_homeS == 0 && params.event.score_awayS == 0)
                return true
        return false
    }

    inSets(params, condition) {
        if (params.event.hasOwnProperty('score_homeS') && params.event.hasOwnProperty('score_awayS'))
            if (params.event.score_homeS > 0 || params.event.score_awayS > 0)
                return true
        return false
    }

    break(params, condition) {
        return true
    }

    breakdown(params, condition) {
        if (params.event.score_home.length < params.bet.strategy.params[condition].until) {
        let winner = 0
        if (params.bet.home == params.bet.runner)
            params.event.score_homeS > params.event.score_awayS ? 1 : 2
        else
            params.event.score_homeS > params.event.score_awayS ? 2 : 1

        if (params.event.hasOwnProperty('params.event.lastIsRunner')) {
            if (params.event.lastIsRunner) {
                if (params.bet.strategy.name.includes('3')) {
                    if (params.event.firstIsRunner) {
                        if (winner == 1)
                            return true
                    } else {
                        if (winner == 0)
                            return true
                    }
                } else {
                    if (params.bet.strategy.name.includes('1')) {
                        if (winner == 0)
                            return true
                    }
                    else if (params.bet.strategy.name.includes('2')) {
                        if (params.bet.firstIsRunner) {
                            if (winner == 0)
                                return true
                        } else {
                            if (winner == 1)
                                return true
                        }
                    }
                }
            } else {
                if (params.bet.strategy.name.includes('3')) {
                    if (params.event.firstIsRunner) {
                        if (winner == 0)
                            return true
                    } else {
                        if (winner == 2)
                            return true
                    }
                } else {
                    if (params.bet.strategy.name.includes('1')) {
                        if (winner == 2)
                            return true
                    }
                    else if (params.bet.strategy.name.includes('2')) {
                        if (params.bet.firstIsRunner) {
                            if (winner == 2)
                                return true
                        } else {
                            if (winner == 0)
                                return true
                        }
                    }
                }
            }
        } else {
            if (params.bet.strategy.name.includes('2')) {
                if (winner != 0)
                    return true
            }
            else if (params.bet.strategy.name.includes('1')) {
                if (winner == 2 && params.bet.strategy.params[condition].side == 'BACK')
                    return true
                else if (winner == 1 && params.bet.strategy.params[condition].side == 'LAY')
                    return true
            }
            
        }
    }
        return false
    }

    notPlaceOne(params, condition) {
        const currentBets = params.bet.currentBets;
        if (currentBets.length === 0)
            return true;
        return false;
    }

    notPlaceTwo(params, condition) {
        const currentBets = params.bet.currentBets;
        const matched = currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        if (currentBets.length === 1)
            if (matched.length === 1)
                return true
        return false;
    }

    notMatchOne(params, condition) {
        const currentBets = params.bet.currentBets;
        const matched = currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        if (currentBets.length <= 1)
            if (matched.length === 0)
                return true
        return false;
    }

    notMatchTwo(params, condition) {
        const currentBets = params.bet.currentBets;
        const matched = currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        if (currentBets.length <= 2)
            if (matched.length === 1)
                return true
        return false;
    }

    isRunnerAdvance(params, condition) {
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

    timeElapseTo(params, condition) {
        if (params.event.hasOwnProperty('timeElapsed'))
            return params.event.timeElapsed >= params.bet.strategy.params[condition].time_to
        return false
    }

    notTimeElapseTo(params, condition) {
        if (params.event.hasOwnProperty('timeElapsed'))
            return (params.event.timeElapsed < params.bet.strategy.params[condition].time_to)
        return false
    }

    ending(params, condition) {
        if (params.event.hasOwnProperty('timeElapsed'))
            return params.event.timeElapsed >= params.bet.strategy.params[condition].time_to
        return false
    }

    isDraw(params, condition) {
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away'))
            if (params.event.score_home == params.event.score_away)
                return true
        return false
    }

    deltaGE(params, condition) {
        let delta = params.bet.strategy.params[condition].delta
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
            if (params.bet.runner.includes(params.bet.home))
                return (Number(params.event.score_home) - Number(params.event.score_away) >= delta)
            else
                return (Number(params.event.score_away) - Number(params.event.score_home) >= delta)
        }
        return false
    }

    loseSet(params, condition) {
        if (params.bet.sport === "Tennis") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length >= set && params.event.score_away.length >= set) {
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
                if (params.event.score_home > 0 || params.event.score_away > 0) {
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
                if (params.event.score_home > 0 || params.event.score_away > 0) {
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

    winSet(params, condition) {
        if (params.bet.sport === "Tennis") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length >= set && params.event.score_away.length >= set) {
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
                if (params.event.score_home > 0 && params.event.score_away > 0) {
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
                if (params.event.score_home > 0 && params.event.score_away > 0) {
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

    eitherLose(params, condition) {
        if (params.bet.sport === "Tennis") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length >= set && params.event.score_away.length >= set) {
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

    loseWin(params, condition) {
        if (params.bet.sport === "Tennis") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 2 && params.event.score_home.length >= set && params.event.score_away.length >= set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    const home_squence_pre = params.event.score_home.slice(0, set - 1)
                    const away_squence_pre = params.event.score_away.slice(0, set - 1)
                    if (countElementsGE(away_squence, home_squence) >= 0 && countElementsGE(away_squence_pre, home_squence_pre) < 0) {
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
                    if (params.event.score_home == params.event.score_away) {
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
                    if (Math.abs(params.event.score_home - params.event.score_away) <= delta) {
                        return true
                    }
                }
            }
            return false
        }
    }

    deltaIn(params, condition) {
        let delta = params.bet.strategy.params[condition].delta
        if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
            if (params.bet.sport === "Tennis") {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set)
                    return (Math.abs(Number(params.event.score_home[set - 1]) - Number(params.event.score_away[set - 1])) <= delta)
            }
            else {
                return (Math.abs(params.event.score_home - params.event.score_away) <= delta)
            }
        }
        return false
    }

    commission(params, condition) {
        if ((params.event.back_odds - 1.0) * (params.event.oth_back_odds - 1.0) > params.bet.strategy.params[condition].guarantee)
            return true
        return false
    }

    // 动作函数
    async placeBet(params, condition) {
        let CANCEL = false
        // 首先判断currentBets中是否已经place,如果place则cancel
        let currentBets = params.bet.currentBets
        for (const placed of currentBets) {
            if (placed.marketId === params.bet['data-market-id']) {
                if (Number(placed.sizeMatched) != Number(placed.sizePlaced)) {
                    CANCEL = true
                    // console.log('CANCEL')
                    // return
                    if (!global.placing) {
                        global.placing = true
                        await cancelBet(params.bet.page, placed.marketId, placed.offerId)
                    }
                }
            }
        }

        if (CANCEL)
            return true

        //根据matched bet设置oth
        if (params.event.runner_side == 'BACK' || params.event.oth_side == 'BACK') {
            if (params.bet.strategy.params[condition].hasOwnProperty('side') && params.bet.strategy.params[condition]['oth'])
                if (pre_side != params.bet.strategy.params[condition].side)
                    delete params.bet.strategy.params[condition].side
            params.bet.strategy.params[condition]['oth'] = false
            if (params.bet.strategy.params[condition].hasOwnProperty('side')) {
                if (params.event.runner_side == params.bet.strategy.params[condition].side) {
                        params.bet.strategy.params[condition]['oth'] = true
                }
            } else {
                if (params.event.runner_side == 'BACK') {
                    params.bet.strategy.params[condition].side = 'LAY'
                }
                else if (params.event.runner_side == 'LAY'){
                    params.bet.strategy.params[condition].side = 'BACK'
                }
            }
        } else {
            if (!params.bet.strategy.params[condition].hasOwnProperty('side')) {
                if (params.bet.strategy.params[condition]['oth'])
                    params.bet.strategy.params[condition].side = 'LAY'
                else
                    params.bet.strategy.params[condition].side = 'BACK'
                params.bet.strategy.params[condition]['oth'] = false
            }
        }

        if (params.bet.strategy.params[condition]['oth']){
            if (runner_side == params.bet.strategy.params[condition].side) {
                params.bet.strategy.params[condition].handicap = -runner_handicap
            }
            else if (runner_side != params.bet.strategy.params[condition].side) {
                params.bet.strategy.params[condition].handicap = runner_handicap
            }
        } else {
            if (runner_side == params.bet.strategy.params[condition].side) {
                params.bet.strategy.params[condition].handicap = runner_handicap
            }
            else if (runner_side != params.bet.strategy.params[condition].side) {
                params.bet.strategy.params[condition].handicap = -runner_handicap
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
                runner_thresh_back_odds = params.event.runner_thresh_odds - rec
                runner_thresh_lay_odds = params.event.runner_thresh_odds + rec
                oth_thresh_back_odds = params.event.oth_thresh_odds - rec
                oth_thresh_lay_odds = params.event.oth_thresh_odds + rec
            }

            //找到当前赔率
            if (params.bet.strategy.params[condition].oth) {
                if (params.bet.strategy.params[condition].side === 'BACK') {
                    current_odds = params.event.oth_back_odds;
                    if (!current_odds || (pre_side != '' && (thresh_back_odds === 0.0 || current_odds < oth_thresh_back_odds)))
                        return
                }
                else {
                    current_odds = params.event.oth_lay_odds;
                    if (!current_odds || (pre_side != '' && (thresh_lay_odds === 0.0 || current_odds > oth_thresh_lay_odds)))
                        return
                }
            } else {
                if (params.bet.strategy.params[condition].side === 'BACK') {
                    current_odds = params.event.back_odds;
                    if (!current_odds || (pre_side != '' && (thresh_back_odds === 0.0 || current_odds < runner_thresh_back_odds)))
                        return
                }
                else {
                    current_odds = params.event.lay_odds;
                    if (!current_odds || (pre_side != '' && (thresh_lay_odds === 0.0 || current_odds > runner_thresh_lay_odds)))
                        return
                }
            }

            let size = 0;
            let price = current_odds
            let net_profit = 0.0
            let liability = 0.0

            if (params.bet.strategy.params[condition].oth) {
                if (params.bet.strategy.params[condition].side === 'LAY') {
                    net_profit = params.event.oth_win
                    liability = params.event.runner_win > 0.0 ? 0.0:params.event.runner_win
                } else {
                    net_profit = params.event.runner_win
                    liability = params.event.oth_win > 0.0 ? 0.0:params.event.oth_win
                }
            } else {
                if (params.bet.strategy.params[condition].side === 'LAY') {
                    net_profit = params.event.runner_win
                    liability = params.event.oth_win > 0.0 ? 0.0:params.event.oth_win
                } else {
                    net_profit = params.event.oth_win
                    liability = params.event.runner_win > 0.0 ? 0.0:params.event.runner_win
                }
            }

            if (params.bet.strategy.params[condition].hasOwnProperty('vol') && (parseInt(params.event.runner_win) == 0.0 && parseInt(params.event.oth_win) == 0.0))
                size = params.bet.strategy.params[condition]['vol'];
            else if (params.bet.strategy.params[condition].hasOwnProperty('scale')) {
                if (params.bet.strategy.params[condition].side === 'LAY') {
                    size = params.bet.strategy.params[condition]['scale'] * (net_profit / (current_odds - 1.0) - liability) + liability
                }
                else {
                    size = params.bet.strategy.params[condition]['scale'] * (net_profit - liability / (current_odds - 1.0)) + liability / (current_odds - 1.0);
                }
            }
            if (params.bet.strategy.params[condition].hasOwnProperty('profit')) {
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

            if (size.toFixed(2) < 6.0)
                size = 6.0
            if (size.toFixed(2) >= 6.0 && price >= 1.0) {
                const result = assertBet(currentBets[0], selectionId, params, condition)
                if (!result) return;

                // console.log('PLACE', params.bet['data-market-id'], price.toFixed(2), size.toFixed(2), selectionId, handicap, params.bet.strategy.params[condition].side)
                // return

                if (!global.placing) {
                    global.placing = true
                    await placeBet(params.bet.page, params.bet['data-market-id'], price.toFixed(2), size.toFixed(2), selectionId, handicap, params.bet.strategy.params[condition].side)
                }

            }
    
    }
}

module.exports = StrategyExecutor;

