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

import StrategyExecutor from '../e2e/orbit/strategy.js';
import {getHandicap, hasNestedProperty} from '../e2e/orbit/utils.js';

Cypress.Commands.add('login', (username, password) => {    
    cy.session([username,password],()=>{
        cy.visit('http://www.orbitxch.com',{timeout:20000}).then(response => {

            cy.task('readJsonFile','cypress/e2e/orbit/data/profile.json').then(json => {
                cy.get('input[name=username]').type(json['username'])
                cy.get('input[name=password]').type(json['password'])
                cy.get('form').submit()
                cy.get('.biab_btn-continue').click();
            })
        })   
    })    
});

Cypress.Commands.add('getEventData', (bet) => {    
    //获取market_url、event_url
    const event_inplay_url = 'https://ips.betfair.com/inplayservice/v1/scores?_ak=nzIFcwyWhrlwYMrh&alt=json&eventIds=32786453&locale=en_GB&productType=EXCHANGE&regionCode=ASIA'.replace(/(eventIds=)[^\&]+/, `$1${bet['data-event-id']}`);
    const event_market_url = 'https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=GBP&locale=en_GB&marketIds=1.220997250&rollupLimit=10&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST'.replace(/(marketIds=)[^\&]+/, `$1${bet['data-market-id']}`);
    let params = { bet: bet, event: {} };

    return cy.request(event_market_url).then(response => {
        // expect(response.status).to.eq(200);
        response.body.eventTypes.forEach(event => {
            event.eventNodes.forEach(eventNode => {
                if (eventNode.eventId === Number(params.bet['data-event-id'])) {
                    eventNode.marketNodes.forEach(market => {
                        if (market.isMarketDataVirtual)
                        if (Number(market.marketId) === Number(params.bet['data-market-id'])) {
                            params.event.inPlay = market.state.inplay
                            market.runners.forEach(runner => {
                                if (runner.state.status === 'ACTIVE'){
                                if (Number(runner.selectionId) === Number(bet.selectionId) && Number(runner.handicap) === Number(getHandicap(params.bet.runner,params.bet.home,params.bet.away))){
                                    if (hasNestedProperty(runner,'exchange','availableToBack',0,'price'))
                                        params.event.back_odds = runner.exchange.availableToBack[0].price
                                    if (hasNestedProperty(runner,'exchange','availableToLay',0,'price'))
                                        params.event.lay_odds = runner.exchange.availableToLay[0].price
                                    }
                                else if (Number(runner.selectionId) === Number(bet.oth_selectionId) && (runner.handicap) === Number(getHandicap(params.bet.oth_runner,params.bet.home,params.bet.away))){
                                    if (hasNestedProperty(runner,'exchange','availableToBack',0,'price'))
                                        params.event.oth_back_odds = runner.exchange.availableToBack[0].price
                                    if (hasNestedProperty(runner,'exchange','availableToLay',0,'price'))
                                        params.event.oth_lay_odds = runner.exchange.availableToLay[0].price
                                    }
                                }
                        })
                    }
                    })
                }
            })  
        })
    
        if (Object.keys(params.event).some(key => key.includes('odds'))){
        return cy.request(event_inplay_url).then(response => {
        // 确保响应状态码为200
        // expect(response.status).to.eq(200);
        // cy.log('111')
        response.body.forEach(event => {
            // cy.log('222')
            // cy.log(event.eventId, Number(params.bet['data-event-id']))
          if (event.eventId === Number(params.bet['data-event-id'])){
            // cy.log('333')
              if (bet.sport === "Soccer") {
                  params.event.score_home = response.body.score.home.score;
                  params.event.score_away = response.body.score.away.score;
                  params.event.timeElapsed = response.body.timeElapsed;
              }
              else if (bet.sport === "Tennis"){
                // cy.log('444')
                  params.event.score_home = event.score.home.gameSequence;
                  params.event.score_away = event.score.away.gameSequence;
              }
          }
        })
        return params
      })
    }else {
        return params
    }
    })
});

Cypress.Commands.add('executeStrategy', (executor,strategyName, params) => {
    // const executor = new StrategyExecutor();
    return executor.execute(strategyName, params);
  });

