import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'

export default defineCloudflareConfig({
  enableCacheInterception: true,
  queue: doQueue,
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),
  tagCache: doShardedTagCache(),
  cachePurge: purgeCache({ type: 'durableObject' }),
})
