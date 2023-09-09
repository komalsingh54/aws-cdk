import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion } from 'aws-cdk-lib/aws-rds';

export class ThreeTierArch extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // create a vpc for your architecture
        const vpc = new ec2.Vpc(this, 'my-vpc', {
            maxAzs: 2,
            subnetConfiguration: [{
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                name: 'IsolatedSubnet',
            },
            {
                subnetType: ec2.SubnetType.PUBLIC,
                name: 'PublicSubnet',
            }, {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                name: 'PrivateSubnet',
            }]
        });

        // create a security group for the the ec2 instances
        const securityGroup = new ec2.SecurityGroup(this, 'WebServerSecurityGroup', {
            vpc,
            description: 'Security group for web servers',
        });

        securityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(80));
        securityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(443));

        const webServerGroup = new AutoScalingGroup(this, 'WebServerGroup', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            securityGroup: securityGroup,
            vpcSubnets: {
                subnetGroupName: 'PrivateSubnet'
            },
        });
        cdk.Tags.of(webServerGroup).add('Name', 'webServerGroup');

        webServerGroup.connections.allowFrom(securityGroup, ec2.Port.tcp(80), 'Allow HTTP traffic from ALB');
        webServerGroup.connections.allowFrom(securityGroup, ec2.Port.tcp(443), 'Allow HTTPS traffic from ALB');
        // Create a security group for the ALB
        const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
            vpc,
            description: 'Security group for the Application Load Balancer',
        });

        // Allow incoming HTTP traffic (port 80) from the internet
        albSecurityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(80), 'Allow HTTP traffic from the internet');
        albSecurityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(443), 'Allow HTTPS traffic from the internet');

        const alb = new ApplicationLoadBalancer(this, 'MyALB', {
            vpc,
            internetFacing: true,
            vpcSubnets: {
                subnetGroupName: 'PublicSubnet'
            },
            securityGroup: albSecurityGroup
        });
        cdk.Tags.of(alb).add('Name', 'alb')

        const listener = alb.addListener('Listener', {
            port: 80,
            open: true
        });
        listener.addTargets('WebTargets', {
            port: 80,
            targets: [webServerGroup],
        });

        const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
            vpc,
            description: 'Security group for RDS instance',
        });
        cdk.Tags.of(rdsSecurityGroup).add('Name', 'RDSSecurityGroup');

        rdsSecurityGroup.addIngressRule(securityGroup, ec2.Port.tcp(3306));

        const dbSecret = new Secret(this, 'DBSecret', {
            secretName: 'MyRDSInstanceSecret',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'admin' }),
                excludePunctuation: true,
                includeSpace: false,
                generateStringKey: 'password',
            },
            description: 'Secret for RDS instance credentials',
        });
        cdk.Tags.of(dbSecret).add('Name', 'RDSInstance');


        const rdsInstance = new DatabaseInstance(this, 'MyRdsInstance', {
            engine: DatabaseInstanceEngine.mysql({ version: MysqlEngineVersion.VER_8_0_34 }),
            vpc,
            vpcSubnets: {
                subnetGroupName: 'IsolatedSubnet',
            },
            securityGroups: [rdsSecurityGroup],
            databaseName: 'MyDatabase',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            credentials: Credentials.fromSecret(dbSecret)
        })
        cdk.Tags.of(rdsSecurityGroup).add('Name', 'RDSSecurityGroup');

    }
}