# API Tests (Cypress)

- Base: `https://reqres.in`
- Reporter: `cypress-mochawesome-reporter`

## Rodar
```bash
npm ci
npx cypress run
```

## Relatórios
Gerados em `cypress/reports`.


## Tarefa 1 — “validar endpoints de uma API de exemplo”

**Foco:** qualidade das validações num conjunto pequeno de endpoints, incluindo **positivos e negativos**.

**No arquivo `tarefa1-basic.cy.js` eu testo:**

- `GET /users?page=2` → **200**, header `content-type` JSON, *shape* do corpo (lista com campos obrigatórios).
- `GET /users/2` → **200**, header JSON, dados do usuário esperados (ex.: `id: 2`, email com `@`).
- `GET /users/23` (**negativo**) → **404**, corpo `{}`.
- `POST /register` sem password (**negativo**) → **400**, corpo `{ error: "Missing password" }`.

**Por que isso cumpre a T1:**

- Verifica **status codes, headers e corpo**.
- Cobre **cenários importantes** (sucesso e erro).
- Mantém o teste **enxuto e claro**, mostrando domínio de validações.

---

## Tarefa 2 — “múltiplos endpoints + métodos (GET, POST, PUT, DELETE)”

**Foco:** cobertura de **métodos HTTP** e comportamento por operação (**CRUD**).

**No arquivo `tarefa2-crud.cy.js` eu testo:**

- `POST /users` → **201**, header JSON, corpo com `id` e `createdAt`.
- `GET /users` → **200**, header JSON, corpo com `data` em array.
- `PUT /users/2` → **200**, header JSON, corpo com `updatedAt`.
- `DELETE /users/2` → esperado **204**; para chaves sem permissão “manage”, o teste aceita **401/403** (documentado) para não falhar injustamente por permissão do token.

**Por que isso cumpre a T2:**

- Exercita **GET, POST, PUT, DELETE**.
- Em cada método, valida **status, headers e corpo**.
- Demonstra cobertura de **múltiplos endpoints**.

---

## Por que separei em dois arquivos

- **Aderência 1:1 ao enunciado:** cada spec corresponde a uma tarefa do desafio, facilitando a correlação e a correção.
- **Clareza e leitura:** T1 foca em validações profundas (inclui negativos); T2 foca em abrangência de métodos. Quem avalia entende “o que” está sendo demonstrado em cada um.
- **Diagnóstico rápido:** se algo quebra (ex.: permissão do token no DELETE), você sabe que é da **T2/CRUD**, sem poluir a T1.
- **Estabilidade:** cenários menores e coesos reduzem flakiness e tempo de execução por arquivo.
- **Relatórios melhores:** no Mochawesome, cada spec vira uma seção (“Tarefa 1”, “Tarefa 2”), deixando o resultado **autoexplicativo**.
- **Evolução fácil:** dá pra adicionar mais casos negativos na T1 sem mexer no CRUD; ou incluir novos endpoints/métodos na T2 sem tornar o arquivo gigante.
- **CI/CD:** fica simples rodar separado (ex.: `--spec tarefa1-basic.cy.js` vs `--spec tarefa2-crud.cy.js`) ou em paralelo.
"""
