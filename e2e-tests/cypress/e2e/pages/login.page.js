export class LoginPage {
  elements = {
    username: () => cy.get('#user-name'),
    password: () => cy.get('#password'),
    loginBtn: () => cy.get('#login-button'),
  };

  visit() {
    cy.visit('/');
  }

  fillUsername(user) {
    this.elements.username().clear().type(user);
  }

  fillPassword(pass) {
    this.elements.password().clear().type(pass, { log: false });
  }

  submit() {
    this.elements.loginBtn().click();
  }

  // Login usando users.json (fixtures)
  login(userKey = 'standard') {
    cy.fixture('users').then(({ [userKey]: u }) => {
      if (!u) throw new Error(`Usuário de fixture não encontrado: ${userKey}`);
      this.visit();
      this.fillUsername(u.username);
      this.fillPassword(u.password);
      this.submit();
      cy.url().should('include', '/inventory.html');
    });
  }
}
