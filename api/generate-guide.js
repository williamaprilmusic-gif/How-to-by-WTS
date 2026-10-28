import { ALL_CATEGORIES } from '../src/lib/topics.js';

const MAX_TOPIC_LENGTH = 200;

// Provider registry. Cerebras and Groq share the OpenAI-compatible
// chat-completions shape; Gemini uses Google's generateContent shape.
// Each provider is used only if its API key is present, so the app keeps
// working on whichever key is configured.
const PROVIDERS = {
  cerebras: {
    kind: 'openai',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    keyEnv: 'CEREBRAS_API_KEY',
    modelEnv: 'CEREBRAS_MODEL',
    defaultModel: 'llama-3.3-70b',
  },
  groq: {
    kind: 'openai',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    modelEnv: 'GROQ_MODEL',
    defaultModel: 'llama-3.3-70b-versatile',
  },
  gemini: {
    kind: 'gemini',
    keyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    defaultModel: 'gemini-3.8-flash',
  },
};

function buildPrompt(topic) {
  return `Generate a detailed how-to guide for: "${topic}"

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
}

async function callOpenAICompatible(provider, model, apiKey, prompt) {
  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(model, apiKey, prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text}`);
  }
  const data = await response.json();
  return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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

  // Primary provider from LLM_PROVIDER (default cerebras), then the rest as
  // automatic fallbacks. Any provider without an API key is skipped, so the
  // app runs on whichever key is configured.
  const primary = (process.env.LLM_PROVIDER || 'cerebras').toLowerCase();
  const order = [primary, ...Object.keys(PROVIDERS).filter((p) => p !== primary)]
    .filter((name) => PROVIDERS[name] && process.env[PROVIDERS[name].keyEnv]);

  if (order.length === 0) {
    res.status(500).json({ error: 'No LLM provider API key configured. Set CEREBRAS_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY.' });
    return;
  }

  const prompt = buildPrompt(topic.trim());
  const errors = [];

  for (const name of order) {
    const provider = PROVIDERS[name];
    const apiKey = process.env[provider.keyEnv];
    const model = process.env[provider.modelEnv] || provider.defaultModel;
    try {
      const raw = provider.kind === 'gemini'
        ? await callGemini(model, apiKey, prompt)
        : await callOpenAICompatible(provider, model, apiKey, prompt);
      const clean = raw.replace(/```json|```/g, '').trim();
      const guide = JSON.parse(clean);
      res.status(200).json({ guide, category, provider: name, model });
      return;
    } catch (err) {
      errors.push(`${name}: ${err.message || 'request failed'}`);
    }
  }

  res.status(502).json({ error: `All LLM providers failed — ${errors.join(' | ')}` });
}
