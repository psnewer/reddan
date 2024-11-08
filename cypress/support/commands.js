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
        cy.visit('https://www.orbitexch.com',{timeout:20000}).then(response => {

            cy.task('readJsonFile','cypress/e2e/orbit/data/profile.json').then(json => {
                cy.get('input[name=username]',{ timeout: 20000 }).type(json['username'])
                cy.get('input[name=password]',{ timeout: 20000 }).type(json['password'])
                cy.get('button[type=submit]',{ timeout: 20000 }).click({ force: true });
                cy.wait(20000);
                cy.get('.biab_btn-continue',{ timeout: 20000 }).click({ force: true });
            })
        })   
    })    
});
