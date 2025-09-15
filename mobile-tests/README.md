# mobile-tests (WebdriverIO + Appium + Allure)

Automação **Mobile (Android)** com **WebdriverIO + Appium 2.x** e relatório **Allure**.
---

## 1) Pré‑requisitos

- **Node.js** LTS (recomendado 20.x)
- **Java JDK** 17+
- **Android SDK** (inclui `platform-tools`, `build-tools`, `emulator`)
- **Android Studio** (opcional, ajuda a gerenciar SDK/AVD)
- **Appium 2.x** e **driver** `uiautomator2`
- (Opcional) **Allure commandline** para abrir relatórios localmente

### Instalação rápida (Windows)

No **PowerShell** (Admin de preferência):

```powershell
# Node (se necessário): https://nodejs.org/en
node -v

# Appium 2.x
npm i -g appium
appium -v

# Driver Android
appium driver install uiautomator2
appium driver list

# Doctor (opcional, checa setup)
npm i -g appium-doctor
appium-doctor --android
```

**Allure CLI** (uma das opções abaixo):
- Chocolatey: `choco install allure-commandline -y`
- Winget: `winget install QametaSoftware.Allure`

> Se `allure` não for reconhecido no terminal, reinicie o shell após instalar.

### Variáveis de ambiente (Windows)

- `JAVA_HOME` → diretório do JDK (ex.: `C:\Program Files\Java\jdk-17`)
- `ANDROID_HOME` → diretório do SDK (ex.: `C:\Users\<seu-usuario>\AppData\Local\Android\Sdk`)
- Inclua no **PATH**:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`
  - `%ANDROID_HOME%\tools` (se existir)

Verifique:
```powershell
java -version
adb version
emulator -version
```

---

## 2) Instalação do projeto

Na raiz **deste** projeto (`mobile-tests/`):

```bash
npm ci
```

> O arquivo `wdio.conf.cjs` deve apontar para seu **emulador** e **capabilities**. Ajuste `appPackage`, `appActivity` ou URL da app web se necessário.

---

## 3) Emulador/Dispositivo

### Criar/gerenciar AVD
Abra o **Android Studio** → **Device Manager** → crie um **Pixel** com API **>= 30**.

### Iniciar o emulador
- Pelo Android Studio (Iniciar ▶️), **ou**
- Pelo terminal:
  ```bash
  emulator -avd Pixel_5_API_30 -no-snapshot -no-boot-anim
  adb wait-for-device
  ```

Se travar em *device offline*:
```bash
adb kill-server
adb start-server
adb devices
```

---

## 4) Executar testes

Exemplos comuns de scripts (ajuste conforme seu `package.json`):

```bash
# Cenário de login específico
npm run test:login

# Suíte completa
npm run test:all

# Abrir o WDIO GUI (se configurado)
npm run test:open
```

> Caso seu script use diretiva explícita:  
> `wdio run wdio.conf.cjs --spec ./test/specs/login.e2e.js`

---

## 5) Relatórios (Allure)

Após a execução, os resultados ficam em **`allure-results/`** (ou `reports/allure/allure-results`, conforme seu `wdio.conf.cjs`).

Geração/abertura (ajuste o caminho de saída conforme seu projeto):

```bash
# Limpar, gerar e abrir
allure generate --clean --output allure-report allure-results
allure open ./allure-report

# Alternativa: servir direto dos results
allure serve allure-results
```

Se aparecer `allure: command not found`, instale a CLI (veja Pré-requisitos) e reabra o terminal.

---

## 6) Estrutura (exemplo)

```
mobile-tests/
├─ wdio.conf.cjs
├─ test/
│  ├─ specs/
│  │  └─ login.e2e.js
│  └─ pageobjects/           # (opcional) Page Objects para telas
├─ allure-results/           # saída bruta (gerado após testes)
├─ allure-report/            # HTML (gerado pelo "allure generate")
└─ package.json
```

> Se usar **Page Objects**, mantenha seletores consistentes e crie métodos reutilizáveis por tela/componente.

---

## 7) Dicas & Troubleshooting

- **device offline / boot infinito**  
  - Use `-no-snapshot -no-boot-anim` ao iniciar o emulador  
  - Garanta espaço em disco; tente *Cold Boot* no AVD Manager  
  - `adb kill-server && adb start-server`

- **Appium não encontra dispositivo**  
  - Confirme `adb devices` mostra o emulador como `device` (não `offline`)  
  - Uma instância por vez do Appium e do emulador

- **Allure vazio**  
  - Confira o **path** configurado em `wdio.conf.cjs` para `outputDir` do reporter Allure  
  - Gere o HTML com `allure generate` apontando para a pasta correta

---

## 8) CI (resumo)

No GitHub Actions, publique como **artifact** as pastas de relatório, por exemplo:
```
mobile-tests/allure-results/**
mobile-tests/allure-report/**
```

> Consulte o README do **monorepo** para a visão geral do pipeline.
