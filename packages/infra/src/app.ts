import * as cdk from "aws-cdk-lib";
import { WebStack } from "./web-stack";
import { CiStack } from "./ci-stack";

const app = new cdk.App();

const env = {
  account: "268094410367",
  region: "ap-southeast-1",
};

new WebStack(app, "WeddingWeb", { env });

new CiStack(app, "WeddingCi", { env });
