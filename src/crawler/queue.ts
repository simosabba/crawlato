import { generateJobId } from "../utils/uids"
import {
  WebsitePageInput,
  CrawlJobOutput,
  CrawlJobQueueItem,
  CrawlJobStatus,
  JobId,
  Device,
} from "./types"

export class CrawlQueue<TOutput> {
  private readonly jobs: CrawlJobQueueItem<TOutput>[] = []

  submitJob = (input: WebsitePageInput, referrer?: WebsitePageInput) =>
    this.jobs.push({
      id: generateJobId(),
      input,
      status: "pending",
      referrer,
    })

  containsJob = (input: WebsitePageInput) =>
    this.jobs.find(
      (x) => x.input.url === input.url && x.input.device.id === input.device.id
    )

  getJobByUrlPattern = (urlPrefix: string, device: Device) =>
    this.jobs.find(
      (x) =>
        x.input.url.match(new RegExp(urlPrefix)) &&
        x.input.device.id === device.id
    )

  findJobs = (status: CrawlJobStatus) =>
    this.jobs.filter((x) => x.status === status)

  findJob = (status: CrawlJobStatus) => this.findJobs(status)?.[0]

  getJob = (jobId: JobId) => this.jobs.filter((x) => x.id === jobId)?.[0]

  allJobs = () => Array.from(this.jobs)

  updateJob = (
    jobId: JobId,
    status: CrawlJobStatus,
    output?: CrawlJobOutput<TOutput>
  ) => {
    const job = this.getJob(jobId)
    job.status = status
    job.output = output
  }
}
