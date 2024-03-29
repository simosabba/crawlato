import yaml from "js-yaml"
import fs from "fs"
import { CrawlSettings, Device } from "./types"
import { getDomain } from "../utils/urls"

const defaultDevices: Device[] = [
  {
    id: "iphone6",
    width: 375,
    height: 667,
  },
  {
    id: "laptop",
    width: 1680,
    height: 1050,
  },
]

export interface SettingsInput {
  url?: string
  depth?: number
  screenshotFolder?: string
  filesFolder?: string
  devices?: Device[]
  elementsToRemove?: string[]
  allowedDomains?: string[]
  deduplicateUrls?: string[]
  excludedUrls?: string[]
  scrollPage?: boolean
  timeoutSeconds?: number
}

export const buildSettings = (input: SettingsInput): CrawlSettings => {
  if (!input.url) {
    throw new Error("Missing root url")
  }
  return {
    ...input,
    url: input.url,
    urlType: input.url.toLowerCase().endsWith(".xml") ? "sitemap" : "root",
    depth: input.depth ?? 1,
    screenshotBaseFolder: input.screenshotFolder ?? "snap",
    filesFolder: input.filesFolder ?? "files",
    devices: defaultDevices,
    allowedDomains: input.allowedDomains ?? [getDomain(input.url)],
    timeoutSeconds: input.timeoutSeconds ?? 60,
  }
}

export const parseSettings = (filePath: string) => {
  console.log(`Loading settings from ${filePath}`)
  const config = yaml.load(fs.readFileSync(filePath, "utf-8"))
  if (!config) {
    throw new Error(`Cannot load config ${filePath}`)
  }
  if (typeof config === "string") {
    throw new Error(`Invalid config string type ${filePath} -> ${config}`)
  }
  return buildSettings(config as SettingsInput)
}
