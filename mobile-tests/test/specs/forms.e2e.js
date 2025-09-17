// test/specs/forms.e2e.js
const Forms = require('../pageobjects/forms.po');

describe('Forms - cenários', () => {
  before(async () => {
    // Garante que qualquer alerta inicial seja fechado e a Home esteja pronta,
    // e então abre a aba/seção de Forms com seletores resilientes.
    await Forms.openForms();
  });

  it('preenche e valida um formulário de exemplo', async () => {
    // Exemplo mínimo (ajuste aos campos reais do seu app)
    // const nameField = $('android=new UiSelector().resourceIdMatches(".*:id/.*input.*name.*")');
    // await nameField.setValue('Leandro');
    // const submitBtn = $('android=new UiSelector().textMatches("(?i)enviar|submit|salvar")');
    // await submitBtn.click();
    // const success = $('android=new UiSelector().textMatches("(?i)sucesso|success")');
    // await success.waitForDisplayed({ timeout: 8000 });
  });
});
