export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, comment } = req.body;

  if (!name || !email || !comment) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const escape = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Peace+Pines Paradise <noreply@deftweb.design>',
        to: ['cary.olson@outlook.com'],
        reply_to: 'cary.olson@outlook.com',
        subject: `New message from ${name} — Peace+Pines Paradise`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escape(name)}</p>
          <p><strong>Phone:</strong> ${escape(phone || 'Not provided')}</p>
          <p><strong>Email:</strong> ${escape(email)}</p>
          <p><strong>Message:</strong><br>${escape(comment).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send message.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
