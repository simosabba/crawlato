import { getDomain } from "../utils/urls"
import { CrawlQueue } from "./queue"
import { CrawlSettings, Device } from "./types"

const hasValidDomain = (url: string, settings: CrawlSettings) =>
  url.includes("://") &&
  settings.allowedDomains.find((x) => x.toLowerCase() === getDomain(url))

const isExcludedUrl = (url: string, settings: CrawlSettings) =>
  settings.excludedUrls?.find((x) => x.match(new RegExp(url))) !== undefined

const isHashDuplicate = <TQueue>(
  url: string,
  device: Device,
  queue: CrawlQueue<TQueue>
) => {
  if (url.includes("#")) {
    const urlWithoutAnchor = url.split("#")[0]
    if (
      queue.getJobByUrlPattern(`${urlWithoutAnchor}#`, device) !== undefined
    ) {
      return true
    }
  }

  return false
}

const isDuplcatePattern = <TQueue>(
  url: string,
  device: Device,
  settings: CrawlSettings,
  queue: CrawlQueue<TQueue>
) => {
  const matchingPattern = settings.deduplicateUrls?.find((x) =>
    url.toLowerCase().match(new RegExp(x.toLowerCase()))
  )
  if (!matchingPattern) {
    return false
  }

  return queue.getJobByUrlPattern(matchingPattern, device) !== undefined
}

const isAlreadyInsideQueue = <TQueue>(
  url: string,
  device: Device,
  queue: CrawlQueue<TQueue>
) =>
  queue.containsJob({
    url,
    device,
  })

export const shouldProcessUrl = <TQueue>(
  url: string,
  device: Device,
  settings: CrawlSettings,
  queue: CrawlQueue<TQueue>
) =>
  hasValidDomain(url, settings) &&
  !isAlreadyInsideQueue(url, device, queue) &&
  !isExcludedUrl(url, settings) &&
  !isHashDuplicate(url, device, queue) &&
  !isDuplcatePattern(url, device, settings, queue)
