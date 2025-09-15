import { Before } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '../../e2e/pages/login.page.js';

const login = new LoginPage();

// Executa login antes dos cenários marcados com @needsLogin.
Before({ tags: '@needsLogin' }, () => {
  login.login('standard');
});
