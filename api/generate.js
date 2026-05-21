export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { company, industry, revenue, stage, description, thesis } = req.body;
  if (!company || !description) return res.status(400).json({ error: 'Missing required fields' });

  const prompt = `You are a senior PE/M&A analyst. Draft a concise, professional investment memo based on the following:

Company: ${company}
Industry: ${industry || 'Not specified'}
Revenue: ${revenue || 'Not specified'}
Stage: ${stage || 'Not specified'}
Description: ${description}
Investment thesis: ${thesis || 'Not provided'}

Write a structured investment memo with these sections:
1. Executive Summary
2. Company Overview
3. Market Opportunity
4. Investment Thesis & Key Highlights
5. Key Risks
6. Preliminary Recommendation

Keep it concise and professional. Use plain text section headers followed by a colon. No markdown formatting.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const memo = data.content.map(b => b.text || '').join('');
    res.status(200).json({ memo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate memo' });
  }
}
