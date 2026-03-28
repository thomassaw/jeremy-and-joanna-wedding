import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

const DOMAIN = "jomarryjer.space";

export class DnsStack extends cdk.Stack {
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: DOMAIN,
    });

    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: DOMAIN,
      subjectAlternativeNames: [`*.${DOMAIN}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    new cdk.CfnOutput(this, "NameServers", {
      value: cdk.Fn.join(", ", this.hostedZone.hostedZoneNameServers!),
      description: "Set these as nameservers at your domain registrar",
    });
  }
}
