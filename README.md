# QA Automation Assessment (Monorepo)

[![CI](https://github.com/Leancb/QA-Automation-Assessment/actions/workflows/ci.yml/badge.svg)](https://github.com/Leancb/QA-Automation-Assessment/actions)

> **Este README raiz é apenas um índice.**
> As instruções de instalação/execução estão **dentro de cada subprojeto** para evitar repetição e conflito de informações.

## Estrutura do repositório

```
.
├─ api-tests/       # Cypress (API) + Mochawesome
├─ e2e-tests/       # Cypress + Cucumber (Web) + Mochawesome
├─ mobile-tests/    # WebdriverIO + Appium (Android) + Allure
├─ load-tests/      # K6 (carga)
└─ .github/workflows/ci.yml
```

## Documentação por subprojeto

> Acesse o README específico de cada pasta:

- **API** → [api-tests/README.md](api-tests/README.md)
- **E2E Web (Cypress + Cucumber)** → [e2e-tests/README.md](e2e-tests/README.md)
- **Mobile (Android/Appium)** → [mobile-tests/README.md](mobile-tests/README.md)
- **Carga (K6)** → [load-tests/README.md](load-tests/README.md)

## Requisitos (visão geral)

- **Node.js LTS** (recomendado)
- **Java** e **Android SDK/Emulador** (apenas para `mobile-tests`)

> Versões, variáveis e dependências estão detalhadas nos READMEs de cada subprojeto.

## CI/CD (GitHub Actions)

O pipeline executa os jobs por frente de teste e publica **artifacts** (relatórios e evidências).
Confira em **Actions** a execução mais recente.

**Saídas padrão (onde encontrar no workspace do job):**
- `api-tests` → `cypress/reports/`
- `e2e-tests` → `cypress/reports/`
- `mobile-tests` → `allure-results/` e `allure-report/`
- `load-tests` → conforme README local

## Convenções

- Estrutura modular por frente de teste (monorepo).
- **Page Object Model** onde aplicável (Web/Mobile).
- **Tags** para smoke/regression (quando disponível).
- Relatórios são publicados como **artifacts** do CI (não commitados em `main`).

---

## Fluxo de Branches

Este projeto é desenvolvido e mantido por **um único autor**.  
Por isso, todo o trabalho é feito diretamente na branch `main`.

- A branch `main` contém **sempre a versão mais recente e estável** do código.
- Não são utilizadas branches separadas para features ou correções, pois o fluxo simplificado atende bem ao contexto atual.
- Caso o projeto evolua para colaboração em equipe, poderá ser adotada uma estratégia de branches (ex.: Git Flow ou Pull Requests).

---
**Dúvidas?** Consulte o README do subprojeto correspondente ou abra uma *issue*.
