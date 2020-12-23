import puppeteer from "puppeteer"
import { cleanString } from "../utils/strings"

export const navigateTo = (
  page: puppeteer.Page,
  url: string,
  timeoutSeconds: number
) =>
  page.goto(url, { waitUntil: "networkidle0", timeout: timeoutSeconds * 1000 })

export interface ScrollBottomOptions {
  scrollDelay?: number
}

export const scrollToBottom = async (
  page: puppeteer.Page,
  options?: ScrollBottomOptions
) => {
  let position = 0
  const windowHeight = await getWindowHeight(page)
  const pageHeight = await getPageHeight(page)

  while (position < pageHeight) {
    position += windowHeight
    await scrollTo(page, position)
    if (options?.scrollDelay) {
      page.waitForTimeout(options.scrollDelay)
    }
  }
}

export const scrollTo = async (page: puppeteer.Page, height: number) =>
  await page.evaluate(`window.scrollTo(0,${height});`)

export const getWindowHeight = async (page: puppeteer.Page) =>
  (await page.evaluate("window.innerHeight")) as number

export const getPageHeight = async (page: puppeteer.Page) =>
  (await page.evaluate("document.body.scrollHeight")) as number

export const getElement = async (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string
) => await root.$(selector)

export const getElements = async (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string
) => await root.$$(selector)

export const getElementProperty = async (
  element: puppeteer.ElementHandle<unknown>,
  attribute: string
) => (await (await element?.getProperty(attribute))?.jsonValue()) as string

export const getElementAttribute = async (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string,
  attribute: string
): Promise<string | undefined> => {
  const element = await getElement(root, selector)
  return cleanString(
    (await (await element?.getProperty(attribute))?.jsonValue()) as string
  )
}

export const getElementText = (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string
): Promise<string | undefined> =>
  getElementAttribute(root, selector, "innerText")

export const getElementSrc = (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string
): Promise<string | undefined> => getElementAttribute(root, selector, "src")

export const getElementHref = (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string
): Promise<string | undefined> => getElementAttribute(root, selector, "href")

export const getElementsAttribute = async (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string,
  attribute: string
): Promise<string[] | undefined> => {
  const elements = await getElements(root, selector)
  return (await Promise.all(
    elements.map(async (x) =>
      cleanString(
        (await (await x.getProperty(attribute)).jsonValue()) as string
      )
    )
  )) as string[]
}

export const getElementsText = (
  root: puppeteer.FrameBase | puppeteer.ElementHandle<unknown>,
  selector: string
): Promise<string[] | undefined> =>
  getElementsAttribute(root, selector, "innerText")

export const removeElements = async (
  root: puppeteer.FrameBase,
  selector: string
) => {
  await root.evaluate(
    `document.querySelectorAll("${selector}").forEach(x => x.remove())`
  )
}
