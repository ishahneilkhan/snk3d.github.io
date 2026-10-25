export async function onRequestGet({ params, env }) {
  const id = String(params.id || '');
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) return new Response('Not found', { status: 404 });
  const obj = await env.IMAGES.get(id);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': (obj.httpMetadata && obj.httpMetadata.contentType) || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
