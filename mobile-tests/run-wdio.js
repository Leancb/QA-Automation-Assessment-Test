// run-wdio.js
// - Zera variáveis que podem injetar ts-node/loader
// - Dispara o WDIO CLI com os argumentos passados na linha de comando

process.env.NODE_OPTIONS = "";
process.env.MOCHA_OPTIONS = "";
process.env.MOCHA_FILE = "";
process.env.npm_config_node_options = "";

// limpa flags de execução (ex.: --loader/--require indesejados)
process.execArgv.length = 0;

const { run } = require("@wdio/cli");

(async () => {
  try {
    const code = await run(); // Ex.: node run-wdio.js run wdio.conf.cjs --spec test/specs/forms.e2e.js
    process.exit(code);
  } catch (err) {
    console.error("[runner] WDIO CLI error:", err);
    process.exit(1);
  }
})();
