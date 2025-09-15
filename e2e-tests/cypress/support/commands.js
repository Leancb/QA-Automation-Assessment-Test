// Login baseado em fixtures (users.json)
Cypress.Commands.add('loginAs', (userKey = 'standard') => {
  cy.fixture('users').then(({ [userKey]: u }) => {
    if (!u) throw new Error(`Usuário de fixture não encontrado: ${userKey}`);
    cy.visit('/');
    cy.get('#user-name').clear().type(u.username);
    cy.get('#password').clear().type(u.password, { log: false });
    cy.get('#login-button').click();
    cy.url().should('include', '/inventory.html');
  });
});
