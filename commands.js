// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const { hasNestedProperty, getEvent, fetchData } = require('./utils.js');
const axios = require('axios');

// commands.js
const fs = require('fs').promises;

async function login(page) {
    filePath = './data/profile.json'
    const json = JSON.parse(await fs.readFile(filePath, 'utf8'));

    await page.goto('http://www.orbitxch.com', { timeout: 20000 });
    await page.type('input[name=username]', json['username']);
    await page.type('input[name=password]', json['password']);
    await page.click('button[type="submit"]'); // 注意：根据实际情况替换为正确的表单提交方法
    await page.click('.biab_btn-continue'); // 根据实际情况调整选择器
    return true
}

async function getEventData(bet) {
    //获取market_url、event_url

    const event_market_url = 'https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=GBP&locale=en_GB&marketIds=1.220997250&rollupLimit=10&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST'.replace(/(marketIds=)[^\&]+/, `$1${bet['data-market-id']}`);
    let params = { bet: bet, event: {} };
    const response = await fetchData(event_market_url, { timeout: 20000 });


        response.eventTypes.forEach(event => {
            event.eventNodes.forEach(eventNode => {
                if (eventNode.eventId === Number(params.bet['data-event-id'])) {
                    eventNode.marketNodes.forEach(market => {
                        if (market.isMarketDataVirtual)
                            if (Number(market.marketId) === Number(params.bet['data-market-id'])) {
                                params.event.inplay = market.state.inplay
                                market.runners.forEach(runner => {
                                    if (runner.state.status === 'ACTIVE') {
                                        if (Number(runner.selectionId) == Number(bet.selectionId)) {
                                            if (Number(runner.handicap) == Number(params.bet.handicap)) {
                                                if (hasNestedProperty(runner, 'exchange', 'availableToBack', 0, 'price'))
                                                    params.event.back_odds = runner.exchange.availableToBack[0].price
                                                if (hasNestedProperty(runner, 'exchange', 'availableToLay', 0, 'price'))
                                                    params.event.lay_odds = runner.exchange.availableToLay[0].price
                                            }
                                            else if (Number(runner.handicap) == Number(params.bet.oth_handicap) && params.bet.strategy.name == "soccer_2") {
                                                if (hasNestedProperty(runner, 'exchange', 'availableToBack', 0, 'price'))
                                                    params.event.back_odds_either = runner.exchange.availableToBack[0].price
                                                if (hasNestedProperty(runner, 'exchange', 'availableToLay', 0, 'price'))
                                                    params.event.lay_odds_either = runner.exchange.availableToLay[0].price
                                            }
                                        }
                                        else if (Number(runner.selectionId) == Number(bet.oth_selectionId)) {
                                            if (Number(runner.handicap) == Number(params.bet.oth_handicap)) {
                                                if (hasNestedProperty(runner, 'exchange', 'availableToBack', 0, 'price'))
                                                    params.event.oth_back_odds = runner.exchange.availableToBack[0].price
                                                if (hasNestedProperty(runner, 'exchange', 'availableToLay', 0, 'price'))
                                                    params.event.oth_lay_odds = runner.exchange.availableToLay[0].price
                                            }
                                            else if (Number(runner.handicap) == Number(params.bet.handicap) && params.bet.strategy.name == "soccer_2") {
                                                if (hasNestedProperty(runner, 'exchange', 'availableToBack', 0, 'price'))
                                                    params.event.oth_back_odds_either = runner.exchange.availableToBack[0].price
                                                if (hasNestedProperty(runner, 'exchange', 'availableToLay', 0, 'price'))
                                                    params.event.oth_lay_odds_either = runner.exchange.availableToLay[0].price
                                            }
                                        }
                                    }
                                })
                            }
                    })
                }
            })
        })

        if (Object.keys(params.event).some(key => key.includes('odds'))) {
            if (bet.sport === "Soccer") {
                let event = getEvent(bet.score_soccer, bet)
                if (event != null) {
                    if (event.hasOwnProperty('Tr1') && event.hasOwnProperty('Tr2')) {
                        params.event.score_home = Number(event.Tr1);
                        params.event.score_away = Number(event.Tr2);
                        if (event.hasOwnProperty('Eps')) {
                            params.event.timeElapsed = event.Eps
                            if (/^\d+.*'$/.test(event.Eps))
                                params.event.timeElapsed = Number(event.Eps.match(/^\d+/)[0]);
                        }
                    }
                }
            }
            else if (bet.sport === "Tennis") {
                let event = getEvent(bet.score_tennis, bet)
                if (event != null) {
                    if (event.hasOwnProperty('Tr1') && event.hasOwnProperty('Tr2')) {
                        params.event.score_home = []
                        params.event.score_away = []
                        if (event.hasOwnProperty('Eps')) {
                            params.event.timeElapsed = event.Eps
                            if (/^S\d+$/.test(event.Eps))
                                params.event.timeElapsed = Number(event.Eps.match(/^S(\d+)$/)[1])
                            if (Number(event.Eps.match(/^S(\d+)$/)[1]) > Number(event.Tr1) + Number(event.Tr2)) {
                                for (let i = 1; i <= Number(event.Tr1) + Number(event.Tr2); i++) {
                                    params.event.score_home.push(event['Tr1S' + i])
                                    params.event.score_away.push(event['Tr2S' + i])
                                }
                            }
                        }
                    }
                }
            }
            else if (bet.sport === "Basketball") {
                let event = getEvent(bet.score_basketball, bet)
                if (event != null) {
                    if (event.hasOwnProperty('Tr1') && event.hasOwnProperty('Tr2')) {
                        params.event.score_home = Number(event.Tr1);
                        params.event.score_away = Number(event.Tr2);
                        if (event.hasOwnProperty('Eps')) {
                            params.event.timeElapsed = event.Eps
                            if (/^\dQ$/.test(event.Eps))
                                params.event.timeElapsed = Number(event.Eps.match(/^\d/)[0]);
                        }
                    }
                }
            }
        }
    
    return params
};

// 假设 page 是你已经定义并导航到某个页面的 Playwright Page 对象
async function getSpecificCookie(page, cookieName) {
    const cookies = await page.context().cookies();
    const targetCookie = cookies.find(cookie => cookie.name === cookieName);
    return targetCookie ? targetCookie.value : null;
}

async function currentBets(page) {

    const csrfToken = await getSpecificCookie(page, 'CSRF-TOKEN');
    const cookieString = await page.context().cookies().then(cookies =>
        cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    );

    let payload = {
        "headers": {
            "host": "www.orbitxch.com",
            "connection": "keep-alive",
            "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
            "x-csrf-token": csrfToken,
            "sec-ch-ua-mobile": "?0",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "accept": "application/json, text/plain, */*",
            "access-control-allow-credentials": "true",
            "x-device": "DESKTOP",
            "sec-ch-ua-platform": "\"macOS\"",
            "origin": "https://www.orbitxch.com",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9",
            "cookie": cookieString
        },
        "url": "https://www.orbitxch.com/customer/api/currentBets",
        "method": "GET",
        "httpVersion": "1.1",
        "resourceType": "xhr",
        "query": {},
        "responseTimeout": 30000
    }

    try {
        const response = await axios(payload);
        return response.data;
    } catch (error) {
        console.error('Error fetching current bets:', error);
        throw error;
    }
};

async function placeBet(page, marketId, price, size, selectionId, handicap, side) {

    const csrfToken = await getSpecificCookie(page, 'CSRF-TOKEN');
    const cookieString = await page.context().cookies().then(cookies =>
        cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    );
    let payload = {
        "headers": {
            "host": "www.orbitxch.com",
            "connection": "keep-alive",
            "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
            "x-csrf-token": csrfToken,
            "sec-ch-ua-mobile": "?0",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "accept": "application/json, text/plain, */*",
            "access-control-allow-credentials": "true",
            "x-device": "DESKTOP",
            "sec-ch-ua-platform": "\"macOS\"",
            "origin": "https://www.orbitxch.com",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9",
            "cookie": cookieString
        },
        "url": "https://www.orbitxch.com/customer/api/placeBets",
        "method": "POST",
        "httpVersion": "1.1",
        "resourceType": "xhr",
        "query": {},
        "body": {
            [marketId]: [
                {
                    "selectionId": Number(selectionId),
                    "handicap": Number(handicap),
                    "price": price,
                    "size": size,
                    "side": side,
                    "betType": "EXCHANGE",
                    "netPLBetslipEnabled": false,
                    "netPLMarketPageEnabled": false,
                    "quickStakesEnabled": true,
                    "confirmBetsEnabled": false,
                    "applicationType": "WEB",
                    "mobile": false,
                    "isEachWay": false,
                    "eachWayData": {},
                    "page": "multi-market",
                    "persistenceType": "LAPSE",
                    "placedUsingEnterKey": false
                }
            ]
        },
        "responseTimeout": 30000
    }

    try {
        const response = await axios(payload);
        if (response.status == 200) {
            await page.waitForTimeout(60000);
        }
    } catch (error) {
        console.error('Error placing bet:', error);
        throw error;
    }

};

async function cancelBet(page, marketId, offerId) {

    const csrfToken = await getSpecificCookie(page, 'CSRF-TOKEN');
    const cookieString = await page.context().cookies().then(cookies =>
        cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    );

    let payload = {
        "headers": {
            "host": "www.orbitxch.com",
            "connection": "keep-alive",
            "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
            "x-csrf-token": csrfToken,
            "sec-ch-ua-mobile": "?0",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "accept": "application/json, text/plain, */*",
            "access-control-allow-credentials": "true",
            "x-device": "DESKTOP",
            "sec-ch-ua-platform": "\"macOS\"",
            "origin": "https://www.orbitxch.com",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9",
            "cookie": cookieString
        },
        "url": "https://www.orbitxch.com/customer/api/cancelBets",
        "method": "POST",
        "httpVersion": "1.1",
        "resourceType": "xhr",
        "query": {},
        "body": {
            [marketId]: [
                {
                    "price": 50,
                    "size": 0,
                    "selectionId": 47999,
                    "handicap": "0.00",
                    "offerId": offerId,
                    "betType": "EXCHANGE"
                }
            ]
        },
        "responseTimeout": 30000
    }

    try {
        const response = await axios(payload);
        if (response.status == 200) {
            await page.waitForTimeout(60000);
        }
    } catch (error) {
        console.error('Error placing bet:', error);
        throw error;
    }
};

module.exports = { login, getEventData, currentBets, placeBet, cancelBet };