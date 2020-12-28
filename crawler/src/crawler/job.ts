import puppeteer from "puppeteer"
import path from "path"
import { generatePageId, generateRunId } from "../utils/uids"
import { processCrawlJob } from "./actions"
import { CrawlQueue } from "./queue"
import {
  CrawlJobOutput,
  CrawlJobQueueItem,
  CrawlSettings,
  Device,
  WebsitePage,
  WebsitePageInput,
} from "./types"
import { WebsiteGraph, WebsiteGraphNode, WebsiteGraphRepo } from "./site-graph"
import { shouldProcessUrl } from "./filters"

type JotInstance = CrawlJobQueueItem<WebsitePage>
type JobResult = CrawlJobOutput<WebsitePage>

export class CrawlJob {
  private readonly runId = generateRunId()
  private readonly queue = new CrawlQueue<WebsitePage>()
  private readonly graph = new WebsiteGraph()
  private readonly repo = new WebsiteGraphRepo()

  constructor(private readonly settings: CrawlSettings) {}

  run = async () => {
    console.log("CRAWL STARTED")
    await this.repo.ensureGraph()
    await Promise.all(this.getStartUrls().map((url) => this.submitRootUrl(url)))
    const browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== "false",
      executablePath: process.env.CHROME_BIN,
      args: process.env.CHROME_BIN ? ["--no-sandbox"] : undefined,
    })
    try {
      while (true) {
        const nextJob = this.nextJob()
        if (!nextJob) {
          break
        }
        console.log(
          `Processing ${nextJob.input.device.id} -> ${nextJob.input.url}`
        )

        const page = await this.processPage(browser, nextJob)
        if (page) {
          await this.addToGraph(page)

          if (this.graph.getDepth(page.input) < this.settings.depth) {
            page.links.forEach((x) => this.submitLinkToQueue(x, page))
          }
        }

        console.log(`QUEUED JOBS:`)
        console.log(
          this.queue
            .findJobs("pending")
            .map((x) => `${x.input.device.id} -> ${x.input.url}`)
            .join("\n")
        )
        console.log(`TOT -> ${this.queue.findJobs("pending").length}`)
      }
    } finally {
      await browser.close()
    }
    console.log("CRAWL COMPLETED")
  }

  private submitLinkToQueue = (url: string, source: JobResult) => {
    if (
      !shouldProcessUrl(url, source.input.device, this.settings, this.queue)
    ) {
      return
    }

    this.queue.submitJob(
      {
        url,
        device: source.input.device,
      },
      source.input
    )
  }

  private addToGraph = async (page: JobResult) => {
    this.graph.setPageData(page.input, page.data)
    for (const link of page.links) {
      await this.addPageLinkToGraph(page.input, link)
    }
  }

  private addPageLinkToGraph = async (page: WebsitePageInput, link: string) => {
    const linkedPage = await this.getOrCreatePageNode(link, page.device)
    if (!this.graph.existsLink(page, linkedPage.page)) {
      await this.createPageLink(
        this.graph.getPage(page) as WebsiteGraphNode,
        linkedPage
      )
    }
  }

  private processPage = async (
    browser: puppeteer.Browser,
    job: JotInstance
  ) => {
    try {
      this.queue.updateJob(job.id, "running")

      const result = await processCrawlJob(browser, job.input, {
        screenshotFolder: path.join(
          this.settings.screenshotBaseFolder,
          this.runId
        ),
        referrer: job.referrer,
        settings: this.settings,
      })

      this.queue.updateJob(job.id, "completed", result)
      return result
    } catch (e) {
      this.queue.updateJob(job.id, "faulted")
      console.error("Error processing page", job.input)
      console.error(e)
      return undefined
    }
  }

  private nextJob = () => this.queue.findJob("pending")

  private getStartUrls = () => {
    if (this.settings.urlType === "root") {
      return [this.settings.url]
    }

    // TODO: handle sitemap
    return []
  }

  private submitRootUrl = async (url: string) =>
    await Promise.all(this.getRootPages(url).map((x) => this.submitRootPage(x)))

  private submitRootPage = async (page: WebsitePageInput) => {
    this.queue.submitJob(page)
    await this.createPageNode({
      info: {
        isRoot: true,
        nodeId: generatePageId(),
        runId: this.runId,
      },
      page,
    })
  }

  private createPageLink = async (
    from: WebsiteGraphNode,
    to: WebsiteGraphNode
  ) => {
    this.graph.addPageLink(from.page, to.page)
    await this.repo.insertLink(from, to)
  }

  private getOrCreatePageNode = async (
    url: string,
    device: Device
  ): Promise<WebsiteGraphNode> => {
    const input = {
      device,
      url,
    }
    const page = this.graph.getPage(input)
    if (page) {
      return page
    }
    const node = {
      info: {
        isRoot: false,
        nodeId: generatePageId(),
        runId: this.runId,
      },
      page: input,
    }
    await this.createPageNode(node)
    return node
  }

  private createPageNode = async (page: WebsiteGraphNode) => {
    this.graph.addPage(page)
    await this.repo.insertPage(page)
  }

  private getRootPages = (url: string): WebsitePageInput[] =>
    this.settings.devices.map((x) => ({
      device: x,
      url,
    }))
}
