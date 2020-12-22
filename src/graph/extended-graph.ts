import Graph from "graph-data-structure"

export interface ExtendedGraphOptions<T> {
  idSelector: (node: T) => string
  caseVariantId?: boolean
}

export type NodeId = string
export type NodeOrId<T> = T | NodeId

export class ExtendedGraph<T> {
  private readonly graph = Graph()
  private readonly nodesMap = new Map<NodeId, T>()

  constructor(private readonly options: ExtendedGraphOptions<T>) {}

  addNode = (node: T) => {
    this.graph.addNode(this.nodeId(node))
    this.nodesMap.set(this.nodeId(node), node)
  }

  removeNode = (node: T) => {
    this.graph.removeNode(this.nodeId(node))
    this.nodesMap.delete(this.nodeId(node))
  }

  containsNode = (id: NodeId) => this.nodesMap.has(this.normalizeId(id))

  addEdge = (from: NodeOrId<T>, to: NodeOrId<T>, weight?: number) =>
    this.graph.addEdge(this.nodeId(from), this.nodeId(to), weight)

  removeEdge = (from: NodeOrId<T>, to: NodeOrId<T>) =>
    this.graph.removeEdge(this.nodeId(from), this.nodeId(to))

  private nodeId = (value: NodeOrId<T>) => {
    if (typeof value === "string") {
      return this.normalizeId(value)
    }
    return this.normalizeId(this.options.idSelector(value))
  }

  private normalizeId = (value: NodeId) =>
    this.options.caseVariantId ? value : value.toLowerCase()
}
