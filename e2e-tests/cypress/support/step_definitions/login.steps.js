import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../e2e/pages/login.page.js';
import { InventoryPage } from '../../e2e/pages/inventory.page.js';

const loginPage = new LoginPage();
const inventory = new InventoryPage();

Given('que abro o aplicativo', () => {
  loginPage.visit();
});

When('eu faço login com credenciais válidas', () => {
  loginPage.login('standard');
});

Then('devo ver a lista de produtos', () => {
  inventory.isLoaded();
});
