import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MyEcsConstructStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'MyVpc', {
      natGateways: 0,
      maxAzs: 2
    });

    const cluster = new Cluster(this, 'MyCluster', {
      vpc: vpc
    });

    new ApplicationLoadBalancedFargateService(this, 'MyFargateService', {
      cluster: cluster,
      memoryLimitMiB: 512,
      cpu: 256,
      taskImageOptions: {
        image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample')
      },
      desiredCount: 2,
      publicLoadBalancer: true
    });


  }
}
