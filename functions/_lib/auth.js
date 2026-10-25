const enc = new TextEncoder();

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEq(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }
  });

export const sessionCookie = (value, maxAge) =>
  `snk_admin=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

export async function passwordOk(input, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const a = await hmac('cmp', String(input || ''));
  const b = await hmac('cmp', env.ADMIN_PASSWORD);
  return safeEq(a, b);
}

export async function makeToken(env) {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  return exp + '.' + (await hmac(env.ADMIN_PASSWORD, 's.' + exp));
}

export async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)snk_admin=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEq(sig, await hmac(env.ADMIN_PASSWORD, 's.' + exp));
}
