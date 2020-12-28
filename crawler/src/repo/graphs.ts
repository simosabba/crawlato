import { aql } from "arangojs"
import { Graph } from "arangojs/graph"
import { db } from "../infrastructure/arango/client"

export class WebsitePagesRepo<TPage> {
  private graph: Graph | undefined
  //private readonly edges = this.graph.edgeCollection("websiteLinks")
  //private readonly vertex = this.graph.vertexCollection("websitePages")

  constructor(private idSelector: (page: TPage) => string) {}

  insertPage = async (page: TPage) => {
    await (await this.vertex()).save({
      _id: this.idSelector(page),
      ...page,
    })
  }

  insertLink = async (from: TPage, to: TPage) => {
    const edge = {
      _from: await this.getVertexId(from),
      _to: await this.getVertexId(to),
    }
    console.log("creating edge", edge)
    await (await this.edges()).save(edge)
  }

  private getVertexId = async (page: TPage) => (await this.getVertex(page))?._id

  private getVertex = async (page: TPage) =>
    await (
      await db.query({
        query: `FOR page IN websitePages FILTER page.info.nodeId == @nodeId RETURN page`,
        bindVars: {
          // c: await this.vertex(),
          nodeId: this.idSelector(page),
        },
      })
    ).next()

  private edges = async () =>
    (await this.ensureGraph()).edgeCollection("websiteLinks")

  private vertex = async () =>
    (await this.ensureGraph()).vertexCollection("websitePages")

  ensureGraph = async () => {
    if (!this.graph) {
      this.graph = await this.initializeGraph()
    }
    return this.graph
  }

  private initializeGraph = async () => {
    console.debug("Initializing graph")
    const graph = (await db.listGraphs()).find((x) => x.name === "website")
    if (graph) {
      console.debug("Graph exists")
      return db.graph("website")
    }

    console.debug("Creating graph")
    return await db.createGraph("website", [
      {
        collection: "websiteLinks",
        from: "websitePages",
        to: "websitePages",
      },
    ])
  }
}
