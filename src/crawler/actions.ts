import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import {
  getElementsAttribute,
  navigateTo,
  removeElements,
  scrollToBottom,
} from "../browsing/commands"
import { CrawlJobInput, CrawlJobOutput, DefaultOutput, Device } from "./types"

export interface ProcessCrawlJobOptions {
  screenshotFolder: string
  elementsToRemove: string[]
}

export const processCrawlJob = async (
  browser: puppeteer.Browser,
  input: CrawlJobInput,
  options: ProcessCrawlJobOptions
): Promise<CrawlJobOutput<DefaultOutput>> => {
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
      data: {
        screenshotPath,
      },
      links: (await extractLinks(page)) ?? [],
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

const extractLinks = (page: puppeteer.Page) =>
  getElementsAttribute(page, "a", "href")

const ensureFolder = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {
      recursive: true,
    })
  }
}

const deviceFolder = (device: Device) =>
  `${device.id}_${device.width}x${device.height}`

const pageFilename = (input: CrawlJobInput) =>
  `${input.device.id}_${cleanUrl(input.url)}.png`

const cleanUrl = (url: string) =>
  replaceAll(replaceAll(replaceAll(url, "/", "-"), ":", ""), ".", "_")

const replaceAll = (value: string, from: string, to: string) =>
  value.split(from).join(to)
