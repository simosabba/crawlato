import { generateJobId } from "../utils/uids"
import {
  CrawlJobInput,
  CrawlJobOutput,
  CrawlJobQueueItem,
  CrawlJobStatus,
  JobId,
} from "./types"

export class CrawlQueue<TOutput> {
  private readonly jobs: CrawlJobQueueItem<TOutput>[] = []

  submitJob = (input: CrawlJobInput) =>
    this.jobs.push({
      id: generateJobId(),
      input,
      status: "pending",
    })

  findJobs = (status: CrawlJobStatus) =>
    this.jobs.filter((x) => x.status === status)

  findJob = (status: CrawlJobStatus) => this.findJobs(status)?.[0]

  getJob = (jobId: JobId) => this.jobs.filter((x) => x.id === jobId)?.[0]

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
