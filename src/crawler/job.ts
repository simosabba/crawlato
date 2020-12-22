import puppeteer from "puppeteer"
import path from "path"
import { generateRunId } from "../utils/uids"
import { processCrawlJob } from "./actions"
import { CrawlQueue } from "./queue"
import {
  CrawlJobQueueItem,
  CrawlSettings,
  DefaultOutput,
  WebsiteGraph,
} from "./types"

type JotInstance = CrawlJobQueueItem<DefaultOutput>

export class CrawlJob {
  private readonly runId = generateRunId()
  private readonly queue = new CrawlQueue<DefaultOutput>()
  private readonly graph = new WebsiteGraph()

  constructor(private readonly settings: CrawlSettings) {}

  run = async () => {
    console.log("CRAWL STARTED")
    this.getStartUrls().forEach((url) => this.submitUrl(url))
    const browser = await puppeteer.launch({
      headless: process.env.HEADLESS === "true",
    })
    try {
      while (true) {
        const nextJob = this.nextJob()
        if (!nextJob) {
          break
        }
        await this.processJob(browser, nextJob)
      }
    } finally {
      await browser.close()
    }
    console.log("CRAWL COMPLETED")
  }

  private processJob = async (browser: puppeteer.Browser, job: JotInstance) => {
    console.log(`Processing url ${job.input.url}`)
    this.queue.updateJob(job.id, "running")

    const result = await processCrawlJob(browser, job.input, {
      screenshotFolder: path.join(
        this.settings.screenshotBaseFolder,
        this.runId
      ),
      elementsToRemove: this.settings.elementsToRemove ?? [],
    })

    this.queue.updateJob(job.id, "completed", result)
  }

  private nextJob = () => this.queue.findJob("pending")

  private getStartUrls = () => {
    if (this.settings.urlType === "root") {
      return [this.settings.url]
    }

    // TODO: handle sitemap
    return []
  }

  private submitUrl = (url: string) =>
    this.settings.devices.forEach((device) =>
      this.queue.submitJob({
        url,
        device,
      })
    )
}
