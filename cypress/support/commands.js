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