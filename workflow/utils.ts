import puppeteer from '@cloudflare/puppeteer'
import * as cheerio from 'cheerio'

export async function getHackerNewsTopStories(today: string, JINA_KEY?: string) {
  const url = `https://news.ycombinator.com/front?day=${today}`
  const headers: HeadersInit = {
    'X-Retain-Images': 'none',
    'X-Return-Format': 'html',
  }

  if (JINA_KEY) {
    headers.Authorization = `Bearer ${JINA_KEY}`
  }
  console.info(`get top stories ${today} from ${url}`)
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers,
  })
  console.info(`get top stories result: ${response.statusText}`)
  const text = await response.text()

  const $ = cheerio.load(text)
  const stories: Story[] = $('.athing.submission').map((i, el) => ({
    id: $(el).attr('id'),
    title: $(el).find('.titleline > a').text(),
    url: $(el).find('.titleline > a').attr('href'),
    hackerNewsUrl: `https://news.ycombinator.com/item?id=${$(el).attr('id')}`,
  })).get()

  return stories.filter(story => story.id && story.url)
}

export async function getHackerNewsStory(story: Story, maxTokens: number, JINA_KEY?: string) {
  const headers: HeadersInit = {
    'X-Retain-Images': 'none',
  }

  if (JINA_KEY) {
    headers.Authorization = `Bearer ${JINA_KEY}`
  }

  const [article, comments] = await Promise.all([
    fetch(`https://r.jina.ai/${story.url}`, {
      headers,
    }).then((res) => {
      if (res.ok) {
        return res.text()
      }
      else {
        console.error(`get story failed: ${res.statusText}  ${story.url}`)
        return ''
      }
    }),
    fetch(`https://r.jina.ai/https://news.ycombinator.com/item?id=${story.id}`, {
      headers: {
        ...headers,
        'X-Remove-Selector': '.navs',
        'X-Target-Selector': '#pagespace + tr',
      },
    }).then((res) => {
      if (res.ok) {
        return res.text()
      }
      else {
        console.error(`get story comments failed: ${res.statusText} https://news.ycombinator.com/item?id=${story.id}`)
        return ''
      }
    }),
  ])
  return [
    story.title
      ? `
<title>
${story.title}
</title>
`
      : '',
    article
      ? `
<article>
${article.substring(0, maxTokens * 4)}
</article>
`
      : '',
    comments
      ? `
<comments>
${comments.substring(0, maxTokens * 4)}
</comments>
`
      : '',
  ].filter(Boolean).join('\n\n---\n\n')
}

export async function concatAudioFiles(audioFiles: string[], BROWSER: Fetcher, { workerUrl }: { workerUrl: string }) {
  const browser = await puppeteer.launch(BROWSER)
  const page = await browser.newPage()
  await page.goto(`${workerUrl}/audio`)

  console.info('start concat audio files', audioFiles)
  const fileUrl = await page.evaluate(async (audioFiles) => {
    // @ts-expect-error Browser's object
    const blob = await concatAudioFilesOnBrowser(audioFiles)

    const result = new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    return await result
  }, audioFiles) as string

  console.info('concat audio files result', fileUrl.substring(0, 100))

  await browser.close()

  const response = await fetch(fileUrl)
  return await response.blob()
}
