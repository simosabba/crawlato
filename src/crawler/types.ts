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
  screenshotBaseFolder: string
  elementsToRemove?: string[]
}

export interface CrawlJobInput {
  url: string
  device: Device
}

export interface CrawlJobOutput<TOutput> {
  data: TOutput
  links: string[]
}

export type CrawlJobStatus = "pending" | "running" | "completed" | "faulted"
export type JobId = string

export interface CrawlJobQueueItem<TOutput> {
  id: JobId
  input: CrawlJobInput
  status: CrawlJobStatus
  output?: CrawlJobOutput<TOutput>
}

export interface DefaultOutput {
  screenshotPath: string
}

export interface WebsitePage {
  url: string
  title: string
  description: string
}

export class WebsiteGraph extends ExtendedGraph<WebsitePage> {
  constructor() {
    super({
      idSelector: (x) => x.url.toLowerCase(),
      caseVariantId: false,
    })
  }
}
