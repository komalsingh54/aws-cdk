import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';


export class StaticSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudfrontOai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for static site'
    });

    const bucket = new s3.Bucket(this, 'StaticSiteBucket', {
      bucketName: 'com.static.example.com',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    bucket.grantRead(cloudfrontOai);

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'BucketURL', {
      value: bucket.bucketWebsiteUrl,
    });

    const cloudFront = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(bucket, {
          originAccessIdentity: cloudfrontOai,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: cloudFront.distributionDomainName,
    });

    /*  new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
       sources: [s3deploy.Source.asset('./site-contents')],
       destinationBucket: siteBucket,
       distribution,
       distributionPaths: ['/*'],
     }); */
  }
}
