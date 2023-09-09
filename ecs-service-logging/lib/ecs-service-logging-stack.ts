import * as cdk from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { AwsLogDriver, Cluster, Compatibility, ContainerImage, Ec2Service, TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EcsServiceLoggingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'Vpc', {
      natGateways: 0,
      maxAzs: 2,
    });

    const cluster = new Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'ECSCluster',
    });

    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      maxCapacity: 2,
      minCapacity: 1,
      desiredCapacity: 1,
    });

    const logging = AwsLogDriver.awsLogs({
      streamPrefix: 'ecs',
    });

    const taskDef = new TaskDefinition(this, 'TaskDef', {
      compatibility: Compatibility.EC2_AND_FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    taskDef.addContainer('DefaultContainer', {
      image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      logging,
      cpu: 256,
      essential: true,
      memoryLimitMiB: 512,
    });

    new Ec2Service(this, 'Ec2Service', {
      cluster,
      taskDefinition: taskDef,

    });
  }

}
