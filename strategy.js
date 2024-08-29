const fs = require('fs').promises;
const { countElementsGE, assertBet } = require('./utils.js');
const { cancelBet, placeBet, getOddsData } = require('./commands.js');

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
                // console.log(rule.condition)
                if (rule.hasOwnProperty('checktion')) {
                    for (let check of rule.checktion) {
                        // console.log(check)
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
            if ((params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')))
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

    drawGames(params, condition) {
        if (this.inSets(params, condition))
            if (!this.breakdown(params, condition)) {
                if (params.bet.pre.hasBrokendown)
                    params.bet.pre.hasDrawGames = true
                return true
            }
        return false
    }

    inSets(params, condition) {
        if (params.event.hasOwnProperty('score_homeS') && params.event.hasOwnProperty('score_awayS'))
            if (params.event.score_homeS > 0 || params.event.score_awayS > 0)
                return true
            else {
                params.event.hasBrokendown = false
                params.event.hasBreakdown = false
            }
        return false
    }

    betweenSets(params, condition) {
        if (params.event.hasOwnProperty('score_homeS') && params.event.hasOwnProperty('score_awayS'))
            if (!this.inSets(params, condition))
                return true
        return false
    }

    break(params, condition) {
        return true
    }

    breakdown(params, condition) {
        if (params.event.hasOwnProperty('score_homeS') && params.event.hasOwnProperty('score_awayS')) {
            if (params.event.hasOwnProperty('Esrv') && params.event.score_homeS != params.event.score_awayS) {
                let score_homeS = params.event.Esrv == 2 ? params.event.score_homeS - 1 : params.event.score_homeS
                let score_awayS = params.event.Esrv == 1 ? params.event.score_awayS - 1 : params.event.score_awayS
                if (Math.abs(score_homeS - score_awayS) >= 1)
                    return true
            }
        }
        return false
    }

    BreakdownNotMatch(params, condition) {
        let match = false
        params.event.hasBrokendown = true
        if (params.event.score_home.length < params.bet.strategy.params[condition].until) {
            if (params.event.hasOwnProperty('lastIsRunner')) {
                if (params.event.score_homeS > params.event.score_awayS) {
                    if (params.event.lastIsRunner && params.bet.home == params.bet.runner)
                        match = true
                    else if (!params.event.lastIsRunner && params.bet.away == params.bet.runner)
                        match = true

                } else {
                    if (params.event.lastIsRunner && params.bet.away == params.bet.runner)
                        match = true
                    else if (!params.event.lastIsRunner && params.bet.home == params.bet.runner)
                        match = true
                }

                if (match && params.bet.strategy.params[condition].hasOwnProperty('on')) {
                    if (this.checkOnEnd(params, condition))
                        match = false
                }

                if (!match) {
                    if (params.bet.strategy.params[condition].hasOwnProperty('on'))
                        if (this.checkOn(params, condition)) {
                            if (params.event.lastIsRunner) {
                                if (params.event.score_homeS > params.event.score_awayS && params.bet.away == params.bet.runner)
                                    match = true
                                else if (params.event.score_homeS < params.event.score_awayS && params.bet.home == params.bet.runner)
                                    match = true
                            } else {
                                if (params.event.score_homeS > params.event.score_awayS && params.bet.home == params.bet.runner)
                                    match = true
                                else if (params.event.score_homeS < params.event.score_awayS && params.bet.away == params.bet.runner)
                                    match = true
                                if (match)
                                    params.bet.strategy.params[condition].oth = true
                            }
                            if (match)
                                params.bet.strategy.params[condition].on = true
                        }
                }
            } else if (countElementsGE(params.event.score_home, params.event.score_away) == 0 && !params.bet.pre.hasDrawGames) {
                if (!(params.bet.strategy.params[condition].first_runner || params.bet.strategy.params[condition].first_oth)) {
                    if (params.event.score_homeS > params.event.score_awayS && params.bet.home == params.bet.runner)
                        params.bet.strategy.params[condition].oth = true
                    else if (params.event.score_homeS < params.event.score_awayS && params.bet.away == params.bet.runner)
                        params.bet.strategy.params[condition].oth = true
                    match = true
                } else if (!params.bet.pre.hasBreakdown) {
                    if (params.bet.strategy.params[condition].first_runner) {
                        if (params.event.score_homeS > params.event.score_awayS && params.bet.away == params.bet.runner)
                            match = true
                        else if (params.event.score_homeS < params.event.score_awayS && params.bet.home == params.bet.runner)
                            match = true
                    }
                    if (params.bet.strategy.params[condition].first_oth) {
                        if (params.event.score_homeS > params.event.score_awayS && params.bet.home == params.bet.runner) {
                            match = true
                            params.bet.strategy.params[condition].oth = true
                        }
                        else if (params.event.score_homeS < params.event.score_awayS && params.bet.away == params.bet.runner) {
                            match = true
                            params.bet.strategy.params[condition].oth = true
                        }
                    }
                    if (!match)
                        params.event.hasBreakdown = true
                }
            }
        }
        else if (params.event.score_home.length >= params.bet.strategy.params[condition].until) {
            if (Math.trunc(params.event.runner_win) < -1.0) {
                if (!params.event.lastIsRunner) {
                    if (params.event.score_homeS > params.event.score_awayS && params.bet.away == params.bet.runner)
                        match = true
                    else if (params.event.score_homeS < params.event.score_awayS && params.bet.home == params.bet.runner)
                        match = true
                }
            }
            else if (Math.trunc(params.event.oth_win) < -1.0) {
                if (params.event.lastIsRunner) {
                    if (params.event.score_homeS > params.event.score_awayS && params.bet.home == params.bet.runner)
                        match = true
                    else if (params.event.score_homeS < params.event.score_awayS && params.bet.away == params.bet.runner)
                        match = true
                }
            }

        }

        if (match) {
            if (params.event.score_homeS > params.event.score_awayS) {
                params.event.lastIsRunner_breakdown = params.bet.away == params.bet.runner ? true : false
                params.event.lastSet_breakdown = params.event.score_home.length + 1
            }
            else {
                params.event.lastIsRunner_breakdown = params.bet.home == params.bet.runner ? true : false
                params.event.lastSet_breakdown = params.event.score_home.length + 1
            }
        }

        return match
    }

    checkOn(params, condition) {
        let currentBets = params.bet.currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        let first_bet = currentBets[0]
        let selectionId = first_bet.selectionId
        let side = first_bet.side
        let first_bets = params.bet.currentBets.filter(item => item.selectionId == selectionId && item.side == side)
        if (first_bets.length == currentBets.length && currentBets.length == params.event.score_home.length)
            return true
    }

    checkOnDrawGame(params, condition) {
        let currentBets = params.bet.currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        let first_bet = currentBets[0]
        let selectionId = first_bet.selectionId
        let side = first_bet.side
        let first_bets = params.bet.currentBets.filter(item => item.selectionId == selectionId && item.side == side)
        if (first_bets.length == currentBets.length && currentBets.length > 1)
            return true
    }

    checkOnEnd(params, condition) {
        let currentBets = params.bet.currentBets.filter(item => Number(item.sizeMatched) > 0.0)
        let first_bet = currentBets[0]
        let last_bet = currentBets[currentBets.length - 1]
        let first_bets = params.bet.currentBets.filter(item => item.selectionId == first_bet.selectionId && item.side == first_bet.side)
        if (first_bet.selectionId != last_bet.selectionId || first_bet.side != last_bet.side)
            if (first_bets.length == currentBets.length - 1 && first_bets.length > 1)
                return true
        return false
    }

    loseSetsNotMatch(params, condition) {
        if (params.event.score_home.length <= params.bet.strategy.params[condition].until)
            if (!params.event.lastIsRunner) {
                if (!params.bet.dash) {
                    return true
                } else {
                    if (!params.bet.pre.hasDrawGames)
                        return true
                }
            }
        return false
    }

    eitherLoseNotMatch(params, condition) {
        if (params.event.score_home.length <= params.bet.strategy.params[condition].until) {
            if (params.event.hasOwnProperty('lastIsRunner')) {
                if (!params.event.lastIsRunner) {
                    if (this.loseSets(params, condition))
                        return true
                } else {
                    if (!this.loseSets(params, condition))
                        return true
                }
            } else {
                if (params.bet.dash) {
                    if (!params.bet.pre.hasDrawGames)
                        return true
                } else
                    return true
            }
        } else {
            if (Math.trunc(params.event.runner_win) < -1.0) {
                if (params.event.score_home[params.event.score_home.length - 1] > params.event.score_away[params.event.score_away.length - 1] && params.bet.away == params.bet.runner)
                    return true
                else if (params.event.score_home[params.event.score_home.length - 1] < params.event.score_away[params.event.score_away.length - 1] && params.bet.home == params.bet.runner)
                    return true
            }
            else if(Math.trunc(params.event.oth_win) < -1.0){
                if (params.event.score_home[params.event.score_home.length - 1] > params.event.score_away[params.event.score_home.length - 1] && params.bet.home == params.bet.runner)
                    return true
                else if (params.event.score_home[params.event.score_home.length - 1] < params.event.score_away[params.event.score_away.length - 1] && params.bet.away == params.bet.runner)
                    return true
            }
        }
        return false
    }

    drawSetsNotMatch(params, condition) {
        if (params.event.hasOwnProperty('lastIsRunner'))
            if (params.event.lastIsRunner)
                return true
        return false
    }

    eitherDrawNotMatch(params, condition) {
        if (params.event.hasOwnProperty('lastIsRunner'))
            if (params.bet.anchor) {
                if (!params.event.lastIsRunner) {
                    params.bet.strategy.params[condition]['scale'] = 1.0
                    return true
                }
                else {
                    if (Math.trunc(params.event.oth_win) < -1.0) {
                        params.bet.strategy.params[condition]['scale'] = 0.0
                        return true
                    }
                }
            }
            else {
                if (!params.event.lastIsRunner) {
                    if (params.event.score_home[params.event.score_home.length - 1] > params.event.score_away[params.event.score_away.length - 1] && params.bet.away == params.bet.runner)
                        return true
                    else if (params.event.score_home[params.event.score_home.length - 1] < params.event.score_away[params.event.score_away.length - 1] && params.bet.home == params.bet.runner)
                        return true
                }
                else {
                    if (params.event.score_home[params.event.score_home.length - 1] > params.event.score_away[params.event.score_home.length - 1] && params.bet.home == params.bet.runner)
                        return true
                    else if (params.event.score_home[params.event.score_home.length - 1] < params.event.score_away[params.event.score_away.length - 1] && params.bet.away == params.bet.runner)
                        return true
                }
            }
        return false
    }

    drawGamesNotMatch(params, condition) {
        if (params.event.hasOwnProperty('lastIsRunner') && params.bet.hasOwnProperty('pre')) {
            if (params.event.lastIsRunner == params.bet.pre.lastIsRunner_breakdown)
                if (params.event.score_home.length + 1 == params.bet.pre.lastSet_breakdown) {
                    if (!params.bet.strategy.params[condition].hasOwnProperty('scale'))
                        if (this.checkOnDrawGame(params, condition)) {
                            params.bet.strategy.params[condition].side = 'LAY'
                            params.bet.strategy.params[condition]['scale'] = 0.0
                        }
                    return true
                }
            if (params.bet.pre.hasBrokendown && params.event.score_home.length == 1) {
                if (params.bet.currentBets.filter(item => Number(item.sizeMatched) > 0.0).length == 1) {
                    params.bet.strategy.params[condition]['scale'] = 1.0
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

    loseSets(params, condition) {
        if (params.bet.sport === "Tennis") {
            let match = false
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length == set && params.event.score_away.length == set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (countElementsGE(away_squence, home_squence) > 0)
                            match = true;
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (countElementsGE(home_squence, away_squence) > 0)
                            match = true;
                    }
                }
            }
            if (match)
                if (Math.abs(params.event.score_home[params.event.score_home.length - 1] - params.event.score_away[params.event.score_away.length - 1]) == 1)
                    params.bet.pre.hasDrawGames = true
            return match
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

    drawSets(params, condition) {
        if (params.bet.sport === "Tennis") {
            let match = false
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length == set && params.event.score_away.length == set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (countElementsGE(home_squence, away_squence) == 0)
                            if (params.event.score_home[params.event.score_home.length - 1] > params.event.score_away[params.event.score_away.length - 1])
                                match = true;
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (countElementsGE(away_squence, home_squence) == 0)
                            if (params.event.score_away[params.event.score_away.length - 1] > params.event.score_home[params.event.score_home.length - 1])
                                match = true;
                    }
                }
            }
            if (match)
                params.bet.pre.hasDrawGames = false
            return match
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

    winSets(params, condition) {
        if (params.bet.sport === "Tennis") {
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length == set && params.event.score_away.length == set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (params.bet.runner.includes(params.bet.home)) {
                        if (countElementsGE(home_squence, away_squence) > 0)
                            return true;
                    }
                    else if (params.bet.runner.includes(params.bet.away)) {
                        if (countElementsGE(away_squence, home_squence) > 0)
                            return true;
                    }
                }
            }
            return false
        }
    }

    eitherLose(params, condition) {
        if (params.bet.sport === "Tennis") {
            let match = false
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 1 && params.event.score_home.length == set && params.event.score_away.length == set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    if (countElementsGE(home_squence, away_squence) > 0) {
                        if (params.bet.runner.includes(params.bet.home))
                            params.bet.strategy.params[condition]['oth'] = true
                        match = true
                    }
                    else if (countElementsGE(away_squence, home_squence) > 0) {
                        if (params.bet.runner.includes(params.bet.away))
                            params.bet.strategy.params[condition]['oth'] = true
                        match = true
                    }
                }
            }
            if (match)
                if (Math.abs(params.event.score_home[params.event.score_home.length - 1] - params.event.score_away[params.event.score_away.length - 1]) == 1)
                    params.bet.pre.hasDrawGames = true
            return match
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

    eitherDraw(params, condition) {
        if (params.bet.sport === "Tennis") {
            let match = false
            if (params.event.hasOwnProperty('score_home') && params.event.hasOwnProperty('score_away')) {
                let set = params.event.score_home.length
                if (params.bet.strategy.params[condition].hasOwnProperty('set'))
                    set = params.bet.strategy.params[condition].set
                if (set >= 2 && params.event.score_home.length == set && params.event.score_away.length == set) {
                    const home_squence = params.event.score_home.slice(0, set)
                    const away_squence = params.event.score_away.slice(0, set)
                    const home_squence_pre = params.event.score_home.slice(0, set - 1)
                    const away_squence_pre = params.event.score_away.slice(0, set - 1)
                    if (countElementsGE(away_squence, home_squence) == 0 && countElementsGE(away_squence_pre, home_squence_pre) < 0)
                        match = true
                    else if (countElementsGE(home_squence, away_squence) == 0 && countElementsGE(home_squence_pre, away_squence_pre) < 0)
                        match = true
                }
            }
            if (match)
                params.bet.pre.hasDrawGames = false
            return match
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

    winHang(params, condition) {
        if (this.winSets(params, condition) && this.notMatchTwo(params, condition))
            return true
        return false
    }

    loseHang(params, condition) {
        if (this.loseSets(params, condition) && this.notMatchTwo(params, condition))
            return true
        return false
    }

    eitherHang(params, condition) {
        if (this.eitherLose(params, condition) && this.notMatchTwo(params, condition))
            return true
        return false
    }

    deltaIn(params, condition) {
        if (params.bet.strategy.params[condition].hasOwnProperty('delta')) {
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
        }
        return true
    }

    async commission(params, condition) {
        if (!params.bet.strategy.params[condition].hasOwnProperty('guarantee'))
            params.bet.strategy.params[condition]['guarantee'] = 0.96

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
                        params.bet.pre.cancelled = true
                        await cancelBet(params.bet.page, placed.marketId, placed.offerId, Number(placed.price), Number(placed.size), placed.selectionId, placed.handicap)
                    }
                }
            }
        }

        if (CANCEL)
            return
        if (params.bet.anchor) {
            if (params.event.lastIsRunner)
                if (Math.trunc(params.event.oth_win) >= -0.5 * params.bet.vol && Math.trunc(params.event.runner_win) >= params.bet.vol)
                    return
        }

        if (!params.bet.strategy.params[condition].on) {
            if (params.event.lastIsRunner)
                params.bet.strategy.params[condition].oth = true

            if (Math.trunc(params.event.runner_win) > 0 || Math.trunc(params.event.oth_win) > 0) {
                params.bet.strategy.params[condition]['oth'] = false
                if (params.bet.strategy.params[condition].hasOwnProperty('side')) {
                    if (params.event.runner_side == params.bet.strategy.params[condition].side) {
                        params.bet.strategy.params[condition]['oth'] = true
                    }
                } else {
                    if (params.event.runner_side == 'BACK') {
                        params.bet.strategy.params[condition].side = 'LAY'
                        params.bet.strategy.params[condition]['scale'] = 0.0
                    }
                    else if (params.event.runner_side == 'LAY') {
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
                } else {
                    if (params.bet.strategy.params[condition]['oth'] && params.bet.strategy.params[condition].side == 'LAY')
                        params.bet.strategy.params[condition]['oth'] = false
                    else if (!params.bet.strategy.params[condition]['oth'] && params.bet.strategy.params[condition].side == 'LAY')
                        params.bet.strategy.params[condition]['oth'] = true
                }

                if (params.bet.strategy.params[condition].first_runner) {
                    if ((params.bet.strategy.params[condition]['oth'] && params.bet.strategy.params[condition].side == 'BACK')
                        || (!params.bet.strategy.params[condition]['oth'] && params.bet.strategy.params[condition].side == 'LAY'))
                        return
                }
                if (params.bet.strategy.params[condition].first_oth) {
                    if ((params.bet.strategy.params[condition]['oth'] && params.bet.strategy.params[condition].side == 'LAY')
                        || (!params.bet.strategy.params[condition]['oth'] && params.bet.strategy.params[condition].side == 'BACK'))
                        return
                }
            }
        }

        if (params.event.hasOwnProperty('runner_handicap'))
            if (params.bet.strategy.params[condition]['oth']) {
                if (params.event.runner_side == params.bet.strategy.params[condition].side) {
                    params.bet.strategy.params[condition].handicap = -params.event.runner_handicap
                }
                else if (params.event.runner_side != params.bet.strategy.params[condition].side) {
                    params.bet.strategy.params[condition].handicap = params.event.runner_handicap
                }
            } else {
                if (params.event.runner_side == params.bet.strategy.params[condition].side) {
                    params.bet.strategy.params[condition].handicap = params.event.runner_handicap
                }
                else if (params.event.runner_side != params.bet.strategy.params[condition].side) {
                    params.bet.strategy.params[condition].handicap = -params.event.runner_handicap
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

        let rec = 0.5

        let net_profit = 0.0
        let liability = 0.0

        if (params.bet.strategy.params[condition].oth) {
            if (params.bet.strategy.params[condition].side === 'LAY') {
                net_profit = params.event.oth_win
                liability = params.event.runner_win > 0.0 ? 0.0 : Math.abs(params.event.runner_win)
            } else {
                net_profit = params.event.runner_win
                liability = params.event.oth_win > 0.0 ? 0.0 : Math.abs(params.event.oth_win)
            }
        } else {
            if (params.bet.strategy.params[condition].side === 'LAY') {
                net_profit = params.event.runner_win
                liability = params.event.oth_win > 0.0 ? 0.0 : Math.abs(params.event.oth_win)
            } else {
                net_profit = params.event.oth_win
                liability = params.event.runner_win > 0.0 ? 0.0 : Math.abs(params.event.runner_win)
            }
        }

        if (params.bet.strategy.params[condition].hasOwnProperty('rec'))
            rec = params.bet.strategy.params[condition].rec

        let runner_thresh_back_odds = params.event.runner_thresh_odds ? 1.0 + (params.event.runner_thresh_odds - 1.0) * (1 - rec) : params.event.runner_thresh_odds
        let runner_thresh_lay_odds = params.event.runner_thresh_odds ? 1.0 + (params.event.runner_thresh_odds - 1.0) * (1 + rec) : params.event.runner_thresh_odds
        let oth_thresh_back_odds = params.event.oth_thresh_odds ? 1.0 + (params.event.oth_thresh_odds - 1.0) * (1.0 - rec) : params.event.oth_thresh_odds
        let oth_thresh_lay_odds = params.event.oth_thresh_odds ? 1.0 + (params.event.oth_thresh_odds - 1.0) * (1.0 + rec) : params.event.oth_thresh_odds

        //找到当前赔率
        let current_odds = 0
        if (params.bet.strategy.params[condition].oth) {
            if (params.bet.strategy.params[condition].side === 'BACK') {
                if (!params.event.oth_back_odds || (currentBets.length && (!oth_thresh_back_odds || params.event.oth_back_odds < oth_thresh_back_odds)))
                    return
                current_odds = params.event.oth_back_odds
            }
            else {
                if (!params.event.oth_lay_odds || (currentBets.length && (!oth_thresh_lay_odds || params.event.oth_lay_odds > oth_thresh_lay_odds)))
                    return
                current_odds = params.event.oth_lay_odds
            }
        } else {
            if (params.bet.strategy.params[condition].side === 'BACK') {
                if (!params.event.back_odds || (currentBets.length && (!runner_thresh_back_odds || params.event.back_odds < runner_thresh_back_odds)))
                    return
                current_odds = params.event.back_odds
            }
            else {
                if (!params.event.lay_odds || (currentBets.length && (!runner_thresh_lay_odds || params.event.lay_odds > runner_thresh_lay_odds)))
                    return
                current_odds = params.event.lay_odds
            }
        }

        let price = current_odds
        let size = 0;
        if ((params.event.runner_win == 0.0 && params.event.oth_win == 0.0) || params.bet.strategy.params[condition].on)
            size = params.bet.vol;
        else {
            if (!params.bet.strategy.params[condition].hasOwnProperty('scale'))
                params.bet.strategy.params[condition]['scale'] = 1.0

            if (params.bet.strategy.params[condition].side === 'LAY') {
                size = params.bet.strategy.params[condition]['scale'] * (net_profit / (current_odds - 1.0) - liability) + liability
                size = size * (current_odds - 1.0) > net_profit ? net_profit / (current_odds - 1.0) : size
            }
            else {
                size = params.bet.strategy.params[condition]['scale'] * (net_profit - liability / (current_odds - 1.0)) + liability / (current_odds - 1.0);
                size = size > net_profit ? net_profit : size
            }
        }
        if (params.bet.strategy.params[condition].hasOwnProperty('profit')) {
            if (params.bet.strategy.params[condition].side === 'BACK') {
                if (!params.bet.strategy.params[condition].oth)
                    params.bet.strategy.params[condition]['price'] = 1.0 + (params.bet.pre.origin_odds - 1.0) * (1.0 + params.bet.strategy.params[condition].profit)
                else
                    params.bet.strategy.params[condition]['price'] = 1.0 + (params.bet.pre.oth_origin_odds - 1.0) * (1.0 + params.bet.strategy.params[condition].profit)
            }
            else if (params.bet.strategy.params[condition].side === 'LAY') {
                if (!params.bet.strategy.params[condition].oth)
                    params.bet.strategy.params[condition]['price'] = 1.0 + (params.bet.pre.origin_odds - 1.0) * (1.0 - params.bet.strategy.params[condition].profit)
                else
                    params.bet.strategy.params[condition]['price'] = 1.0 + (params.bet.pre.oth_origin_odds - 1.0) * (1.0 - params.bet.strategy.params[condition].profit)
            }
        }
        if (params.bet.strategy.params[condition].hasOwnProperty('price')) {
            if ((currentBets.length <= 1 && this.breakdown(params, condition) && !params.event.score_away.length) || this.notInPlay(params, condition)) {
                if (params.bet.strategy.params[condition].side == 'BACK' && price < params.bet.strategy.params[condition]['price'])
                    return
                else if (params.bet.strategy.params[condition].side == 'LAY' && price > params.bet.strategy.params[condition]['price'])
                    return
                if (currentBets.length == 1 && this.breakdown(params, condition) && !params.event.score_away.length)
                    price = 1.01
            }
        }

        if (Math.trunc(size) > 2.0 && size.toFixed(2) < 6.0 && params.bet.strategy.params[condition].side == 'BACK')
            size = 6.0
        if (size.toFixed(2) >= 6.0 && price >= 1.0) {
            const result = assertBet(currentBets[currentBets.length - 1], selectionId, params, condition)
            if (!result) return;

            if (process.argv.includes('--test')) {
                params.output = { 'action': 'PLACE', 'price': price, 'size': size, 'selectionId': selectionId, 'handicap': handicap, 'side': params.bet.strategy.params[condition].side }
                return
            }

            if (params.bet.pre.cancelled && currentBets.length)
                price = 1.01
            if (!global.placing) {
                global.placing = true
                if (!(this.inSets(params, condition) && !((params.event.score_homeS + params.event.score_awayS) % 2)))
                    await params.bet.page.waitForTimeout(15000);
                params.bet.pre.cancelled = false
                params.event.placed = true
                await placeBet(params.bet.page, params.bet['data-market-id'], Number(price.toFixed(2)), Number(size.toFixed(2)), selectionId, handicap, params.bet.strategy.params[condition].side)
            }

        }

    }
}

module.exports = StrategyExecutor;

