import { CfnElement, Stack } from "aws-cdk-lib";

export class BaseStack extends Stack {
    public allocateLogicalId(cfnElement: CfnElement): string {
        const orig = super.allocateLogicalId(cfnElement);
        const prefix = this.node.tryGetContext("prefix");

        return prefix ? `${prefix}${orig}` : orig;


    }
}