import { getDomain } from "../utils/urls"
import { CrawlQueue } from "./queue"
import { CrawlSettings, Device } from "./types"

export const isValidUrl = (url: string, settings: CrawlSettings) =>
  url.includes("://") &&
  settings.allowedDomains.find((x) => x.toLowerCase() === getDomain(url))

export const isDuplicatedUrl = <TQueue>(
  url: string,
  device: Device,
  settings: CrawlSettings,
  queue: CrawlQueue<TQueue>
) => {
  const matchingPrefix = settings.deduplicateUrls?.find((x) =>
    url.toLowerCase().startsWith(x.toLowerCase())
  )
  if (!matchingPrefix) {
    return false
  }

  return queue.getJobByUrlPrefix(matchingPrefix, device) !== undefined
}
