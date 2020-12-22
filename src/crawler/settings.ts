import yaml from "js-yaml"
import fs from "fs"
import { CrawlSettings, Device } from "./types"

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
  devices?: Device[]
  elementsToRemove?: string[]
}

export const buildSettings = (input: SettingsInput): CrawlSettings => {
  if (!input.url) {
    throw new Error("Missing url")
  }
  return {
    url: input.url,
    urlType: input.url.toLowerCase().endsWith(".xml") ? "sitemap" : "root",
    depth: input.depth ?? 1,
    screenshotBaseFolder: input.screenshotFolder ?? "snap",
    devices: defaultDevices,
    elementsToRemove: input.elementsToRemove,
  }
}

export const parseSettings = (filePath: string) => {
  const config = yaml.load(fs.readFileSync(filePath, "utf-8"))
  if (!config) {
    throw new Error(`Cannot load config ${filePath}`)
  }
  if (typeof config === "string") {
    throw new Error(`Invalid config string type ${filePath} -> ${config}`)
  }
  return buildSettings(config as SettingsInput)
}