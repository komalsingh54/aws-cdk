import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream?: lambda.IFunction;
}

export class HitCounter extends Construct {
    public readonly handler: lambda.Function;
    constructor(scope: Construct, id: string, props?: HitCounterProps) {
        super(scope, id);

    

    }
}