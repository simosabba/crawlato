import { replaceAll } from "./strings"

export const getDomain = (url: string) => url.split("://")[1].split("/")[0]

export const getRelativePath = (url: string) => url.split("://")[1].split("/").slice(1).join("/")

export const getExtension = (url: string) => {
    const p = getRelativePath(url).split(".")
    return p.length > 1 ? replaceAll(p[p.length -1 ], "/", "") : ""
}
