import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import {
  getElementsAttribute,
  navigateTo,
  removeElements,
  scrollToBottom,
} from "../browsing/commands"
import {
  WebsitePageInput,
  CrawlJobOutput,
  WebsitePage,
  Device,
  CrawlSettings,
} from "./types"
import { replaceMap } from "../utils/strings"

export interface ProcessCrawlJobOptions {
  screenshotFolder: string
  referrer?: WebsitePageInput
  settings: CrawlSettings
}

const takeScreenshot = async (
  input: WebsitePageInput,
  options: ProcessCrawlJobOptions,
  page: puppeteer.Page) => {
  const targetScreenshotFolder = path.join(
    options.screenshotFolder,
    deviceFolder(input.device)
  )
  ensureFolder(targetScreenshotFolder)
  const screenshotPath = path.join(targetScreenshotFolder, pageFilename(input))
  await page.screenshot({
    fullPage: true,
    path: screenshotPath,
  })

  return {
    path: screenshotPath
  }
}

const saveFiles = async (
  input: WebsitePageInput,
  options: ProcessCrawlJobOptions,
  page: puppeteer.Page) => {

  return {
    path: ""
  }
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

    await navigateTo(page, input.url, options.settings.timeoutSeconds)

    if (options.settings.scrollPage) {
      await scrollToBottom(page)
    }

    if (options.settings.elementsToRemove) {
      await removeExtraElements(page, options.settings.elementsToRemove)
    }

    const screenshot = await takeScreenshot(input, options, page)
    const files = await saveFiles(input, options, page)

    return {
      input,
      data: {
        url: input.url,
        title: await page.title(),
        description: "", // TODO: get description
        screenshotPath: screenshot.path,
        filesPath: files.path
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
