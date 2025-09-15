# e2e-tests (Cypress + Cucumber + Mochawesome)

## Scripts
- `npm i` — instala dependências
- `npm run test` — executa em headless
- `npm run open` — abre o Cypress GUI

## Observações
- Given/When/Then permanecem em inglês nos Steps.
- Relatório HTML é gerado em `cypress/reports/index.html`.

## Page Objects
- `cypress/e2e/pages/login.page.js`
- `cypress/e2e/pages/inventory.page.js`
- `cypress/e2e/pages/cart.page.js`
- `cypress/e2e/pages/checkout.page.js`

## Tags & Hooks
- Use `@needsLogin` para login automático no `Before` hook.
- Ex.: `@checkout`, `@smoke`, `@login`.

## Fixtures
- `cypress/fixtures/users.json` para credenciais por perfil.

## Parametrização
- Step: `When eu adiciono o produto "<NOME>" ao carrinho`.
