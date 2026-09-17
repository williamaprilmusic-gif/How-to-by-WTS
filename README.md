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

Generating new guides calls `api/generate-guide.js`, a Vercel serverless function that talks to the Gemini API server-side so the key never reaches the browser. It requires a `GEMINI_API_KEY` environment variable:

- Local dev: add it to `.env.local`
- Production: `vercel env add GEMINI_API_KEY production` (or the Vercel dashboard)

Without it, everything else in the app works — browsing, filters, bookmarks, progress tracking — except generating new guides.

### Regenerating starter guides

The default guides bundled with the app (`src/lib/starterGuides.js`) were produced by `scripts/generate-starter-guides.mjs`, which reads `GEMINI_API_KEY` from `.env.local` and generates a couple of guides per category. Re-run it any time to refresh that starter set:

```bash
node scripts/generate-starter-guides.mjs
```

## Deployment

Deployed via [Vercel](https://vercel.com/william-april/how-to-by-wts), linked to the `main` branch of this [GitHub repository](https://github.com/williamaprilmusic-gif/How-to-by-WTS).
