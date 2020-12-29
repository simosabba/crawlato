import { GraphRepo } from "./types"

export class WebsitePagesNeoRepo<TPage> implements GraphRepo<TPage> {
  constructor(private idSelector: (page: TPage) => string) {}

  init = async () => {}

  insertPage = async (page: TPage) => {}

  insertLink = async (from: TPage, to: TPage) => {}
}
