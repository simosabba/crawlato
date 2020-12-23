import { ExtendedGraph } from "../graph/extended-graph"

export interface Device {
  id: string
  height: number
  width: number
}

export type UrlType = "root" | "sitemap"

export interface CrawlSettings {
  url: string
  urlType: UrlType
  depth: number
  devices: Device[]
  allowedDomains: string[]
  screenshotBaseFolder: string
  elementsToRemove?: string[]
  deduplicateUrls?: string[]
  scrollPage?: boolean
}

export interface WebsitePageInput {
  url: string
  device: Device
}

export interface CrawlJobOutput<TOutput> {
  input: WebsitePageInput
  referrer?: WebsitePageInput
  data: TOutput
  links: string[]
}

export type CrawlJobStatus = "pending" | "running" | "completed" | "faulted"
export type JobId = string

export interface CrawlJobQueueItem<TOutput> {
  id: JobId
  input: WebsitePageInput
  referrer?: WebsitePageInput
  status: CrawlJobStatus
  output?: CrawlJobOutput<TOutput>
}

export interface WebsitePage {
  url: string
  title: string
  description: string
  screenshotPath: string
}
