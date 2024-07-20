const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const StrategyExecutor = require('../strategy.js');
const { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail, checkBets } = require('../utils.js');
const { login, getEventData, currentBets, placeBet, cancelBet } = require('../commands.js');

async function getJsonFiles(directory) {
    let jsonFiles = [];
    try {
        const files = await fs.readdir(directory, { withFileTypes: true });
        for (let file of files) {
            const fullPath = path.join(directory, file.name);
            if (file.isDirectory()) {
                // 递归处理子目录
                const nestedFiles = await getJsonFiles(fullPath);
                jsonFiles = jsonFiles.concat(nestedFiles);
            } else if (file.isFile() && path.extname(file.name) === '.json') {
                // 收集 JSON 文件名
                jsonFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${directory}:`, error);
    }
    return jsonFiles;
}

(async () => {

    try {
        await fs.unlink('output.json');
    } catch (err) {

    }

    const executor = new StrategyExecutor('../data/strategy.json');
    await executor.initialize();

    const files = await fs.readdir('./');
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    // const jsonFiles = await getJsonFiles('./')

    // 遍历文件，为每个文件创建一个测试用例
    jsonFiles.forEach(async file => {

        // 读取 JSON 文件中的参数和目标输出
        const data = JSON.parse(await fs.readFile(file, 'utf8'));
        const { params, target } = data;
        params.target = target
        params.output = {}
        if (!params.bet.hasOwnProperty('pre'))
            params.bet.pre = {}

        // 调用异步测试函数，传入 params
        console.log(file)
        if (checkBets(params))
            await executor.execute(params.bet.strategy.name, params);

        if ((params.event.hasOwnProperty('lastIsRunner_breakdown') && params.event.hasOwnProperty('lastSet_breakdown')) && (params.event.lastIsRunner_breakdown != params.bet.pre.lastIsRunner_breakdown || params.event.lastSet_breakdown != params.bet.pre.lastSet_breakdown)) {
            params.bet.pre.lastIsRunner_breakdown = params.event.lastIsRunner_breakdown
            params.bet.pre.lastSet_breakdown = params.event.lastSet_breakdown
            await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
        }
        if (params.event.hasOwnProperty('hasBreakdown') && params.event.hasBreakdown != params.bet.pre.hasBreakdown) {
            params.bet.pre.hasBreakdown = params.event.hasBreakdown
            await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
        }
        if (params.event.hasOwnProperty('hasBrokendown') && params.event.hasBrokendown != params.bet.pre.hasBrokendown) {
            params.bet.pre.hasBrokendown = params.event.hasBrokendown
            await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
        }
        if (params.event.hasOwnProperty('hasDrawGames') && params.event.hasDrawGames != params.bet.pre.hasDrawGames) {
            params.bet.pre.hasDrawGames = params.event.hasDrawGames
            await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
        }

        if (params.event.hasOwnProperty('Esrv')) {
            params.bet.pre.Esrv = params.event.Esrv
            params.bet.pre.score_homeS = params.event.score_homeS
            params.bet.pre.score_awayS = params.event.score_awayS
            params.bet.pre.origin_odds = params.bet.pre.origin_odds
            params.bet.pre.oth_origin_odds = params.bet.pre.oth_origin_odds
            await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
        }
        if (params.bet.pre.hasOwnProperty('cancelled')) {
            params.bet.pre.cancelled = params.bet.pre.cancelled
            await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
        }

        // 检查实际输出和目标输出是否相等
        try {
            expect(params.output).toEqual(target);
        } catch (error) {
            console.log(`Test failed for ${file}:`);
            console.log(params.event)
            console.log(target);
            console.log(params.output);
            // await fs.writeFile('./output.json', JSON.stringify(params, null, 2), 'utf8')
            process.exit(1); // 如果测试失败，退出程序
        }

    });

})();

