import { json, passwordOk, makeToken, sessionCookie } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const ok = await passwordOk(body.password, env);
  if (!ok) {
    await new Promise(r => setTimeout(r, 700)); // slow down guessing
    return json({ error: 'পাসওয়ার্ড ভুল' }, 401);
  }
  const token = await makeToken(env);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, 7 * 24 * 3600) });
}
