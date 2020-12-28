import { CrawlQueue } from "../queue"
import { WebsitePageInput } from "../types"

const device = {
  id: "device",
  width: 100,
  height: 500,
}
const queue = (...currentJobs: WebsitePageInput[]) => {
  const instance = new CrawlQueue<any>()
  currentJobs.forEach((x) => instance.submitJob(x))
  return instance
}

test("pending jobs empty queue", () =>
  expect(queue().findJobs("pending").length).toBe(0))

test("pending jobs one in queue", () =>
  expect(
    queue({
      device,
      url: "xxx",
    }).findJobs("pending").length
  ).toBe(1))

test("running jobs with pending job", () =>
  expect(
    queue({
      device,
      url: "xxx",
    }).findJobs("running").length
  ).toBe(0))

test("update job", () => {
  const q = queue({
    device,
    url: "xxx",
  })
  const job = q.findJob("pending")
  const output = {
    input: job.input,
    data: {
      key: "value",
    },
    links: ["link"],
  }
  q.updateJob(job.id, "completed", output)

  expect(q.getJob(job.id).status).toBe("completed")
  expect(q.getJob(job.id).output).toBe(output)
})
