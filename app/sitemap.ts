import type { MetadataRoute } from 'next'
import process from 'node:process'
import { keepDays } from '@/config'
import { getPastDays } from '@/lib/utils'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const posts = getPastDays(keepDays).map((day) => {
    return {
      date: day,
    }
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map(post => ({
      url: `${baseUrl}/post/${post.date}`,
      lastModified: new Date(post.date),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
