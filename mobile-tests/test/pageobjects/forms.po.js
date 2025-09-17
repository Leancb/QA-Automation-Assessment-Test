// test/pageobjects/forms.po.js
// PageObject para cenários de "Forms" — selectors resilientes + scroll + fechamento de alert

class FormsScreen {
  // Selectors candidatos para acessar a seção "Forms"
  get formsByAccEn() { return $('~Forms'); }
  get formsByAccPt() { return $('~Formulários'); }
  get formsByText()  { return $('android=new UiSelector().textMatches("(?i)forms|formulários")'); }
  // Caso exista resource-id estável (ajuste o regex conforme seu app):
  get formsByResId() { return $('android=new UiSelector().resourceIdMatches(".*:id/.*forms.*")'); }

  // Marcador genérico de "home pronta" (ajuste conforme seu app: logo, título, primeiro card etc.)
  get homeMarker() { 
    return $('android=new UiSelector().descriptionMatches("(?i)home|catalog|wdio|demo")');
  }

  async waitHomeReady(timeout = 10000) {
    try {
      await this.homeMarker.waitForDisplayed({ timeout });
    } catch (e) {
      // Se o marcador não existir no seu app, isso não deve travar os testes
      // mas ajuda a garantir que a tela inicial terminou de renderizar no CI.
    }
  }

  async closeAlertIfPresent(timeout = 3000) {
    const okById   = $('android=new UiSelector().resourceId("android:id/button1")');
    const okByText = $('android=new UiSelector().textMatches("(?i)ok|entendi|fechar")');

    try {
      await okById.waitForDisplayed({ timeout });
      await okById.click();
      return true;
    } catch {}
    try {
      await okByText.waitForDisplayed({ timeout });
      await okByText.click();
      return true;
    } catch {}
    return false;
  }

  async findFirstVisible(getters, timeoutEach = 3000) {
    for (const getter of getters) {
      try {
        const el = await getter;
        await el.waitForDisplayed({ timeout: timeoutEach });
        return el;
      } catch (_) {
        // tenta o próximo
      }
    }
    return null;
  }

  async scrollToTextRegex(regex, maxSwipes = 4) {
    // Tenta via UiScrollable primeiro (quando houver um container scrollable)
    try {
      await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("${regex.source.replace('(?i)', '')}")`);
      return true;
    } catch {}
    // Fallback: swipes manuais para cima
    for (let i = 0; i < maxSwipes; i++) {
      await driver.touchPerform([
        { action: 'press', options: { x: 500, y: 1400 } },
        { action: 'wait',  options: { ms: 300 } },
        { action: 'moveTo', options: { x: 500, y: 400 } },
        { action: 'release' }
      ]);
      const texts = await $$('android.widget.TextView');
      for (const tv of texts) {
        const txt = await tv.getText().catch(() => '');
        if (txt && regex.test(txt)) return true;
      }
    }
    return false;
  }

  /**
   * Abre a seção "Forms" de maneira robusta:
   * - Fecha alert inicial (se houver)
   * - Aguarda a Home estar pronta
   * - Tenta múltiplos seletores e rolagem
   */
  async openForms() {
    await this.closeAlertIfPresent(2500);
    await this.waitHomeReady(10000);

    const candidates = [
      this.formsByAccEn,
      this.formsByAccPt,
      this.formsByText,
      this.formsByResId,
    ];

    let el = await this.findFirstVisible(candidates, 3000);
    if (!el) {
      await this.scrollToTextRegex(/Forms|Formulários/i, 5);
      el = await this.findFirstVisible(candidates, 3000);
    }

    if (!el) {
      // Debug extra facilita entender o que o CI realmente está vendo
      try {
        console.log('[DEBUG] PageSource (Forms não encontrado):');
        console.log(await driver.getPageSource());
      } catch {}
      throw new Error('Forms tab/button não localizado (nem após scroll).');
    }
    await el.click();
  }
}

module.exports = new FormsScreen();
