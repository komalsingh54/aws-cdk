#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2CdkStack } from '../lib/ec2-cdk-stack';
import { ThreeTierArch } from '../lib/threeTierArch-stack';

const app = new cdk.App();
//  new Ec2CdkStack(app, 'Ec2CdkStack', {});

new ThreeTierArch(app, 'ThreeTierArchitect', {})