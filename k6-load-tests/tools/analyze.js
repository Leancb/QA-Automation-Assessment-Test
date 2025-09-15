import fs from 'node:fs';

const input = 'summary.json';
const output = 'analysis.md';

if (!fs.existsSync(input)) {
  console.error(`Arquivo ${input} não encontrado. Rode o teste antes: k6 run src/basic_load_test.js`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(input, 'utf-8'));
const m = data.metrics || {};

function val(metric, key) {
  return m[metric] && m[metric].values ? m[metric].values[key] : undefined;
}

const p95 = val('http_req_duration', 'p(95)');
const avg = val('http_req_duration', 'avg');
const failRate = val('http_req_failed', 'rate');
const reqs = val('http_reqs', 'count');
const rps = val('http_reqs', 'rate');
const vusMax = val('vus_max', 'max');
const checksRate = val('checks', 'rate');

const thresholdP95 = 800;
const thresholdFail = 0.01;

let issues = [];
if (typeof p95 === 'number' && p95 > thresholdP95) {
  issues.push(`p95 acima do alvo: **${p95.toFixed(2)} ms** (> ${thresholdP95} ms)`);
}
if (typeof failRate === 'number' && failRate > thresholdFail) {
  issues.push(`Taxa de falhas alta: **${(failRate*100).toFixed(2)}%** (> 1%)`);
}
if (typeof checksRate === 'number' && checksRate < 0.99) {
  issues.push(`Checks abaixo de 99%: **${(checksRate*100).toFixed(2)}%**`);
}

const lines = [
  '# Análise do Teste de Carga (K6)',
  '',
  `**Requisições**: ${reqs ?? '-'}  |  **RPS**: ${typeof rps === 'number' ? rps.toFixed(2) : '-' }  |  **VUs máx**: ${vusMax ?? '-'}`,
  `**http_req_duration**: avg=${typeof avg === 'number' ? avg.toFixed(2) : '-'} ms, p95=${typeof p95 === 'number' ? p95.toFixed(2) : '-'} ms`,
  `**http_req_failed**: ${typeof failRate === 'number' ? (failRate*100).toFixed(2) : '-'}%`,
  `**checks**: ${typeof checksRate === 'number' ? (checksRate*100).toFixed(2) : '-'}%`,
  '',
  '## Avaliação',
  issues.length ? `- ❌ Problemas detectados:\n  - ${issues.join('\n  - ')}` : '- ✅ Sem violações de threshold detectadas.',
  '',
  '## Possíveis Gargalos & Próximos Passos',
  '- Se p95 > alvo: investigar latência no backend (DB, I/O externo), uso de cache e compressão.',
  '- Se http_req_failed > 1%: verificar timeouts, HTTP 5xx/4xx, limites (rate limiting).',
  '- Medir por endpoint: dividir cenários em grupos/scenarios específicos.',
  '- Monitorar recursos durante o teste (CPU, memória, DB).',
  '- Repetir com rampas de chegada (ramping-arrival-rate) para avaliar escalabilidade.',
  '',
  '---',
  '_Gerado automaticamente por tools/analyze.js_',
];

fs.writeFileSync(output, lines.join('\n'), 'utf-8');
console.log(`OK: análise gerada em ${output}`);
