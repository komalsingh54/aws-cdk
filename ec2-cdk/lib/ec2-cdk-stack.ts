import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { readFileSync } from 'fs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Ec2CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpcResource = new ec2.Vpc(this, 'MyVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      subnetConfiguration: [{
        subnetType: ec2.SubnetType.PUBLIC,
        name: 'Ingress',
      },
      {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        name: 'Application',
      }, {
        name: 'Database',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      }]
    });

    cdk.Tags.of(vpcResource).add('Name', 'Value');

    const amazeLinux =  ec2.MachineImage.latestAmazonLinux2();
    const ec2InstanceSg = new ec2.SecurityGroup(this, 'EC2-INSTANCE-SG', {
      vpc: vpcResource,
      securityGroupName:  'allow http traffic',
      allowAllOutbound: true,
    });

    ec2InstanceSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow inbound http')

    const ec2Instance = new ec2.Instance(this, 'MyEc2instance', {
      vpc: vpcResource,
      vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC},
      instanceType:  ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: amazeLinux,
      securityGroup: ec2InstanceSg
    });

    const userData = readFileSync('./lib/userData.sh', 'utf8');

    ec2Instance.addUserData(userData);

  }
}
