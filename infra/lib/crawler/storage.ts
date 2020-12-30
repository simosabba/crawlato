import * as cdk from "@aws-cdk/core"
import * as s3 from "@aws-cdk/aws-s3"
import { Environment } from "../envs"

export interface StorageProps {
  environment: Environment
}

export class Storage extends cdk.Construct {
  constructor(scope: cdk.Construct, name: string, props: StorageProps) {
    super(scope, name)

    const siteBucket = new s3.Bucket(
      this,
      `CrawlContents-${props.environment.id}`,
      {
        bucketName: `crawl-contents-${props.environment.id}`,
        publicReadAccess: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      }
    )
    new cdk.CfnOutput(this, "Bucket", { value: siteBucket.bucketName })
  }
}
