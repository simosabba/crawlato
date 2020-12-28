import Graph from "graph-data-structure"

export interface ExtendedGraphOptions<T> {
  idSelector: (node: T) => string
  idNormalizer: (id: string) => string
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

  existsNode = (node: NodeOrId<T>) => this.nodesMap.has(this.nodeId(node))

  getNode = (node: NodeOrId<T>) => this.nodesMap.get(this.nodeId(node))

  addEdge = (from: NodeOrId<T>, to: NodeOrId<T>, weight?: number) =>
    this.graph.addEdge(this.nodeId(from), this.nodeId(to), weight)

  removeEdge = (from: NodeOrId<T>, to: NodeOrId<T>) =>
    this.graph.removeEdge(this.nodeId(from), this.nodeId(to))

  existsEdge = (from: NodeOrId<T>, to: NodeOrId<T>) =>
    this.graph
      .adjacent(this.nodeId(from))
      .find((x) => x === this.nodeId(to)) !== undefined

  getDistance = (from: NodeOrId<T>, to: NodeOrId<T>) =>
    this.graph.shortestPath(this.nodeId(from), this.nodeId(to)).length - 1

  nodeId = (value: NodeOrId<T>) => {
    if (typeof value === "string") {
      return this.normalizeId(value)
    }
    return this.normalizeId(this.options.idSelector(value))
  }

  private normalizeId = (value: NodeId) => this.options.idNormalizer(value)
}
