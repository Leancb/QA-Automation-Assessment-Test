// test/pageobjects/forms.po.js

// Fallbacks estáveis para a aba Home
const HOME_FALLBACK_SELECTORS = [
  // Acessibilidade (pt/en)
  '~Início',
  '//*[@content-desc="Home"]',
  '//*[@content-desc="Início"]',
  'android=new UiSelector().descriptionContains("Home")',
  'android=new UiSelector().descriptionContains("Início")',

  // resource-id comuns em bottom nav
  'android=new UiSelector().resourceIdMatches(".*:id/(navigation_home|nav_home|menu_home|tab_home|home)$")',

  // Texto visível
  '//*[@text="Home"]',
  '//*[@text="Início"]',
  'android=new UiSelector().textContains("Home")',
  'android=new UiSelector().textContains("Início")',
];

// helper: tenta vários seletores até achar um exibido
async function findOneDisplayed(selectors, timeoutMs = 12000) {
  const end = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < end) {
    for (const sel of selectors) {
      try {
        const el = await $(sel);
        if (await el.isExisting() && await el.isDisplayed()) return el;
      } catch (e) { lastErr = e; }
    }
    await driver.pause(300);
  }
  throw new Error(
    `Botão Home não encontrado. Tentativas: ${selectors.join(' | ')}. Último erro: ${lastErr || 'n/a'}`
  );
}

// --- Heurística final: escolhe um elemento clicável no rodapé usando o XML ---
function parseBounds(boundsStr) {
  const m = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/.exec(boundsStr || '');
  if (!m) return null;
  const [ , x1, y1, x2, y2 ] = m.map(Number);
  return { x1, y1, x2, y2, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
}

function buildXPathFromNode(node) {
  if (node.res && node.res !== '') return `//*[@resource-id="${node.res}"]`;
  if (node.desc && node.desc !== '') return `//*[@content-desc="${node.desc}"]`;
  if (node.text && node.text !== '') return `//*[@text="${node.text}"]`;
  if (node.cls && node.boundsRaw) return `//*[@class="${node.cls}" and @bounds="${node.boundsRaw}"]`;
  return null;
}

async function pickBottomClickableXPath() {
  const xml = await driver.getPageSource();
  const { height } = await driver.getWindowRect();

  const re = /<(?<cls>[^\s>]+)[^>]*?clickable="(?<clickable>true|false)"[^>]*?bounds="(?<bounds>\[[^\]]+\]\[[^\]]+\])"[^>]*?(?:resource-id="(?<res>[^"]*)")?[^>]*?(?:content-desc="(?<desc>[^"]*)")?[^>]*?(?:text="(?<text>[^"]*)")?[^>]*?>/g;
  const nodes = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    if (m.groups.clickable !== 'true') continue;
    const b = parseBounds(m.groups.bounds);
    if (!b) continue;
    nodes.push({
      cls: m.groups.cls,
      res: m.groups.res || '',
      desc: m.groups.desc || '',
      text: m.groups.text || '',
      bounds: b,
      boundsRaw: m.groups.bounds
    });
  }
  if (!nodes.length) return null;

  const cutoffY = height * 0.70;

  function score(n) {
    let s = 0;
    if (n.bounds.cy >= cutoffY) s += 10; // rodapé
    const hay = `${n.res}|${n.desc}|${n.text}`.toLowerCase();
    if (hay.includes('home') || hay.includes('início') || hay.includes('inicio')) s += 5;
    if (n.cls.includes('BottomNavigation') || n.cls.includes('BottomNavigationItem')) s += 3;
    if (n.res) s += 2;
    return s;
  }

  nodes.sort((a, b) => score(b) - score(a));
  for (const n of nodes) {
    const xp = buildXPathFromNode(n);
    if (!xp) continue;
    const el = await $(xp);
    if (await el.isExisting()) return xp;
  }
  return null;
}

const assert = require('assert');

class FormsScreen {
  // ===== Navegação =====
  get menuForms() { return $('~Forms'); }

  async openForms() {
    await this.menuForms.waitForDisplayed({ timeout: 15000 });
    await this.menuForms.click();
    await this.inputField.waitForDisplayed({ timeout: 15000 });
  }

  // ===== Input =====
  get inputField() { return $('~text-input'); } // accessibility id da sua tela
  get inputFieldById() { // fallback pelo resource-id
    return $('//android.widget.EditText[@resource-id="RNE__Input__text-input"]');
  }
  get typedLabel() { return $('//android.widget.TextView[@text="You have typed:"]'); }
  get typedValue() {
    return $('//android.widget.TextView[@text="You have typed:"]/following-sibling::android.widget.TextView[1]');
  }

