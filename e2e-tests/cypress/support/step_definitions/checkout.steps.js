import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../e2e/pages/login.page.js';
import { InventoryPage } from '../../e2e/pages/inventory.page.js';
import { CartPage } from '../../e2e/pages/cart.page.js';
import { CheckoutPage } from '../../e2e/pages/checkout.page.js';

const loginPage = new LoginPage();
const inventory = new InventoryPage();
const cart = new CartPage();
const checkout = new CheckoutPage();

// Alternativa para cenários sem a tag @needsLogin
Given('que estou logado', () => {
  loginPage.login('standard');
});

When('eu adiciono o produto {string} ao carrinho', (produto) => {
  inventory.isLoaded();
  inventory.addToCartByName(produto);
});

When('eu vou para o carrinho e inicio o checkout', () => {
  inventory.goToCart();
  cart.isLoaded();
  cart.startCheckout();
  checkout.stepOneLoaded();
});

When('eu preencho meus dados e avanço para o resumo', () => {
  checkout.fillCustomer('Leandro', 'Brum', '90000-000');
  checkout.stepTwoLoaded();
});

When('eu finalizo a compra', () => {
  checkout.finish();
});

Then('devo ver a confirmação de pedido concluído', () => {
  checkout.assertComplete();
});
