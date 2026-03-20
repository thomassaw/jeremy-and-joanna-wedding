import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class CiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubRepo = "thomassaw/jeremy-and-joanna-wedding";

    // Import existing GitHub Actions OIDC identity provider
    const oidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GitHubOidcProvider",
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    // IAM role that GitHub Actions assumes via OIDC
    const deployRole = new iam.Role(this, "GitHubActionsDeployRole", {
      roleName: "github-actions-deploy",
      assumedBy: new iam.WebIdentityPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          StringLike: {
            "token.actions.githubusercontent.com:sub": `repo:${githubRepo}:ref:refs/heads/main`,
          },
        },
      ),
      maxSessionDuration: cdk.Duration.hours(1),
      description:
        "Role assumed by GitHub Actions to deploy the wedding site via CDK",
    });

    // AdministratorAccess for simplicity (personal project)
    deployRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
    );

    new cdk.CfnOutput(this, "DeployRoleArn", {
      value: deployRole.roleArn,
      description:
        "ARN of the IAM role for GitHub Actions to assume via OIDC",
    });

    new cdk.CfnOutput(this, "OidcProviderArn", {
      value: oidcProvider.openIdConnectProviderArn,
      description: "ARN of the GitHub Actions OIDC identity provider",
    });
  }
}
