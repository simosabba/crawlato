export const environments = [
  {
    id: "staging",
    name: "staging",
  },
  {
    id: "prod",
    name: "production",
  },
]

export type Environment = typeof environments[0]
