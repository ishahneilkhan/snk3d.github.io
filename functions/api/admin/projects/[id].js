import { json, isAdmin } from '../../../_lib/auth.js';

export async function onRequestDelete({ request, params, env }) {
  if (!(await isAdmin(request, env))) return json({ error: 'login দরকার' }, 401);
  const id = String(params.id || '');
  const r = await env.DB.prepare('SELECT img_key FROM projects WHERE id = ?').bind(id).first();
  if (!r) return json({ error: 'পাওয়া যায়নি' }, 404);
  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  if (r.img_key) await env.IMAGES.delete(r.img_key);
  return json({ ok: true });
}
