import userdb from '/Volumes/1TB/Users/peterbernstein/Django/SpineSplinr/splineapp/tests/users.json'
var sample = require('lodash.sample');

describe('LoginDialog.vue', () => {
   let user;

    before(() => {
        const api_login_url = Cypress.env('VUE_APP_BACKEND_URL') + '/o/emailtoken/'
        const api_userinfo_url = Cypress.env('VUE_APP_BACKEND_URL') + '/userinfo/'

        user = sample(userdb)

    })

    beforeEach(()=> {
        cy.intercept(api_login_url).as('TokenRequest')
        cy.intercept(api_userinfo_url).as('UserRequest')
    })

    it('logs in a random user', function () {
        cy.visit('/login')
        cy.get('[data-cy=email_field]').type(user.email)
        cy.get('[data-cy=password_field]').type(user.password)
        cy.get('[data-cy=login_button]').click()

        cy.wait('@TokenRequest').its('response.statusCode').should('eq',200)
    })

    it('signs the P0 consent', function () {
        cy.wait('@UserRequest').its('response.body').should('include','missing')

    })
})
