import { shouldProcessUrl } from "../filters"
import { CrawlQueue } from "../queue"
import { CrawlSettings, WebsitePageInput } from "../types"

const device = {
  id: "device",
  width: 100,
  height: 500,
}
const settings = (override?: any): CrawlSettings => ({
  depth: 2,
  devices: [device],
  screenshotBaseFolder: ".",
  timeoutSeconds: 30,
  allowedDomains: ["webpunks.it"],
  url: "https://webpunks.it",
  urlType: "root",
  ...override,
})

const queue = (...currentJobs: WebsitePageInput[]) => {
  const instance = new CrawlQueue<any>()
  currentJobs.forEach((x) => instance.submitJob(x))
  return instance
}

test("Test invalid scheme", () => {
  expect(
    shouldProcessUrl("mailto:hi@webpunks.it", device, settings(), queue())
  ).toBeFalsy()
})

test("Test invalid domain", () => {
  expect(
    shouldProcessUrl("https://vattelappesca.it", device, settings(), queue())
  ).toBeFalsy()
})

test("Test already in queue", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta",
      device,
      settings(),
      queue({
        url: "https://webpunks.it/paginetta",
        device,
      })
    )
  ).toBeFalsy()
})

test("Test queued for another device", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta",
      device,
      settings(),
      queue({
        url: "https://webpunks.it/paginetta",
        device: {
          id: "other-device",
          width: 200,
          height: 300,
        },
      })
    )
  ).toBeTruthy()
})

test("Test new url", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta",
      device,
      settings(),
      queue()
    )
  ).toBeTruthy()
})

test("Test excluded url exact", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta/",
      device,
      settings({
        excludedUrls: ["https://webpunks.it/paginetta/"],
      }),
      queue()
    )
  ).toBeFalsy()
})

test("Test excluded url nested", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta/subpaginetta",
      device,
      settings({
        excludedUrls: ["https://webpunks.it/paginetta/"],
      }),
      queue()
    )
  ).toBeFalsy()
})

test("Test hash duplicate", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta#anchor1",
      device,
      settings(),
      queue({
        url: "https://webpunks.it/paginetta#anchor2",
        device,
      })
    )
  ).toBeFalsy()
})

test("Test duplicate exact in queue", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta/",
      device,
      settings({
        deduplicateUrls: ["https://webpunks.it/paginetta/"],
      }),
      queue({
        url: "https://webpunks.it/paginetta/",
        device,
      })
    )
  ).toBeFalsy()
})

test("Test duplicate nested in queue", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta/subpaginetta",
      device,
      settings({
        deduplicateUrls: ["https://webpunks.it/paginetta/"],
      }),
      queue({
        url: "https://webpunks.it/paginetta/other",
        device,
      })
    )
  ).toBeFalsy()
})

test("Test duplicate exact not in queue", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta/",
      device,
      settings({
        deduplicateUrls: ["https://webpunks.it/paginetta/"],
      }),
      queue()
    )
  ).toBeTruthy()
})

test("Test duplicate exact not in queue", () => {
  expect(
    shouldProcessUrl(
      "https://webpunks.it/paginetta/subpaginetta",
      device,
      settings({
        deduplicateUrls: ["https://webpunks.it/paginetta/"],
      }),
      queue()
    )
  ).toBeTruthy()
})
