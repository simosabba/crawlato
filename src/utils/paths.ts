
import { join, dirname } from "path"

export const joinPath = (...paths: string[]) => join(...paths)

export const getFolder = (path: string) => dirname(path)