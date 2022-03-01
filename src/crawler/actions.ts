import puppeteer from "puppeteer"
import fs, { writeFileSync } from "fs"
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
import { replaceAll, replaceAllChars, replaceMap } from "../utils/strings"
import { getExtension, getRelativePath } from "../utils/urls"
import { newUuid } from "../utils/uids"
import { getFolder, joinPath } from "../utils/paths"

const MAX_PATH_LENGTH = 200

export interface ProcessCrawlJobOptions {
  screenshotFolder: string
  filesFolder: string
  referrer?: WebsitePageInput
  settings: CrawlSettings
}

const takeScreenshot = async (
  input: WebsitePageInput,
  options: ProcessCrawlJobOptions,
  page: puppeteer.Page) => {
  const targetScreenshotFolder = joinPath(
    options.screenshotFolder,
    deviceFolder(input.device)
  )
  ensureFolder(targetScreenshotFolder)
  const screenshotPath = joinPath(targetScreenshotFolder, pageFilename(input))
  await page.screenshot({
    fullPage: true,
    path: screenshotPath,
  })

  return {
    path: screenshotPath
  }
}

const savePageFile = async (
  input: WebsitePageInput,
  options: ProcessCrawlJobOptions,
  filename: string,
  content: string | Buffer) => {
  const targetHtmlFolder = joinPath(
    options.filesFolder,
    pageFolder(input)
  )
  const filePath = joinPath(targetHtmlFolder, filename)
  const folder = getFolder(filePath)
  ensureFolder(folder)
  writeFileSync(filePath, content)
  return {
    folder: targetHtmlFolder
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

    page.on("response", async response => {
      const data = await response.buffer()
      const text = await response.text()
      await savePageFile(input, options, getFilePath(response.request().url()), data ?? text)
    })

    await navigateTo(page, input.url, options.settings.timeoutSeconds)

    if (options.settings.scrollPage) {
      await scrollToBottom(page)
    }

    if (options.settings.elementsToRemove) {
      await removeExtraElements(page, options.settings.elementsToRemove)
    }

    const screenshot = await takeScreenshot(input, options, page)

    const htmlDump = await savePageFile(input, options, "index.html", await page.content())

    return {
      input,
      data: {
        url: input.url,
        title: await page.title(),
        description: "", // TODO: get description
        screenshotPath: screenshot.path,
        filesPath: htmlDump.folder
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


const cleanUrl = (url: string) =>
  replaceMap(url, [
    { from: ["/", "?"], to: "-" },
    { from: [":"], to: "" },
    { from: ["."], to: "_" },
  ])

const pageFolder = (input: WebsitePageInput) => joinPath(deviceFolder(input.device), cleanUrl(input.url))

const pageFilename = (input: WebsitePageInput) =>
  `${input.device.id}_${cleanUrl(input.url)}.png`

const getFilePath = (url: string) =>  {
  return `${newUuid()}.${getExtension(url)}`
  // const relativePath = getRelativePath(url)
  // const p = replaceAll(relativePath, "//", "/")
  // if (p.length > MAX_PATH_LENGTH) {
  //   return `${newUuid()}_${getExtension(url)}`
  // }
  // return relativePath
}
