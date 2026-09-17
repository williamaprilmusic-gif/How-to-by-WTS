// One-off dev script: generates a small set of starter guides via the Gemini
// API and writes them to src/lib/starterGuides.js as bundled default content.
// Run with: node scripts/generate-starter-guides.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOPIC_SEEDS, CATEGORY_IMAGES, ALL_CATEGORIES } from '../src/lib/topics.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const text = fs.readFileSync(envPath, 'utf8');
  const match = text.match(/^GEMINI_API_KEY=(.*)$/m);
  if (!match) throw new Error('GEMINI_API_KEY not found in .env.local');
  return match[1].trim();
}

const TOPICS_PER_CATEGORY = 2;

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

async function callGemini(apiKey, topic, attempt = 1) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(topic) }] }],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  );

  if (response.status === 429 || response.status === 503) {
    if (attempt > 3) throw new Error(`Gave up on "${topic}" after ${attempt} attempts (rate limited)`);
    const body = await response.text();
    const retryMatch = body.match(/retryDelay":\s*"(\d+)s"/);
    const waitSeconds = retryMatch ? parseInt(retryMatch[1], 10) + 5 : 30 * attempt;
    console.log(`    rate limited, waiting ${waitSeconds}s (attempt ${attempt})...`);
    await new Promise((r) => setTimeout(r, waitSeconds * 1000));
    return callGemini(apiKey, topic, attempt + 1);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error for "${topic}": ${text}`);
  }

  return response;
}

async function generateOne(apiKey, topic, category, index) {
  const response = await callGemini(apiKey, topic);
  const data = await response.json();
  const raw = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  const clean = raw.replace(/```json|```/g, '').trim();
  const guide = JSON.parse(clean);

  if (!guide.title || !Array.isArray(guide.steps) || guide.steps.length === 0) {
    throw new Error(`Malformed guide for "${topic}"`);
  }

  const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Tech & Programming'];
  const heroIdx = index % imgs.length;
  const stepImgIdx = (heroIdx + 1) % imgs.length;

  guide.id = `starter-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
  guide.category = category;
  guide.slug = guide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  guide.heroImage = `https://images.unsplash.com/photo-${imgs[heroIdx]}?w=800&h=500&fit=crop&auto=format`;
  guide.popularity = 70 + Math.floor(Math.random() * 25);
  guide.published = new Date().toISOString().slice(0, 10);
  guide.author = {
    name: 'WTS Editorial',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
    role: 'How-To Expert',
  };
  guide.isFeatured = index === 0;

  if (guide.steps.length > 1) {
    guide.steps[1].image = `https://images.unsplash.com/photo-${imgs[stepImgIdx]}?w=700&h=400&fit=crop&auto=format`;
  }

  return guide;
}

async function loadExisting(outPath) {
  if (!fs.existsSync(outPath)) return [];
  const mod = await import(`${pathToFileURL(outPath)}?t=${Date.now()}`);
  return mod.STARTER_GUIDES || [];
}

function pathToFileURL(p) {
  return new URL(`file:///${p.replace(/\\/g, '/')}`);
}

async function main() {
  const apiKey = loadEnvLocal();
  const outPath = path.join(root, 'src', 'lib', 'starterGuides.js');
  const guides = await loadExisting(outPath);
  const coveredCategories = new Set(guides.map((g) => g.category));
  const missingCategories = ALL_CATEGORIES.filter((c) => !coveredCategories.has(c));

  console.log(`Already have guides for: ${[...coveredCategories].join(', ') || '(none)'}`);
  console.log(`Generating 1 guide each for: ${missingCategories.join(', ') || '(none)'}`);

  let globalIndex = guides.length;

  for (const category of missingCategories) {
    const topic = TOPIC_SEEDS[category][0];
    process.stdout.write(`Generating "${topic}" (${category})... `);
    try {
      const guide = await generateOne(apiKey, topic, category, globalIndex);
      guides.push(guide);
      globalIndex += 1;
      console.log('done');
      const banner = '// Auto-generated by scripts/generate-starter-guides.mjs — bundled default content\n// shown to every visitor before they generate or submit their own guides.\n';
      fs.writeFileSync(outPath, `${banner}export const STARTER_GUIDES = ${JSON.stringify(guides, null, 2)};\n`);
    } catch (err) {
      console.log('FAILED:', err.message);
    }
    await new Promise((r) => setTimeout(r, 20000));
  }

  console.log(`\nDone. ${guides.length} total starter guides.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
