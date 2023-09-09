import * as cdk from 'aws-cdk-lib';
import { RestApi, EndpointType, Cors, HttpIntegration, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { Construct, } from 'constructs';

export class ProxyGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'ProxyGateway', {
      restApiName: 'ProxyGateway',
      description: 'ProxyGateway',
      deployOptions: {
        stageName: 'Dev',
      },
    });

    cdk.Annotations.of(api).addWarningV2('This API is for testing purposes only', 'Some warning');

    new cdk.CfnParameter(this, 'EnvURL', {
      type: 'String',
      description: 'ProxyGateway URL',
    });

    const books = api.root.addResource('books');
    const book = api.root.addResource('{bookId}');
    const integration = new HttpIntegration('https://www.google.com');
    const integration2 = new HttpIntegration('https://www.microsoft.com');

    books.addMethod('ANY', integration, {
      authorizationType: AuthorizationType.NONE,
    });

    book.addMethod('ANY', integration2, {
      authorizationType: AuthorizationType.NONE,
    });

    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
    });
  }
}
