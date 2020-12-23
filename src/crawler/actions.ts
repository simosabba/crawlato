import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import {
  getElementsAttribute,
  navigateTo,
  removeElements,
  scrollToBottom,
} from "../browsing/commands"
import { WebsitePageInput, CrawlJobOutput, WebsitePage, Device } from "./types"
import { replaceMap } from "../utils/strings"

export interface ProcessCrawlJobOptions {
  screenshotFolder: string
  elementsToRemove: string[]
  referrer?: WebsitePageInput
}

export const processCrawlJob = async (
  browser: puppeteer.Browser,
  input: WebsitePageInput,
  options: ProcessCrawlJobOptions
): Promise<CrawlJobOutput<WebsitePage>> => {
  const page = await browser.newPage()

  try {
    await page.setViewport({
      height: input.device.height,
      width: input.device.width,
    })

    await navigateTo(page, input.url)

    const targetFolder = path.join(
      options.screenshotFolder,
      deviceFolder(input.device)
    )

    ensureFolder(targetFolder)
    const screenshotPath = path.join(targetFolder, pageFilename(input))

    await scrollToBottom(page)
    await removeExtraElements(page, options.elementsToRemove)

    await page.screenshot({
      fullPage: true,
      path: screenshotPath,
    })

    return {
      input,
      data: {
        url: input.url,
        title: await page.title(),
        description: "", // TODO: get description
        screenshotPath,
      },
      links: (await extractLinks(page)) ?? [],
      referrer: options.referrer,
    }
  } finally {
    await page.close()
  }
}

const removeExtraElements = async (
  page: puppeteer.Page,
  selectors: string[]
) => {
  selectors.forEach(async (selector) => await removeElements(page, selector))
}

const extractLinks = async (page: puppeteer.Page) =>
  (await getElementsAttribute(page, "a", "href"))
    ?.map((x) => x.trim())
    .filter((x) => x)

const ensureFolder = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {
      recursive: true,
    })
  }
}

const deviceFolder = (device: Device) =>
  `${device.id}_${device.width}x${device.height}`

const pageFilename = (input: WebsitePageInput) =>
  `${input.device.id}_${cleanUrl(input.url)}.png`

const cleanUrl = (url: string) =>
  replaceMap(url, [
    { from: ["/", "?"], to: "-" },
    { from: [":"], to: "" },
    { from: ["."], to: "_" },
  ])
