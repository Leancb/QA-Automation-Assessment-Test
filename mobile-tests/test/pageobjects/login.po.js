// test/pageobjects/login.po.js

// Fallbacks estáveis (não mudam o fluxo quando os originais existem)
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
  // Prioridade: resource-id > content-desc > text > class+bounds
  if (node.res && node.res !== '') return `//*[@resource-id="${node.res}"]`;
  if (node.desc && node.desc !== '') return `//*[@content-desc="${node.desc}"]`;
  if (node.text && node.text !== '') return `//*[@text="${node.text}"]`;
  if (node.cls && node.boundsRaw) return `//*[@class="${node.cls}" and @bounds="${node.boundsRaw}"]`;
  return null;
}

async function pickBottomClickableXPath() {
  const xml = await driver.getPageSource();
  const { height } = await driver.getWindowRect();

  // pega todos os nós com clickable="true" e bounds
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

  // define "faixa inferior" (últimos 30% da tela)
  const cutoffY = height * 0.70;

  // pontua por: estar no rodapé, e se tiver traços de "home"/"início"
  function score(n) {
    let s = 0;
    if (n.bounds.cy >= cutoffY) s += 10; // rodapé
    const hay = `${n.res}|${n.desc}|${n.text}`.toLowerCase();
    if (hay.includes('home') || hay.includes('início') || hay.includes('inicio')) s += 5;
    // itens de material bottom nav costumam ser estes:
    if (n.cls.includes('BottomNavigation') || n.cls.includes('BottomNavigationItem')) s += 3;
    // preferir elementos com resource-id
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

class LoginPage {
  // ---- Navegação / campos
  get tabLogin()      { return $('~Login'); }
  get inputEmail()    { return $('~input-email'); }
  get inputPassword() { return $('~input-password'); }
  get btnLogin()      { return $('//android.widget.TextView[@text="LOGIN"]'); }

  // ---- Alerta (Android AlertDialog padrão)
  get msgTitle() { return $('//android.widget.TextView[@resource-id="android:id/alertTitle"]'); } // "Success"
  get msgBody()  { return $('//android.widget.TextView[@resource-id="android:id/message"]'); }    // "You are logged in!"
  get btnOk()    { return $('id:android:id/button1'); } // OK

  // ---- Home (pedido)
  get homeIconGlyph() { return $('//android.widget.TextView[@text="󰚡"]'); } // mantém como você usava
  get homeTabByAcc()  { return $('~Home'); }                                 // fallback original

  async openTab() {
    await this.tabLogin.waitForExist({ timeout: 15000 });
    await this.tabLogin.click();
  }

  /**
   * Faz login, valida o diálogo de sucesso e fecha.
   */
  async doLogin(email, password) {
    await this.inputEmail.waitForDisplayed({ timeout: 15000 });
    await this.inputEmail.setValue(email);

    await this.inputPassword.waitForDisplayed({ timeout: 15000 });
    await this.inputPassword.setValue(password);

    await this.btnLogin.click();
    await this.btnLogin.waitForDisplayed({ reverse: true, timeout: 10000 });

    // Espera alerta visível
    await this.msgTitle.waitForDisplayed({ timeout: 15000 });
    await expect(this.msgTitle).toHaveText('Success');

    await this.btnOk.waitForEnabled({ timeout: 5000 });
    await this.btnOk.click();

    // dá um respiro pro layout estabilizar
    await driver.pause(500);

    await this.msgTitle.waitForExist({ reverse: true, timeout: 10000 });
    await this.msgBody.waitForExist({ reverse: true, timeout: 10000 });
    await expect(this.msgTitle).not.toBeExisting();
    await expect(this.msgBody).not.toBeExisting();
  }

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

    // Se chegou aqui, mantenho o erro para não mascarar falhas reais
    throw new Error(
      'Botão Home não encontrado nem pelos seletores originais, nem pelos fallbacks, nem pela heurística de rodapé.'
    );
  }
}

module.exports = new LoginPage();
