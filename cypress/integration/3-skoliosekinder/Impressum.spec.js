describe('Impressum.vue', () => {
    before(() => {
        const api_url = Cypress.env('VUE_APP_BACKEND_URL') + 'version/'
        cy.intercept({
            method: 'GET',
            url: api_url
        }).as('api_version')
        cy.visit('/impressum')
    })
    it('shows logo and versions', () => {
        let res;
        cy.wait('@api_version').then((interception) => {
            res = interception.response.body
            expect(res).to.have.nested.property('version')
            cy.get('[data-cy=skolioselogo]').should('be.visible')
            cy.get('[data-cy=frontend_version]').invoke('text').should('include', 'Build')
            cy.get('[data-cy=backend_version]').invoke('text').should('include', 'Backend Version: ' + res.version)
        })

    })
})