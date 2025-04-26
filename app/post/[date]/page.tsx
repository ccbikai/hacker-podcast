import type { Metadata } from 'next'
import { ArticleCard } from '@/components/article-card'
import { podcastTitle } from '@/config'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { notFound } from 'next/navigation'

export const dynamicParams = true
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { env } = getCloudflareContext()
  const runEnv = env.NEXTJS_ENV
  const date = (await params).date

  const post = (await env.HACKER_PODCAST_KV.get(`content:${runEnv}:hacker-podcast:${date}`, 'json')) as unknown as Article

  if (!post) {
    return notFound()
  }

  const title = post.title
  const description = post.introContent || post.podcastContent?.slice(0, 200) || title
  const url = `${env.NEXT_STATIC_HOST}/post/${post.date}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: [podcastTitle],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ date: string }> }) {
  const { env } = getCloudflareContext()
  const runEnv = env.NEXTJS_ENV

  const date = (await params).date

  const post = (await env.HACKER_PODCAST_KV.get(`content:${runEnv}:hacker-podcast:${date}`, 'json')) as unknown as Article

  if (!post) {
    return notFound()
  }

  return (
    <ArticleCard
      key={post.date}
      article={post}
      staticHost={env.NEXT_STATIC_HOST}
      showFooter
    />
  )
}
