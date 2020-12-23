import { ExtendedGraph } from "../graph/extended-graph"
import { trimEnd } from "../utils/strings"
import { Device, WebsitePage, WebsitePageInput } from "./types"

export interface WebsiteGraphNode {
  page: WebsitePageInput
  data?: WebsitePage
}

const idNormalizer = (url: string) => trimEnd(url.toLowerCase(), "/")

class WebsitePagesGraph extends ExtendedGraph<WebsiteGraphNode> {
  private readonly rootNodes: WebsiteGraphNode[] = []

  constructor() {
    super({
      idSelector: (x) => x.page.url,
      idNormalizer,
    })
  }

  addRoot = (node: WebsiteGraphNode) => this.rootNodes.push(node)

  getRoots = () => Array.from(this.rootNodes)

  getPageDepth = (page: WebsitePageInput) =>
    Math.min(
      ...this.getRoots().map((x) => this.getDistance(x, this.getPage(page)))
    )

  getPage = (page: WebsitePageInput) => {
    const p = this.getNode(page.url)
    if (!p) {
      throw new Error(`Page ${page.url} not found`)
    }
    return p
  }
}

export class WebsiteGraph {
  private readonly graphs = new Map<string, WebsitePagesGraph>()

  containsPage = (page: WebsitePageInput) =>
    this.getNodeGraph(page).existsNode(page.url)

  setPageData = (page: WebsitePageInput, data: WebsitePage) => {
    const p = this.getPage(page)
    if (!p) {
      throw new Error(`Page ${page.device} ${page.url} not found`)
    }
    p.data = data
  }
  getPage = (page: WebsitePageInput) =>
    this.getDeviceGraph(page.device.id).getNode(page.url)

  getDepth = (page: WebsitePageInput) =>
    this.getNodeGraph(page).getPageDepth(page)

  addPage = (targetPage: WebsiteGraphNode, isRoot?: boolean) => {
    this.addPageNode(targetPage)

    if (isRoot) {
      this.getNodeGraph(targetPage.page).addRoot(targetPage)
    }
  }

  existsLink = (from: WebsitePageInput, to: WebsitePageInput) =>
    this.getNodeGraph(from).existsEdge(from.url, to.url)

  addPageLink = (from: WebsitePageInput, to: WebsitePageInput) =>
    this.getNodeGraph(from).addEdge(from.url, to.url)

  private addPageNode = (node: WebsiteGraphNode) => {
    const graph = this.getNodeGraph(node.page)
    if (!graph.existsNode(node)) {
      graph.addNode(node)
    }
  }

  private getNodeGraph = (page: WebsitePageInput) =>
    this.getDeviceGraph(page.device.id)

  private getDeviceGraph = (deviceId: string): WebsitePagesGraph => {
    if (!this.graphs.has(deviceId)) {
      this.graphs.set(deviceId, new WebsitePagesGraph())
    }
    return this.graphs.get(deviceId) as WebsitePagesGraph
  }
}
