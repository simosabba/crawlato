import { Database } from "arangojs"

export const db = new Database({
  url: process.env.ARANGO_URL,
  databaseName: process.env.ARANGO_DB,
  auth: {
    username: process.env.ARANGO_USER ?? "root",
    password: process.env.ARANGO_PWD,
  },
})
