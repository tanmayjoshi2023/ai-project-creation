const http = require('http');
const email = `test${Date.now()}@example.com`;
const password = 'Password123!';
const base = 'http://localhost:3000';

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const method = opts.method || 'GET';
  const body = opts.body ? JSON.stringify(opts.body) : undefined;
  if (body) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ res, data }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

;(async () => {
  const signup = await request('/api/auth/sign-up/email', { method: 'POST', body: { email, password, name: 'Tester' } });
  console.log('sign-up', signup.res.status);
  console.log(signup.data);
  const cookieHeader = signup.res.headers['set-cookie'] ? signup.res.headers['set-cookie'][0].split(';')[0] : '';
  const session = await request('/api/auth/get-session', { headers: { Cookie: cookieHeader } });
  console.log('get-session', session.res.status);
  console.log('session contains email', session.data.includes(email));

  const dashboard = await request('/', { headers: { Cookie: cookieHeader } });
  console.log('dashboard status', dashboard.res.status);
  console.log('investment analysis in dashboard', dashboard.data.includes('Investment Analysis'));

  const research = await request('/research', { headers: { Cookie: cookieHeader } });
  console.log('research status', research.res.status);
  console.log('research page contains Research', research.data.includes('Investment Research'));

  const search = await request('/api/search/companies?q=NVDA');
  console.log('search status', search.res.status);
  console.log('search contains NVDA', search.data.includes('NVDA'));

  const signout = await request('/api/auth/sign-out', { method: 'POST', headers: { Cookie: cookieHeader, Origin: 'http://localhost:3000' }, body: {} });
  console.log('sign-out status', signout.res.status);
  console.log(signout.data);
  const afterSignout = await request('/api/auth/get-session', { headers: { Cookie: cookieHeader } });
  console.log('session after sign-out', afterSignout.res.status, afterSignout.data);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});