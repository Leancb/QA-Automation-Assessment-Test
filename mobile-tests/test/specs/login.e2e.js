// test/specs/login.e2e.js
const LoginPage = require('../pageobjects/login.po');

describe('Login - fluxo básico', () => {
  before(async () => {
    await LoginPage.openTab();
  });

  it('deve logar com sucesso e fechar o alerta', async () => {
    // use as credenciais que você já utiliza no app de demo
    await LoginPage.doLogin('bob@example.com', '10203040');
  });

  // por último, voltar para a Home
  after(async () => {
    await LoginPage.goHome();
  });
});
