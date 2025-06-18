import process from 'node:process'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import markdownit from 'markdown-it'
import { NextResponse } from 'next/server'
import { Podcast } from 'podcast'
import { podcastDescription, podcastTitle } from '@/config'
import { getPastDays } from '@/lib/utils'

const md = markdownit()

export const revalidate = 3600

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  const feed = new Podcast({
    title: podcastTitle,
    description: podcastDescription,
    feedUrl: `${baseUrl}/rss.xml`,
    siteUrl: baseUrl,
    imageUrl: `${baseUrl}/logo.jpg`,
    language: 'zh-CN',
    pubDate: new Date(),
    ttl: 60,
    generator: podcastTitle,
    author: podcastTitle,
    categories: ['technology', 'news'],
    itunesImage: `${baseUrl}/logo.jpg`,
    itunesCategory: [{ text: 'Technology' }, { text: 'News' }],
  })

  const { env } = await getCloudflareContext({ async: true })
  const runEnv = env.NEXTJS_ENV
  const pastDays = getPastDays(10)
  const posts = (await Promise.all(
    pastDays.map(async (day) => {
      const post = await env.HACKER_PODCAST_KV.get(`content:${runEnv}:hacker-podcast:${day}`, 'json')
      return post as unknown as Article
    }),
  )).filter(Boolean)

  for (const post of posts) {
    const audioInfo = await env.HACKER_PODCAST_R2.head(post.audio)

    const links = post.stories.map(s => `<li><a href="${s.hackerNewsUrl || s.url || ''}">${s.title || ''}</a></li>`).join('')
    const linkContent = `<p><b>References:</b></p><ul>${links}</ul>`
    const blogContentHtml = md.render(post.blogContent || '')
    const finalContent = `<div>${blogContentHtml}<hr/>${linkContent}</div>`

    feed.addItem({
      title: post.title || '',
      description: post.introContent || post.podcastContent || '',
      content: finalContent,
      url: `${baseUrl}/post/${post.date}`,
      guid: `${baseUrl}/post/${post.date}`,
      date: new Date(post.updatedAt || post.date),
      enclosure: {
        url: `${env.NEXT_STATIC_HOST}/${post.audio}?t=${post.updatedAt}`,
        type: 'audio/mpeg',
        size: audioInfo?.size,
      },
    })
  }

  const response = new NextResponse(feed.buildXml(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${revalidate}, s-maxage=${revalidate}`,
    },
  })

  return response
}
