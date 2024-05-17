const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const StrategyExecutor = require('../strategy.js');
const { getHandicap, hasNestedProperty, getOth, countElementsGE, formatDate, getEvent, assertBet, fetchData, parseBet, sendEmail, checkBets } = require('../utils.js');
const { login, getEventData, currentBets, placeBet, cancelBet } = require('../commands.js');

(async () => {

    try {
        await fs.unlink('output.json');
    } catch (err) {
        
    }

    const executor = new StrategyExecutor('../data/strategy.json');
    await executor.initialize();

    const files = await fs.readdir('./');
    const jsonFiles = files.filter(file => path.extname(file) === '.json');

    // 遍历文件，为每个文件创建一个测试用例
jsonFiles.forEach(async file => {

        // 读取 JSON 文件中的参数和目标输出
        const data = JSON.parse(await fs.readFile(file, 'utf8'));
        const { params, target } = data;
        params.target = target
        params.output = {}

        // 调用异步测试函数，传入 params
        if (checkBets(params))
              await executor.execute(params.bet.strategy.name, params);

        if (params.event.hasOwnProperty('lastIsRunner_breakdown') && params.event.hasOwnProperty('lastSet_breakdown')) {
            if (!params.bet.hasOwnProperty('pre'))
                params.bet.pre = {}
            if (params.event.lastIsRunner_breakdown != params.bet.pre.lastIsRunner_breakdown || params.event.lastSet_breakdown != params.bet.pre.lastSet_breakdown) {
                params.bet.pre.lastIsRunner_breakdown = params.event.lastIsRunner_breakdown
                params.bet.pre.lastSet_breakdown = params.event.lastSet_breakdown
                await fs.writeFile('../cypress/e2e/orbit/data/bets.json', JSON.stringify(params.bet, null, 2), 'utf8')
            }
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

