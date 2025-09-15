export class CartPage {
  elements = {
    checkoutBtn: () => cy.contains('button', 'Checkout'),
  };

  isLoaded() {
    cy.url().should('include', '/cart.html');
  }

  startCheckout() {
    this.elements.checkoutBtn().click();
  }
}
