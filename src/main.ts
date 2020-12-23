import dotenv from "dotenv"
import fs from "fs"
import { argv } from "./cli"
import { CrawlJob, buildSettings, parseSettings } from "./crawler"

dotenv.config()

const DEFAULT_SETTINGS_FILE = "settings.yaml"
const settingsFile =
  argv.settings ??
  (fs.existsSync(DEFAULT_SETTINGS_FILE) ? DEFAULT_SETTINGS_FILE : undefined)

const getSettings = () =>
  settingsFile ? parseSettings(settingsFile) : buildSettings(argv)

new CrawlJob(getSettings()).run()
