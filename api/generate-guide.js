import { ALL_CATEGORIES } from '../src/lib/topics.js';

const MAX_TOPIC_LENGTH = 200;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' });
    return;
  }

  const { topic, category } = req.body || {};
  if (typeof topic !== 'string' || !topic.trim() || topic.length > MAX_TOPIC_LENGTH) {
    res.status(400).json({ error: `topic must be a non-empty string up to ${MAX_TOPIC_LENGTH} characters` });
    return;
  }
  if (typeof category !== 'string' || !ALL_CATEGORIES.includes(category)) {
    res.status(400).json({ error: 'category must be one of the known categories' });
    return;
  }

  const prompt = `Generate a detailed how-to guide for: "${topic.trim()}"

Return ONLY valid JSON (no markdown, no backticks) in exactly this structure:
{
  "title": "clear, specific title",
  "summary": "2-sentence compelling description of what the reader will achieve",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "e.g. 30 mins or 2 hours",
  "tools": ["tool or ingredient 1", "tool or ingredient 2", "tool or ingredient 3"],
  "steps": [
    {
      "id": 1,
      "title": "Action-verb step title",
      "content": "3-4 sentence detailed instruction. Be specific and practical.",
      "tip": "optional pro tip or warning (or null)",
      "codeSnippet": "only for tech topics, or null"
    }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "sources": [
    {
      "title": "Source name",
      "url": "https://real-url.com",
      "domain": "domain.com",
      "type": "Documentation" | "Article" | "Research" | "Official"
    }
  ],
  "youtubeQuery": "search query to find a relevant YouTube tutorial video",
  "warnings": ["safety warning if any"],
  "cost": "e.g. $0-20 or Free"
}

Requirements:
- 5-7 steps minimum, 8-10 for complex topics
- Steps must be actionable and specific, not vague
- Include real, credible source URLs
- Tools list: 3-8 items
- Tags: 4-6 relevant tags
- Make it genuinely useful for a real person doing this task`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `Anthropic API error: ${text}` });
      return;
    }

    const data = await response.json();
    const raw = data.content.map((b) => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const guide = JSON.parse(clean);

    res.status(200).json({ guide, category });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Guide generation failed' });
  }
}
