import { getDomain } from "../utils/urls"
import { CrawlSettings } from "./types"

export const isValidUrl = (url: string, settings: CrawlSettings) =>
  url.includes("://") &&
  settings.allowedDomains.find((x) => x.toLowerCase() === getDomain(url))
