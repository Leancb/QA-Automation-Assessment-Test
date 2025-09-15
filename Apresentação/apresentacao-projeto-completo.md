# Avaliação — Automação de Testes (Projeto Completo)

_Apresentação • 17/08/2025_


## Avaliação — Automação de Testes (Projeto Completo)

- Apresentação • 17/08/2025

## Agenda

- Visão geral do projeto
- Atendimento a cada bloco da avaliação (1–5)
- Evidências e relatórios
- Pipeline CI/CD
- Próximos passos

## Objetivos da Avaliação

- 1) Testes de Carga (K6/JMeter)
- 2) Testes de API (Rest Assured / Cypress / Playwright)
- 3) Testes E2E com Cucumber
- 4) Testes Mobile (Appium/WDIO)
- 5) Integração e CI/CD (GitHub Actions/GitLab CI)

## Arquitetura / Estrutura de Pastas


```
.
├── k6-load-tests/            # Performance (K6) — 500 VUs / 5m
│   ├── basic_load_test.js
│   ├── summary.html / .json / .txt
├── api-tests/                # Testes de API (Cypress)
│   └── cypress/reports/*
├── e2e-tests/                # E2E com Cucumber (Cypress)
│   ├── cypress/e2e/features/*
│   └── cypress/reports/*
├── mobile-tests/             # Mobile (WebdriverIO + Appium) + Allure
│   ├── allure-results/*  → gerar
│   └── allure-report/*   → abrir via servidor
└── .github/workflows/ci.yml  # Pipeline CI (API, E2E, Mobile, K6)

```


## Ferramentas e Versões (principais)

- Node.js 20+ (dev tooling)
- K6 (Docker: grafana/k6:latest)
- Cypress + Cucumber (E2E e API)
- WebdriverIO + Appium (Android / UiAutomator2)
- Allure (Mobile) e Mochawesome (Cypress)
- GitHub Actions (ubuntu-latest)

## 1) Testes de Carga — Objetivo & Tarefas

- Objetivo: avaliar experiência com K6/JMeter
- Tarefa: K6 com 500 VUs por 5 minutos contra API pública
- Avaliação: qualidade do script, métricas e gargalos
- Relatório e análise dos resultados

## 1) K6 — Implementação


```
import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = { vus: 500, duration: '5m',
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<800'], checks: ['rate>0.99'] } };
export default function () {
  const res = http.get('https://reqres.in/api/users?page=2');
  check(res, { 'status 200': r => r.status === 200 });
  sleep(0.3);
}

```


## 1) K6 — Resultados (amostra)

- Requisições: 32724
- p95: 16232.00076499999 ms | média: 3844.4128375198516 ms
- Falhas: 3.00% | Checks OK: 97.07%
- VUs máx: 500

## 1) K6 — Evidências

- summary.html (visual), summary.json (dados), summary.txt (texto)
- Abrir HTML via servidor local (http-server / python -m http.server)
- Análise detalhada em analysis.md

## 2) Testes de API — Objetivo & Tarefas

- Validar endpoints de uma API exemplo (status, headers, body)
- Cobrir métodos GET/POST/PUT/DELETE (positivos/negativos)
- Gerar e apresentar relatório

## 2) API — Implementação (Cypress)


```
// Cypress - teste de API (exemplo)
it('GET /users retorna 200 e schema esperado', () => {
  cy.request('/api/users?page=2').then(res => {
    expect(res.status).to.eq(200);
    expect(res.headers).to.have.property('content-type').and.include('application/json');
    expect(res.body.data).to.be.an('array').and.not.be.empty;
  });
});

```


## 2) API — Evidências

- Relatórios Mochawesome em api-tests/cypress/reports/**
- Execução headless no CI + upload de artefatos
- Cenários positivos e negativos documentados

## 3) E2E com Cucumber — Objetivo & Tarefas

- Login e navegação até página alvo (assertivas de sucesso)
- Fluxo de checkout simples (adicionar ao carrinho → pagar → finalizar)
- Boas práticas: Page Object Pattern, estabilidade e tempo de execução
- Relatório detalhado dos testes E2E

## 3) E2E — Implementação


```
// Cucumber + Cypress (Gherkin)
Feature: Login
  Scenario: Usuário válido acessa a área logada
    Given que estou na página de login
    When informo usuário e senha válidos
    And clico em "Login"
    Then vejo a página inicial autenticada

```


## 3) E2E — Evidências

- Features e steps em e2e-tests/cypress/e2e/features/**
- Relatórios Mochawesome em e2e-tests/cypress/reports/**
- Page Objects e comandos customizados para reuso

## 4) Testes Mobile — Objetivo & Tarefas

- Login, navegação por telas e validação de elemento
- Cenário de formulário e envio de dados
- Avaliação: locators nativos, clareza e estabilidade
- Relatório detalhado dos testes móveis

## 4) Mobile — Implementação (WDIO + Appium)


```
// WebdriverIO + Appium - login (Android)
it('login', async () => {
  await $('#username').setValue('standard_user');
  await $('#password').setValue('secret_sauce');
  await $('~login-button').click();
  await expect($('~home-title')).toBeDisplayed();
});

```


## 4) Mobile — Evidências

- Allure Results: mobile-tests/allure-results/**
- Allure Report: mobile-tests/allure-report/index.html
- Abrir via: npx allure open ./allure-report

## 5) Integração e CI/CD — Objetivo & Tarefas

- Pipeline que executa API, E2E e Mobile a cada commit
- Clareza de configuração e uso eficiente de CI
- Relatórios detalhados das execuções no pipeline

## 5) CI/CD — Pipeline (GitHub Actions)

- Disparo: push/pull_request/workflow_dispatch
- Jobs paralelos: API, E2E, Mobile, K6
- Cache de dependências (Node)
- Upload de artefatos (reports HTML/JSON/TXT/Allure)
- Fail-fast por thresholds (K6) e testes quebrados

## Publicação & README (Requisitos)

- Projeto publicado em GitHub/GitLab
- README com: nome/descrição, estrutura, versões, dependências, execução e geração de relatórios
- Links/caminhos para evidências de teste (reports)

## Comandos Rápidos (Resumo)


```
# K6
cd k6-load-tests && k6 run basic_load_test.js
# Relatórios: summary.html / .json / .txt  (abra via http://localhost:8080)

# API (Cypress)
cd api-tests && npm ci && npx cypress run
# Relatório: api-tests/cypress/reports/**

# E2E (Cypress + Cucumber)
cd e2e-tests && npm ci && npx cypress run --config-file cypress.config.cjs
# Relatório: e2e-tests/cypress/reports/**

# Mobile (WDIO + Appium)
cd mobile-tests && npm ci && npx wdio run wdio.conf.ts
# Allure: npx allure generate --clean --output allure-report allure-results
# Abrir: npx allure open ./allure-report

```


## Conclusões & Próximos Passos

- Requisitos atendidos em todas as frentes (1–5)
- Próximos: ampliar cenários, dados sintéticos, thresholds por SLO, histórico de execuções no CI
- Opcional: publicar relatórios (Allure/Mochawesome/K6) via GitHub Pages