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
