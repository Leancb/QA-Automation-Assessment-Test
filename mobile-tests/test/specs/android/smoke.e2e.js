import { strict as assert } from 'assert';

describe('Android APK – smoke', () => {
  it('abre o app e encontra algo na tela', async () => {
    // pequena espera para a app abrir:
    await driver.pause(3000);

    // Tenta alguns candidatos comuns de raiz:
    const selectors = [
      'new UiSelector().resourceId("android:id/content")',
      'new UiSelector().className("android.widget.FrameLayout")'
    ];

    let ok = false;
    for (const expr of selectors) {
      const el = await $(`android=${expr}`);
      if (await el.isExisting()) { ok = true; break; }
    }

    // Se nada encontrado, imprime um trecho do page source para debug:
    if (!ok) {
      const src = await driver.getPageSource();
      console.log(src.substring(0, 800));
    }
    assert.equal(ok, true, 'Deveria encontrar ao menos um elemento raiz');
  });
});
