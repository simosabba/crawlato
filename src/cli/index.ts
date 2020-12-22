import yargs from "yargs"

export const argv = yargs(process.argv.slice(2)).options({
  url: { type: "string" },
  depth: { type: "number" },
  screenshotFolder: { type: "string" },
  settings: { type: "string" },
}).argv

export type InputArgs = typeof argv
