export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email } = await req.json();
  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;

  // Create or update contact and add to list 14
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      listIds: [14],
      updateEnabled: true
    })
  });

  if (res.ok || res.status === 204) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const err = await res.json();
  // If contact already exists (code 400 + duplicate), still treat as success
  if (err.code === 'duplicate_parameter') {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Failed to subscribe' }), { status: 500 });
}
