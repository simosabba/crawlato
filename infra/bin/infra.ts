#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "@aws-cdk/core"
import { environments } from "../lib/envs"
import { CrawlerStack } from "../lib/crawler"

const app = new cdk.App()

environments.forEach(
  (env) =>
    new CrawlerStack(app, `crawlato-${env.id}-stack`, {
      environment: env,
    })
)
