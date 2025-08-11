import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'

export default defineCloudflareConfig({
  enableCacheInterception: true,
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
    shouldLazilyUpdateOnCacheHit: true,
  }),
  queue: queueCache(doQueue, {
    regionalCacheTtlSec: 5,
    waitForQueueAck: true,
  }),
  tagCache: doShardedTagCache({
    baseShardSize: 4,
    regionalCache: true,
  }),
  cachePurge: purgeCache({
    type: 'durableObject',
  }),
})
