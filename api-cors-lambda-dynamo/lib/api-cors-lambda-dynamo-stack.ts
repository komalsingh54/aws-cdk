import * as cdk from 'aws-cdk-lib';
import { AuthorizationType, LambdaIntegration, RestApi, IResource, MockIntegration, PassthroughBehavior } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');

export class ApiCorsLambdaDynamoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamo = new Table(this, 'APIBackend', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'APIBackend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const nodejsFunctionProps: NodejsFunctionProps = {
      environment: {
        DYNAMO_TABLE_NAME: dynamo.tableName,
        PRIMARY_KEY: 'itemId',
      },
      bundling: {
        externalModules: ['aws-sdk'],
      },
      depsLockFilePath: path.resolve(__dirname, '..', 'lambda', 'package-lock.json'),
      runtime: Runtime.NODEJS_16_X,
    };

    const getOneItemFunction = new NodejsFunction(this, 'getOneItemFunction', {
      entry: path.resolve(__dirname, '..', 'lambda', 'get-one-item.ts'),
      ...nodejsFunctionProps,
    })

    dynamo.grantReadData(getOneItemFunction);

    const getOneIntegration = new LambdaIntegration(getOneItemFunction);

    const myApis = new RestApi(this, 'MyApis', {
      restApiName: 'MyApis',
    });

    const getOneItem = myApis.root.addResource('getOneItem');
    getOneItem.addMethod('GET', getOneIntegration, {
      authorizationType: AuthorizationType.NONE,
    });
    addCorsOptions(getOneItem);

    const output = new cdk.CfnOutput(this, 'APIURL', {
      value: myApis.url,
      description: 'API URL',
    });
  };
}


export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    // In case you want to use binary media types, uncomment the following line
    // contentHandling: ContentHandling.CONVERT_TO_TEXT,
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    // In case you want to use binary media types, comment out the following line
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
}