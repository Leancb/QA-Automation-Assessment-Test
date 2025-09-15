export class CheckoutPage {
  elements = {
    firstName: () => cy.get('[data-test="firstName"]'),
    lastName: () => cy.get('[data-test="lastName"]'),
    postalCode: () => cy.get('[data-test="postalCode"]'),
    continueBtn: () => cy.get('[data-test="continue"]'),
    finishBtn: () => cy.get('[data-test="finish"]'),
    completeHeader: () => cy.get('.complete-header'),
  };

  stepOneLoaded() {
    cy.url().should('include', '/checkout-step-one.html');
  }

  fillCustomer(first = 'Leandro', last = 'Brum', zip = '90000-000') {
    this.elements.firstName().type(first);
    this.elements.lastName().type(last);
    this.elements.postalCode().type(zip);
    this.elements.continueBtn().click();
  }

  stepTwoLoaded() {
    cy.url().should('include', '/checkout-step-two.html');
  }

  finish() {
    this.elements.finishBtn().click();
  }

  assertComplete() {
    cy.url().should('include', '/checkout-complete.html');
    this.elements.completeHeader().should('contain.text', 'Thank you for your order!');
  }
}
