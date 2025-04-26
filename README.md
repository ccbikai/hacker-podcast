# Hacker Podcast

An AI-driven Hacker Podcast project that automatically fetches top Hacker News articles daily, generates summaries using AI, and converts them into podcast episodes.

Preview: <https://hacker-podcast.agi.li>

Subscribe: <https://hacker-podcast.agi.li/rss.xml>

![hacker-podcast](https://socialify.git.ci/ccbikai/hacker-podcast/image?description=1&forks=1&name=1&owner=1&pattern=Circuit+Board&stargazers=1&theme=Auto)

---

## Key Features

- 🤖 Automatically fetches top Hacker News articles daily
- 🎯 Uses AI to intelligently summarize article content and comments
- 🎙️ Generates audio narration using TTS (Edge TTS / Minimax Audio)
- 📱 Listen via web or podcast apps
- 🔄 Updates daily automatically
- 📝 Provides article summaries and full transcripts

## Tech Stack

- Next.js application framework
- Cloudflare Workers for deployment and runtime environment
- TTS (Text-to-Speech) synthesis
- OpenAI API for content generation
- Tailwind CSS for styling
- shadcn-ui component library

## Workflow

1. Fetches top Hacker News articles periodically.
2. Generates summaries and scripts using AI.
3. Converts text to audio using TTS. Thanks to [Minimax Audio](https://minimax.io/) for sponsoring the TTS service.
4. Stores data in Cloudflare R2 and KV.
5. Provides access via RSS feed and web interface.

## Local Development

> The project consists of a Worker and a Web application. The Worker is responsible for fetching data and processing audio, utilizing Cloudflare R2, KV, Workers AI, and Browser Rendering.
> The Web application displays data and provides the RSS feed. It's built with Next.js and uses the OpenNext Cloudflare adapter.

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

Create `.dev.vars` for the web app and `worker/.dev.vars` for the worker:

```bash
# .dev.vars
NEXTJS_ENV=development
NEXT_STATIC_HOST=http://localhost:3000/static

# worker/.dev.vars
WORKER_ENV=development
HACKER_PODCAST_WORKER_URL=http://localhost:8787 # Your worker URL for local dev
HACKER_PODCAST_R2_BUCKET_URL= # Local R2 bucket URL (if using Miniflare or similar)
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1 # Optional: Change if using a proxy
OPENAI_MODEL=gpt-4-turbo # Or your preferred model
```

3. Start the development servers:

```bash
# Start the Worker (fetches data, processes audio)
pnpm dev:worker
# To manually trigger the worker: curl -X POST http://localhost:8787

# Start the Web app (frontend)
pnpm dev
```

> **Notes:**
>
> - When running the worker locally, Edge TTS audio conversion might stall. It's recommended to comment out this part during debugging if issues arise.
> - Audio merging relies on Cloudflare's Browser Rendering API, which is not available locally. Remote debugging or testing is required for this feature. You can potentially use `pnpm run test` for related tests (check test setup).

## Deployment

This project is deployed using Cloudflare Workers:

1. Create an R2 bucket. After binding a custom domain, update the `NEXT_STATIC_HOST` and `HACKER_PODCAST_R2_BUCKET_URL` variables in your Cloudflare dashboard secrets and potentially `wrangler.toml`.
2. Create a KV namespace.
3. Update the KV namespace ID and R2 bucket name in `wrangler.toml`.
4. Configure environment variables and secrets using the `wrangler` CLI:

```bash
# Set secrets for the Worker
pnpx wrangler secret put --cwd worker HACKER_PODCAST_WORKER_URL # Use your deployed worker URL
pnpx wrangler secret put --cwd worker HACKER_PODCAST_R2_BUCKET_URL # Use your R2 public bucket URL
pnpx wrangler secret put --cwd worker OPENAI_API_KEY
pnpx wrangler secret put --cwd worker OPENAI_BASE_URL # Optional
pnpx wrangler secret put --cwd worker OPENAI_MODEL # Optional

# Set secrets for the Web application (Next.js on Cloudflare Pages/Workers)
pnpx wrangler secret put NEXTJS_ENV
# Ensure NEXT_STATIC_HOST is set in the Pages deployment settings or via wrangler secret put if deploying manually
pnpx wrangler secret put NEXT_STATIC_HOST # Use your R2 public bucket URL (same as HACKER_PODCAST_R2_BUCKET_URL)
```

Deploy the applications:

```bash
# Make sure to uncomment the workflows configuration in wrangler.toml if needed
pnpm deploy:worker
pnpm deploy # Deploys the Next.js app via OpenNext adapter
```

## Contributing

Issues and Pull Requests are welcome!

## Sponsorship

- **[MiniMax](https://minimax.io/)**: Intelligence with everyone

1. [Follow me on 𝕏](https://404.li/x)
2. [Sponsor me on GitHub](https://github.com/sponsors/ccbikai)

## Disclaimer

This project is not affiliated with Hacker News or Y Combinator. "Hacker News" is a registered trademark of Y Combinator.
