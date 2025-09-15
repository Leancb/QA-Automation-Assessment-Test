export class InventoryPage {
  elements = {
    list: () => cy.get('.inventory_list'),
    // Produto por nome (card)
    productCardByName: (name) => cy.contains('.inventory_item', name),
    cartLink: () => cy.get('.shopping_cart_link'),
  };

  isLoaded() {
    cy.url().should('include', '/inventory.html');
    this.elements.list().should('be.visible');
  }

  // Adiciona qualquer produto pelo nome
  addToCartByName(name) {
    this.elements.productCardByName(name)
      .find('button[data-test^="add-to-cart"]')
      .click();
    // Valida que virou "Remove"
    this.elements.productCardByName(name)
      .find('button[data-test^="remove"]')
      .should('be.visible');
  }

  goToCart() {
    this.elements.cartLink().click();
  }
}
