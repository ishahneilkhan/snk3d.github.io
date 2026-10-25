import { json } from '../_lib/auth.js';

export async function onRequestGet({ env }) {
  try {
    const r = await env.DB.prepare('SELECT COUNT(*) AS c FROM projects').first();
    return json({ count: (r && r.c) || 0 });
  } catch (e) {
    return json({ count: 0 });
  }
}
