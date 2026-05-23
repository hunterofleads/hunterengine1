export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [2],
        updateEnabled: true,
        attributes: { SOURCE: 'Hunter Engine Website' }
      })
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();
    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true, duplicate: true });
    }

    return res.status(400).json({ error: 'Brevo error', detail: data });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
