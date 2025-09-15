# K6 Load Tests Project

Este projeto atende aos requisitos:
- **Tarefa 1**: Teste de carga básico com **500 usuários simultâneos** (VUs) por **5 minutos** usando K6.
- **Tarefa 2**: Geração de **relatório HTML** e **JSON** automaticamente e **análise** via script Node.

## Como rodar

### 1) Pré-requisitos
- **K6** instalado:
  - Windows (Chocolatey): `choco install k6`
  - macOS (Homebrew): `brew install k6`
  - Linux (Debian/Ubuntu): veja instruções em https://k6.io/docs/get-started/installation/
- **Node.js 18+** (para o script de análise).

### 2) Executar o teste
Na raiz do projeto:

```bash
k6 run src/basic_load_test.js
```

> Por padrão, será testado `https://jsonplaceholder.typicode.com`.
> Você pode alterar o alvo com env var: `BASE_URL=https://httpbin.org k6 run src/basic_load_test.js`

### 3) Artefatos gerados
Após a execução, serão criados na raiz do projeto:
- `summary.html` – relatório HTML (Tarefa 2)
- `summary.json` – relatório em JSON (Tarefa 2)
- `summary.txt` – resumo em texto

### 4) Análise automática (Tarefa 2)
Instale dependências e rode o analisador:

```bash
npm i
npm run analyze
```

Gera `analysis.md` com comentários sobre p95, erros e gargalos comuns.

### 5) Rodar via Docker (opcional)
```bash
docker run --rm -v "$PWD":/tests -w /tests grafana/k6:latest run src/basic_load_test.js
```

## Estrutura
```
k6-load-tests/
├─ src/
│  └─ basic_load_test.js
├─ tools/
│  └─ analyze.js
├─ package.json
├─ .gitignore
└─ README.md
```
