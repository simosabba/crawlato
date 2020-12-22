export const cleanString = (value: string | undefined) =>
  value?.replace(/\s\s+/g, " ")