  async typeInInput(text) {
    let el = this.inputField;
    if (!(await el.isExisting().catch(() => false))) el = this.inputFieldById;

    await el.waitForDisplayed({ timeout: 15000 });
    await el.click();
    await el.clearValue().catch(() => {});
    await el.setValue(text);
    await driver.hideKeyboard().catch(() => {});
  }

  async assertTypedEquals(expected) {
    await this.typedValue.waitForDisplayed({ timeout: 8000 });
    const got = (await this.typedValue.getText()).trim();
    assert.strictEqual(got, expected, `Esperava "${expected}" em "You have typed:", mas veio "${got}".`);
  }

  // ===== Switch =====
  get switchCtrl() { return $('android=new UiSelector().className("android.widget.Switch")'); }
  get switchText() { return $('android=new UiSelector().textStartsWith("Click to turn the switch")'); }
  async toggleSwitch() {
    await this.switchCtrl.waitForDisplayed({ timeout: 15000 });
    await this.switchCtrl.click();
  }

  // ===== Dropdown =====
  get dropdownSpinner() {
    return $('//android.widget.TextView[@text="Dropdown:"]/following-sibling::*[1]');
  }
  get dropdownList() {
    return $('(//android.widget.ListView | //androidx.recyclerview.widget.RecyclerView)[1]');
  }
  async openDropdown() {
    await this.dropdownSpinner.waitForDisplayed({ timeout: 15000 });
    await this.dropdownSpinner.click();
    await this.dropdownList.waitForDisplayed({ timeout: 15000 });
  }
  optionByTextInsideList(txt) { return this.dropdownList.$(`.//*[@text="${txt}"]`); }
  async selectDropdownByText(text) {
    if (!(await this.dropdownList.isDisplayed().catch(() => false))) await this.openDropdown();
    const item = this.optionByTextInsideList(text);
    await item.waitForDisplayed({ timeout: 10000 });
    await item.click();
    await this.dropdownList.waitForExist({ reverse: true, timeout: 5000 });
    await browser.pause(150);
  }
  async assertDropdownSelection(expectedText) {
    await this.dropdownList.waitForExist({ reverse: true, timeout: 2000 }).catch(() => {});
    const selectedEl = await $(`//*[@text="${expectedText}"]`);
    await selectedEl.waitForDisplayed({ timeout: 5000 });
    const visible = await selectedEl.isDisplayed();
    assert.ok(visible, `Esperava ver "${expectedText}" visível após fechar o dropdown.`);
  }

  // ===== Diálogo =====
  get inactiveBtn() { return $('android=new UiSelector().text("Inactive")'); }
  get activeBtn()   { return $('android=new UiSelector().text("Active")'); }
  get dlgOk()         { return $('android=new UiSelector().textMatches("(?i)^OK$")'); }
  get dlgCancel()     { return $('android=new UiSelector().textMatches("(?i)^Cancel$")'); }
  get dlgAskMeLater() { return $('android=new UiSelector().textMatches("(?i)^Ask me later$")'); }

  // ===== Home (último passo) =====
  get homeIconGlyph() { return $('//android.widget.TextView[@text="󰚡"]'); } // solicitado (glyph)
  get homeTabByAcc()  { return $('~Home'); } // fallback original

  /**
   * Vai para a Home clicando no ícone solicitado.
   * Fluxo preservado: glyph -> ~Home -> fallbacks -> heurística por XML.
   */
  async goHome() {
    // 1) Seu seletor original (glyph)
    try {
      if (await this.homeIconGlyph.isExisting()) {
        await this.homeIconGlyph.waitForDisplayed({ timeout: 10000 });
        await this.homeIconGlyph.click();
        return;
      }
    } catch (_) {}

    // 2) Seu fallback original (~Home)
    try {
      if (await this.homeTabByAcc.isExisting()) {
        await this.homeTabByAcc.waitForDisplayed({ timeout: 10000 });
        await this.homeTabByAcc.click();
        return;
      }
    } catch (_) {}

    // 3) Fallbacks adicionais (id/desc/texto)
    try {
      const el = await findOneDisplayed(HOME_FALLBACK_SELECTORS, 15000);
      await el.click();
      return;
    } catch (_) {}

    // 4) Heurística final: pega item clicável no rodapé via XML
    const xp = await pickBottomClickableXPath();
    if (xp) {
      const el = await $(xp);
      await el.waitForDisplayed({ timeout: 8000 }).catch(() => {});
      await el.click();
      return;
    }

    throw new Error('Botão Home não encontrado nem pelos seletores originais, nem pelos fallbacks, nem pela heurística de rodapé.');
  }
}

module.exports = new FormsScreen();
