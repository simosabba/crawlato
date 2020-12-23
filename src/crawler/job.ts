import puppeteer from "puppeteer"
import path from "path"
import { generateRunId } from "../utils/uids"
import { processCrawlJob } from "./actions"
import { CrawlQueue } from "./queue"
import {
  CrawlJobOutput,
  CrawlJobQueueItem,
  CrawlSettings,
  WebsitePage,
  WebsitePageInput,
} from "./types"
import { WebsiteGraph } from "./site-graph"
import { isDuplicatedUrl, isValidUrl } from "./filters"

type JotInstance = CrawlJobQueueItem<WebsitePage>
type JobResult = CrawlJobOutput<WebsitePage>

export class CrawlJob {
  private readonly runId = generateRunId()
  private readonly queue = new CrawlQueue<WebsitePage>()
  private readonly graph = new WebsiteGraph()

  constructor(private readonly settings: CrawlSettings) {}

  run = async () => {
    console.log("CRAWL STARTED")
    this.getStartUrls().forEach((url) => this.submitRootUrl(url))
    const browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== "false",
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
        this.addToGraph(page)

        if (this.graph.getDepth(page.input) < this.settings.depth) {
          page.links.forEach((x) => this.submitLinkToQueue(x, page))
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
    if (!isValidUrl(url, this.settings)) {
      return
    }

    if (isDuplicatedUrl(url, source.input.device, this.settings, this.queue)) {
      return
    }
    if (
      this.queue.containsJob({
        url,
        device: source.input.device,
      })
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

  private addToGraph = (page: JobResult) => {
    this.graph.setPageData(page.input, page.data)
    page.links.forEach((x) => this.addPageLinkToGraph(page.input, x))
  }

  private addPageLinkToGraph = (page: WebsitePageInput, link: string) => {
    const linkedPage = {
      device: page.device,
      url: link,
    }
    if (!this.graph.containsPage(linkedPage)) {
      this.graph.addPage({
        page: linkedPage,
      })
    }
    if (!this.graph.existsLink(page, linkedPage)) {
      this.graph.addPageLink(page, linkedPage)
    }
  }

  private processPage = async (
    browser: puppeteer.Browser,
    job: JotInstance
  ) => {
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
  }

  private nextJob = () => this.queue.findJob("pending")

  private getStartUrls = () => {
    if (this.settings.urlType === "root") {
      return [this.settings.url]
    }

    // TODO: handle sitemap
    return []
  }

  private submitRootUrl = (url: string) =>
    this.getRootPages(url).forEach(this.submitRootPage)

  private submitRootPage = (page: WebsitePageInput) => {
    this.queue.submitJob(page)
    this.graph.addPage(
      {
        page,
      },
      true
    )
  }

  private getRootPages = (url: string): WebsitePageInput[] =>
    this.settings.devices.map((x) => ({
      device: x,
      url,
    }))
}
