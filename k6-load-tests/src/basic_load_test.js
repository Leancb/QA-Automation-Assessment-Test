import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 500,
      duration: '5m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.99'],
  },
  summaryTrendStats: ['avg','min','med','max','p(90)','p(95)'],
};

const getPostDuration = new Trend('get_post_duration', true);
const listPostsDuration = new Trend('list_posts_duration', true);
const errors = new Counter('errors');
const okRate = new Rate('ok_rate');

export default function () {
  group('list posts', () => {
    const res = http.get(`${BASE_URL}/posts`);
    listPostsDuration.add(res.timings.duration);
    const ok = check(res, {
      'status is 200 (list)': (r) => r.status === 200,
      'has json array': (r) => {
        try {
          const data = r.json();
          return Array.isArray(data) && data.length > 0;
        } catch (e) {
          return false;
        }
      },
    });
    okRate.add(ok);
    if (!ok) errors.add(1);
    sleep(Math.random() * 0.5 + 0.2);
  });

  group('get single post', () => {
    const id = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/posts/${id}`);
    getPostDuration.add(res.timings.duration);
    const ok = check(res, {
      'status is 200 (get)': (r) => r.status === 200,
      'json has id': (r) => {
        try {
          const data = r.json();
          return typeof data?.id === 'number';
        } catch (e) {
          return false;
        }
      },
    });
    okRate.add(ok);
    if (!ok) errors.add(1);
    sleep(Math.random() * 0.5 + 0.2);
  });
}

export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
    'summary.json': JSON.stringify(data, null, 2),
    'summary.txt': textSummary(data, { indent: ' ', enableColors: false }),
  };
}
