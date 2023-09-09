#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProxyGatewayStack } from '../lib/proxy-gateway-stack';

const app = new cdk.App();
new ProxyGatewayStack(app, 'ProxyGatewayStack', {
  tags: { env: 'dev' },
  stackName: 'ProxyGatewayStack',
  description: 'ProxyGatewayStack',
  env: {
    region: 'us-east-1'
  }

});