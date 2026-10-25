import { json, isAdmin } from '../../_lib/auth.js';

const toProject = r => ({
  id: r.id, title: r.title, client: r.client, code: r.code,
  img: r.img_key ? '/api/img/' + r.img_key : '',
  src: r.src, date: r.date
});

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: 'login দরকার' }, 401);
  const { results } = await env.DB.prepare(
    'SELECT id, title, client, code, img_key, src, date FROM projects ORDER BY created DESC'
  ).all();
  return json({ projects: results.map(toProject) });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: 'login দরকার' }, 401);
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'ভুল ডাটা' }, 400); }

  const title = String(b.title || '').trim().slice(0, 200);
  const client = String(b.client || '').trim().slice(0, 200);
  const code = String(b.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const src = String(b.src || '');
  const date = String(b.date || new Date().toISOString().slice(0, 10)).slice(0, 10);

  if (!title || !code || !src) return json({ error: 'নাম, কোড ও ৩ডি কোড দিন' }, 400);
  if (code.length < 3 || code.length > 12) return json({ error: 'কোড ৩-১২ অক্ষরের হতে হবে' }, 400);
  if (src.length > 1500000) return json({ error: '৩ডি কোড অনেক বড়' }, 400);

  let imgKey = '';
  if (b.img) {
    const m = String(b.img).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return json({ error: 'ছবির ফরম্যাট ঠিক নয়' }, 400);
    const bin = atob(m[2]);
    if (bin.length > 3 * 1024 * 1024) return json({ error: 'ছবি ৩MB এর বেশি' }, 400);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    imgKey = crypto.randomUUID();
    await env.IMAGES.put(imgKey, bytes, { httpMetadata: { contentType: m[1] } });
  }

  const id = crypto.randomUUID().slice(0, 12);
  try {
    await env.DB.prepare(
      'INSERT INTO projects (id, title, client, code, img_key, src, date, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, title, client, code, imgKey, src, date, Date.now()).run();
  } catch (e) {
    if (imgKey) await env.IMAGES.delete(imgKey);
    if (/UNIQUE/i.test(String(e))) return json({ error: 'এই কোড আগে ব্যবহার হয়েছে' }, 409);
    return json({ error: 'সেভ হয়নি' }, 500);
  }
  return json({ project: toProject({ id, title, client, code, img_key: imgKey, src, date }) }, 201);
}
