const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const all = req.query.all === 'true';
    const url = all
      ? `${SUPABASE_URL}/rest/v1/guestbook?order=rating.desc,visit_date.desc.nullslast`
      : `${SUPABASE_URL}/rest/v1/guestbook?order=rating.desc,visit_date.desc.nullslast&limit=3`;

    const response = await fetch(url, { headers });
    const data = await response.json();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, from_location, visit_date, rating, message } = req.body;
    if (!name || !message || !rating) {
      return res.status(400).json({ error: 'Name, rating, and message are required.' });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, from_location, visit_date, rating, message }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to save entry.' });
    }

    const data = await response.json();
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
