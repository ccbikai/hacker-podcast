import { concatAudioFiles } from '@/workflow/utils'

interface Env {
  HACKER_PODCAST_WORKER_URL: string
  BROWSER: Fetcher
}

export default {
  async fetch(request: Request, env: Env) {
    if (!request.url.includes('/tests')) {
      return new Response('not allowed')
    }
    const audioFiles = Array.from(
      { length: 10 },
      (_, i) => `https://hacker-podcast-static.agi.li/2025/04/25/production/hacker-podcast-2025-04-25.mp3-${i}.mp3?t=${Date.now()}`,
    )
    const audio = await concatAudioFiles(audioFiles, env.BROWSER, { workerUrl: env.HACKER_PODCAST_WORKER_URL })
    return new Response(audio)
  },
}