Cypress.Commands.add('placeBet', (marketId,price,size,selectionId,handicap,side) => {    
            // 定义请求的 URL 和 payload
let payload = {
    "headers": {
        "host": "www.orbitxch.com",
        "connection": "keep-alive",
        "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "x-csrf-token": "1ed7f80a-d692-4cd2-928c-f3e2ff0112bd",
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
        "cookie": "CSRF-TOKEN=1ed7f80a-d692-4cd2-928c-f3e2ff0112bd; BIAB_CUSTOMER=aGVoYWk2MnxleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKbGVIQWlPakUyT1RrNU9EYzNPVGdzSW1saGRDSTZNVFk1T1RrMU1UYzVPQ3dpWVdOamIzVnVkRWxrSWpvaWFHVm9ZV2syTWlJc0luTjBZWFIxY3lJNkltRmpkR2wyWlNJc0luQnZiR2xqYVdWeklqcGJJakU1SWl3aU5UUWlMQ0k0TlNJc0lqRXdOU0lzSWpJd0lpd2lNVEEzSWl3aU1UQTRJaXdpTVRFd0lpd2lNVEV6SWl3aU1USTVJaXdpTVRNd0lpd2lNVE14SWl3aU1UTXpJbDBzSW1GalkxUjVjR1VpT2lKQ1NVRkNJaXdpYkc5bloyVmtTVzVCWTJOdmRXNTBTV1FpT2lKb1pXaGhhVFl5SWl3aWMzVmlYMk52WDJSdmJXRnBibk1pT201MWJHd3NJbXhsZG1Wc0lqb2lRa2xCUWlJc0ltTjFjbkpsYm1ONUlqb2lSVlZTSW4wLnhLblhzT0VZWnNKVTdIRzJwWGFSb2tBRGlUaG1QaGUzN2RXLUF1Q0c4Zzh8fHhYN2IzY2g3eHZiem85M0xjMnhxdFNEVEJXcz0=; BIAB_AN=90caa73b-00f9-4bb0-92c6-f8c4533a68c6; _gid=GA1.2.953711950.1699951790; BIAB_LANGUAGE=en; BIAB_TZ=-480; COLLAPSE-LEFT_PANEL_COLLAPSE_GROUP-SPORT_COLLAPSE=true; BIAB_LOGIN_POP_UP_SHOWN=true; _gat_gtag_UA_252822765_1=1; BIAB_SHOW_TOOLTIPS=false; _ga=GA1.1.1979628482.1699951790; _ga_R0X6ZP423B=GS1.1.1699954670.2.1.1699954687.0.0.0; AWSALB=uKUKreCIS+0SpUbEjO3VWGCJTcjcsAByqXyh+we0zg57SV/i6EfkQfKjoYkErq38ARz9ATrfHUiN/FNQOBLMMF61wZVramCtytqMeLj7qhgJI5WeqKyx1D05KsOG; AWSALBCORS=uKUKreCIS+0SpUbEjO3VWGCJTcjcsAByqXyh+we0zg57SV/i6EfkQfKjoYkErq38ARz9ATrfHUiN/FNQOBLMMF61wZVramCtytqMeLj7qhgJI5WeqKyx1D05KsOG"
    },
    "url": "https://www.orbitxch.com/customer/api/placeBets",
    "method": "POST",
    "httpVersion": "1.1",
    "resourceType": "xhr",
    "query": {},
    "body": {
        "1.220773875": [
            {
                "selectionId": 56323,
                "handicap": 0,
                "price": "100",
                "size": "6",
                "side": "BACK",
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

payload.body[marketId] = payload.body["1.220773875"]
delete payload.body["1.220773875"]
payload.body[marketId][0].price = price
payload.body[marketId][0].size = size
payload.body[marketId][0].selectionId = Number(selectionId)
payload.body[marketId][0].handicap = Number(handicap)
payload.body[marketId][0].side = side

const cookieNames = payload.headers.cookie.split('; ').map(cookie => cookie.split('=')[0]);

const updatedCookies = [];

cookieNames.forEach(cookieName => {
    cy.getCookie(cookieName).then(cookie => {
        if (cookie) {
            updatedCookies.push(`${cookie.name}=${cookie.value}`);
            if (cookie.name === 'CSRF-TOKEN') {
                payload.headers["x-csrf-token"] = cookie.value;
            }
        }
    });
});

// cy.intercept({
//     hostname : 'www.orbitxch.com',
//     pathname : "/customer/api/placeBets"
//   }).as('place')

cy.wrap(null).then(() => {
    const newCookieString = updatedCookies.join('; ');
    payload.headers.cookie = newCookieString;
    // payload.headers["content-length"] = JSON.stringify(payload.body).length + ""

    cy.log(payload)
    cy.log(payload.headers["content-length"])
//     let bodyString = JSON.stringify(payload1.body);
// let bodyLength = bodyString.slice(1,-1).length;
// cy.log('Request body length:', bodyLength);
}).then(()=>{cy.request(payload).then((response) => {
    // 处理响应
    cy.wait(10000)
    // 你可以添加断言来验证响应
});
})




                // cy.wait('@place',{timeout:10000}).then(response => {
                //     cy.wait(10000).then(() => {
                //         return
                //     })
                // })
});

Cypress.Commands.add('cancelBet', (marketId,offerId) => {    
    // 定义请求的 URL 和 payload
    let payload = {
        "headers": {
            "host": "www.orbitxch.com",
            "connection": "keep-alive",
            "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
            "x-csrf-token": "09b23b6d-0005-489c-8963-e0abc3ed82f6",
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
            "cookie": "BIAB_CUSTOMER=aGVoYWk2MnxleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKbGVIQWlPakUzTURBd05EY3lNekVzSW1saGRDSTZNVGN3TURBeE1USXpNU3dpWVdOamIzVnVkRWxrSWpvaWFHVm9ZV2syTWlJc0luTjBZWFIxY3lJNkltRmpkR2wyWlNJc0luQnZiR2xqYVdWeklqcGJJakU1SWl3aU5UUWlMQ0k0TlNJc0lqRXdOU0lzSWpJd0lpd2lNVEEzSWl3aU1UQTRJaXdpTVRFd0lpd2lNVEV6SWl3aU1USTVJaXdpTVRNd0lpd2lNVE14SWl3aU1UTXpJbDBzSW1GalkxUjVjR1VpT2lKQ1NVRkNJaXdpYkc5bloyVmtTVzVCWTJOdmRXNTBTV1FpT2lKb1pXaGhhVFl5SWl3aWMzVmlYMk52WDJSdmJXRnBibk1pT201MWJHd3NJbXhsZG1Wc0lqb2lRa2xCUWlJc0ltTjFjbkpsYm1ONUlqb2lSVlZTSW4wLm9TMXM4Xy0xaUd4VFNJekdrTTZHS3lIbVQwM0VIR2MyX2hsRzFoTmRKNzh8fDdrMVg1U1JmQTVUMjJqQmFSdmw3UUVPWUJRST0=; BIAB_AN=caaecd33-9873-4205-a37d-c00fdef1ea80; _gid=GA1.2.2024580322.1700011224; BIAB_LANGUAGE=en; BIAB_TZ=-480; COLLAPSE-LEFT_PANEL_COLLAPSE_GROUP-SPORT_COLLAPSE=true; BIAB_LOGIN_POP_UP_SHOWN=true; CSRF-TOKEN=09b23b6d-0005-489c-8963-e0abc3ed82f6; _gat_gtag_UA_252822765_1=1; _ga=GA1.1.538752001.1700011224; BIAB_SHOW_TOOLTIPS=false; _ga_R0X6ZP423B=GS1.1.1700019309.4.1.1700019313.0.0.0; AWSALB=FoLqO3syAoT1g9j5elNOQEKlA5OjzVo/3WVCmwTT952hDeiM4iVzBRyYKdEinWNbKC95RzuJq+AIx6RrZe12W8IF621mHIROS8zUJZFKoYnJYwNvuoR+ZaXTIn1n; AWSALBCORS=FoLqO3syAoT1g9j5elNOQEKlA5OjzVo/3WVCmwTT952hDeiM4iVzBRyYKdEinWNbKC95RzuJq+AIx6RrZe12W8IF621mHIROS8zUJZFKoYnJYwNvuoR+ZaXTIn1n"
        },
        "url": "https://www.orbitxch.com/customer/api/cancelBets",
        "method": "POST",
        "httpVersion": "1.1",
        "resourceType": "xhr",
        "query": {},
        "body": {
            "1.220773875": [
                {
                    "price": 50,
                    "size": 0,
                    "selectionId": 47999,
                    "handicap": "0.00",
                    "offerId": 128169053,
                    "betType": "EXCHANGE"
                }
            ]
        },
        "responseTimeout": 30000
    }

payload.body[marketId] = payload.body["1.220773875"]
delete payload.body["1.220773875"]
payload.body[marketId][0].offerId = offerId
// payload.body[marketId][0].size = size
// payload.body[marketId][0].selectionId = Number(selectionId)
// payload.body[marketId][0].handicap = Number(handicap)
// payload.body[marketId][0].side = side

const cookieNames = payload.headers.cookie.split('; ').map(cookie => cookie.split('=')[0]);

const updatedCookies = [];

cookieNames.forEach(cookieName => {
cy.getCookie(cookieName).then(cookie => {
if (cookie) {
    updatedCookies.push(`${cookie.name}=${cookie.value}`);
    if (cookie.name === 'CSRF-TOKEN') {
        payload.headers["x-csrf-token"] = cookie.value;
    }
}
});
});

// cy.intercept({
//     hostname : 'www.orbitxch.com',
//     pathname : "/customer/api/placeBets"
//   }).as('place')

cy.wrap(null).then(() => {
const newCookieString = updatedCookies.join('; ');
payload.headers.cookie = newCookieString;
// payload.headers["content-length"] = JSON.stringify(payload.body).length + ""

cy.log(payload)
// cy.log(payload.headers["content-length"])
//     let bodyString = JSON.stringify(payload1.body);
// let bodyLength = bodyString.slice(1,-1).length;
// cy.log('Request body length:', bodyLength);
}).then(()=>{cy.request(payload).then((response) => {
// 处理响应
cy.wait(10000)
// 你可以添加断言来验证响应
});
})




        // cy.wait('@place',{timeout:10000}).then(response => {
        //     cy.wait(10000).then(() => {
        //         return
        //     })
        // })
});