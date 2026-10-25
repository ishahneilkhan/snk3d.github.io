import { json } from '../_lib/auth.js';

// Public: returns ONE project, only if the exact code is known.
export async function onRequestGet({ request, env }) {
  const code = (new URL(request.url).searchParams.get('code') || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{3,12}$/.test(code)) return json({ project: null }, 404);
  const r = await env.DB.prepare(
    'SELECT id, title, client, code, img_key, src, date FROM projects WHERE code = ?'
  ).bind(code).first();
  if (!r) return json({ project: null }, 404);
  return json({
    project: {
      id: r.id, title: r.title, client: r.client, code: r.code,
      img: r.img_key ? '/api/img/' + r.img_key : '',
      src: r.src, date: r.date
    }
  });
}
