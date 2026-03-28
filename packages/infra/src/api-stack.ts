import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaRuntime from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import * as path from "path";

const DOMAIN = "jomarryjer.space";
const API_DOMAIN = `api.${DOMAIN}`;

interface ApiStackProps extends cdk.StackProps {
  hostedZone: route53.IHostedZone;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, "WeddingData", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Lambda function (bundled with esbuild via NodejsFunction)
    const fn = new lambda.NodejsFunction(this, "Handler", {
      entry: path.join(__dirname, "../../api/src/handler.ts"),
      handler: "handler",
      runtime: lambdaRuntime.Runtime.NODEJS_22_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: table.tableName,
        GOOGLE_CLIENT_ID: "467658976945-lup298srub16p8k0n0ll29ml75agfu4s.apps.googleusercontent.com",
        ADMIN_EMAILS: "tom@solutions.com.sg,jeremyyychee@gmail.com,joanna82@gmail.com",
      },
      bundling: {
        format: lambda.OutputFormat.ESM,
        target: "node22",
        mainFields: ["module", "main"],
        forceDockerBundling: false,
      },
    });

    table.grantReadWriteData(fn);

    // Regional ACM certificate for api subdomain
    const certificate = new acm.Certificate(this, "ApiCertificate", {
      domainName: API_DOMAIN,
      validation: acm.CertificateValidation.fromDns(props.hostedZone),
    });

    // HTTP API
    const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      apiName: "WeddingApi",
      corsPreflight: {
        allowOrigins: [`https://${DOMAIN}`, "http://localhost:3020"],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ["Content-Type", "Authorization"],
        maxAge: cdk.Duration.hours(1),
      },
    });

    const lambdaIntegration = new integrations.HttpLambdaIntegration(
      "LambdaIntegration",
      fn,
    );

    const routes: Array<{ path: string; method: apigwv2.HttpMethod }> = [
      { path: "/rsvp", method: apigwv2.HttpMethod.POST },
      { path: "/rsvp", method: apigwv2.HttpMethod.GET },
      { path: "/rsvp/{id}", method: apigwv2.HttpMethod.DELETE },
      { path: "/wishes", method: apigwv2.HttpMethod.GET },
      { path: "/stats", method: apigwv2.HttpMethod.GET },
      { path: "/settings", method: apigwv2.HttpMethod.GET },
      { path: "/settings", method: apigwv2.HttpMethod.PUT },
    ];

    for (const route of routes) {
      httpApi.addRoutes({
        path: route.path,
        methods: [route.method],
        integration: lambdaIntegration,
      });
    }

    // Custom domain
    const domainName = new apigwv2.DomainName(this, "ApiDomain", {
      domainName: API_DOMAIN,
      certificate,
    });

    new apigwv2.ApiMapping(this, "ApiMapping", {
      api: httpApi,
      domainName,
    });

    // Route53 record
    new route53.ARecord(this, "ApiAliasRecord", {
      zone: props.hostedZone,
      recordName: "api",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: `https://${API_DOMAIN}`,
      description: "API URL",
    });
  }
}
