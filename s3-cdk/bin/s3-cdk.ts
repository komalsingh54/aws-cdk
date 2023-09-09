#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { S3CdkStack } from '../lib/s3-cdk-stack';
import { ConsumerStack } from '../lib/consumer-stack';

const app = new cdk.App();

const producer = new S3CdkStack(app, 'S3CdkStack', {});
new ConsumerStack(app, 'ConsumerStack', {
  userBucket: producer.myBucket
})

