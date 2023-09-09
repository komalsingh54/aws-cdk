import { Stack, StackProps } from "aws-cdk-lib";
import { User } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface MyProps extends StackProps {
    userBucket: Bucket
}

export class ConsumerStack extends Stack {
    constructor(scope: Construct, id: string, props: MyProps) {
        super(scope, id, props);
        
        const thisUser = new User(this, 'MyUser');
        
        props?.userBucket.grantReadWrite(thisUser)

    }
}