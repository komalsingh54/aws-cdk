import * as cdk from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AuthorizationType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Authorization } from 'aws-cdk-lib/aws-events';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class WidgetServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'WidgetStore');

    const handler = new Function(this, 'WidgetHandler', {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset('resources'),
      handler: 'widgets.main',
      environment: {
        BUCKET: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(handler);

    const api = new RestApi(this, 'widgets-api', {
      restApiName: 'Widget Service',
      description: 'This service serves widgets',
    });

    const getWidgetsIntegration = new LambdaIntegration(handler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });
    api.root.addMethod('GET', getWidgetsIntegration, {
      authorizationType: AuthorizationType.NONE,
    }); // GET /
    api.root.addMethod('POST', getWidgetsIntegration, {
      authorizationType: AuthorizationType.NONE,
    }); // POST /
    api.root.addMethod('PUT', getWidgetsIntegration, {
      authorizationType: AuthorizationType.NONE
    }); // PUT /
    api.root.addMethod('DELETE', getWidgetsIntegration, {
      authorizationType: AuthorizationType.NONE
    }); // DELETE /

  }
}
