#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Hello } from '../lib/aws-cdk-stack';

const app = new cdk.App();


new Hello(app, 'lambda-cdk-stack', {
   env: { account: '034922678080', region: 'us-east-1' },
});