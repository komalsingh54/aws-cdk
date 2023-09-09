import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseStack } from './base-stack';
import { Topic } from 'aws-cdk-lib/aws-sns';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CustomLogicalNameStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Topic(this, 'MyTopic');
  }
}
