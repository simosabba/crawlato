export const cleanString = (value: string | undefined) =>
  value?.replace(/\s\s+/g, " ")

export const trimEnd = (value: string, char: string) =>
  value.endsWith(char) ? value.substr(0, value.length - char.length) : value

export const replaceAll = (value: string, from: string, to: string) =>
  value.split(from).join(to)

export const replaceAllChars = (value: string, from: string[], to: string) => {
  let result = value
  from.forEach((x) => (result = replaceAll(result, x, to)))
  return result
}

export interface StrMap {
  from: string[]
  to: string
}

export const replaceMap = (value: string, terms: StrMap[]) => {
  let result = value
  terms.forEach((x) => (result = replaceAllChars(result, x.from, x.to)))
  return result
}

export const startsWithAny = (
  value: string,
  prefixes: string[],
  ignoreCase = true
) => prefixes.find((x) => startsWith(value, x, ignoreCase))

export const startsWith = (value: string, prefix: string, ignoreCase = true) =>
  (ignoreCase ? value.toLowerCase() : value).startsWith(
    ignoreCase ? prefix.toLowerCase() : prefix
  )
