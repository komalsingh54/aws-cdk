#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CiCdStack } from '../lib/ci-cd-stack';

const app = new cdk.App();
new CiCdStack(app, 'CiCdStack', {
    env: {
        region: 'us-east-1',
        account: '034922678080',
    },
    repositoryName: 'MyRepo'
});

app.synth();