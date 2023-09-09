import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cloudWatch from 'aws-cdk-lib/aws-cloudwatch'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as events from 'aws-cdk-lib/aws-events'
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling'


export class Hello extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // define aws lambda resources here

    const iamRole = new iam.Role(this, 'LambdaRole', {
      roleName: 'LambdaRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    /*  const rule = new events.Rule(this, 'ScheduleRule', {
       schedule: events.Schedule.cron({ minute : '5'})
     }) */

    const lambdaFn = new lambda.Function(this, 'HelloLambda', {
      functionName: 'HelloLambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: iamRole,
      timeout: cdk.Duration.seconds(60),
      tracing: lambda.Tracing.ACTIVE,
    });

    iamRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
    const alias = lambdaFn.addAlias('dev');

    const as = alias.addAutoScaling({ maxCapacity: 50 });


    // rule.addTarget(new targets.LambdaFunction(lambdaFn))

    /*   if (lambdaFn.timeout) {
        new cloudWatch.Alarm(this, 'MyAlarm', {
          alarmName: 'LambdaAlarm',
          metric: lambdaFn.metricDuration().with({
            statistic: 'Maximum',
          }),
          evaluationPeriods: 1,
          datapointsToAlarm: 1,
          threshold: lambdaFn.timeout.toMilliseconds(),
        })
      } */
  }
}