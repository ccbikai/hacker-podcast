import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'

export default defineCloudflareConfig({
  enableCacheInterception: true,
  queue: doQueue,
  incrementalCache: r2IncrementalCache,
  tagCache: doShardedTagCache(),
  cachePurge: purgeCache({ type: 'durableObject' }),
})
