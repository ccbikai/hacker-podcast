import type { MetadataRoute } from 'next'
import { keepDays } from '@/config'
import { getPastDays } from '@/lib/utils'
import { headers } from 'next/headers'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const posts = getPastDays(keepDays).map((day) => {
    return {
      date: day,
    }
  })

  return [
    {
      url: `https://${host}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map(post => ({
      url: `https://${host}/post/${post.date}`,
      lastModified: new Date(post.date),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
