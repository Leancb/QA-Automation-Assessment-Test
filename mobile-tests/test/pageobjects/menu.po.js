// Navegação pela bottom bar do Native Demo App
class Menu {
  get homeTab()   { return $('~Home'); }
  get webviewTab(){ return $('~Webview'); }
  get loginTab()  { return $('~Login'); }
  get formsTab()  { return $('~Forms'); }
  get swipeTab()  { return $('~Swipe'); }
  get dragTab()   { return $('~Drag'); }

  async openTab(tabEl) {
    await tabEl.waitForDisplayed({ timeout: 10000 });
    await tabEl.click();
  }

  async goToLogin() { await this.openTab(this.loginTab); }
  async goToForms() { await this.openTab(this.formsTab); }
}

export default new Menu();
