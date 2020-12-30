import * as cdk from "@aws-cdk/core"
import { Environment } from "../envs"
import { Storage } from "./storage"

export interface CrawlerStackProps extends cdk.StackProps {
  environment: Environment
}

export class CrawlerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CrawlerStackProps) {
    super(scope, id, props)

    new Storage(this, "contents-storage", {
      environment: props.environment,
    })
  }
}
