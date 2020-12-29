export interface GraphRepo<TPage> {
  insertPage: (page: TPage) => Promise<void>
  updatePage: (page: TPage) => Promise<void>
  insertLink: (from: TPage, to: TPage) => Promise<void>
  init: () => Promise<void>
}
