import * as cdk from "aws-cdk-lib";
import { WebStack } from "./web-stack";
import { CiStack } from "./ci-stack";
import { DnsStack } from "./dns-stack";
import { ApiStack } from "./api-stack";

const app = new cdk.App();

const account = "268094410367";

const dnsStack = new DnsStack(app, "WeddingDns", {
  env: { account, region: "us-east-1" },
  crossRegionReferences: true,
});

new WebStack(app, "WeddingWeb", {
  env: { account, region: "ap-southeast-1" },
  crossRegionReferences: true,
  hostedZone: dnsStack.hostedZone,
  certificate: dnsStack.certificate,
});

new ApiStack(app, "WeddingApi", {
  env: { account, region: "ap-southeast-1" },
  crossRegionReferences: true,
  hostedZone: dnsStack.hostedZone,
});

new CiStack(app, "WeddingCi", {
  env: { account, region: "ap-southeast-1" },
});
