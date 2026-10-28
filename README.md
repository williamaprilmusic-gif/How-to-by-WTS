# How To — by WTS

A how-to guide browser: filter by category and difficulty, bookmark guides, track step-by-step progress, and generate new guides with AI. Built with React, Vite, and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## AI Guide Generator

Generating new guides calls `api/generate-guide.js`, a Vercel serverless function that talks to an LLM server-side so no key ever reaches the browser. It supports three providers and picks one based on which API keys are present:

| Provider | API key env | Default model | Model override env |
|----------|-------------|---------------|--------------------|
| Cerebras (default) | `CEREBRAS_API_KEY` | `llama-3.3-70b` | `CEREBRAS_MODEL` |
| Groq | `GROQ_API_KEY` | `llama-3.3-70b-versatile` | `GROQ_MODEL` |
| Gemini | `GEMINI_API_KEY` | `gemini-3.8-flash` | `GEMINI_MODEL` |

`LLM_PROVIDER` selects the primary provider (`cerebras`, `groq`, or `gemini`; defaults to `cerebras`). Any provider whose key is missing is skipped, and if the primary fails the function automatically falls back to the others that do have a key — so the app keeps generating as long as at least one key is set.

- Local dev: add the key(s) to `.env.local`
- Production: `vercel env add CEREBRAS_API_KEY production` (or the Vercel dashboard)

Get free keys at [cloud.cerebras.ai](https://cloud.cerebras.ai), [console.groq.com](https://console.groq.com), or [aistudio.google.com](https://aistudio.google.com).

Without any key, everything else in the app works — browsing, filters, bookmarks, progress tracking — except generating new guides.

### Regenerating starter guides

The default guides bundled with the app (`src/lib/starterGuides.js`) were produced by `scripts/generate-starter-guides.mjs`, which reads `GEMINI_API_KEY` from `.env.local` and generates a couple of guides per category. Re-run it any time to refresh that starter set:

```bash
node scripts/generate-starter-guides.mjs
```

## Deployment

Deployed via [Vercel](https://vercel.com/william-april/how-to-by-wts), linked to the `main` branch of this [GitHub repository](https://github.com/williamaprilmusic-gif/How-to-by-WTS).
