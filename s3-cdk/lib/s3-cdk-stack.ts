import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SnsDestination, SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export class S3CdkStack extends cdk.Stack {
  public readonly myBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.templateOptions.description = "This is s3 stack example";

    const s3Resource = new s3.Bucket(this, 'MyBucket', {
      bucketName: 'my-bucket-dandom',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      intelligentTieringConfigurations: [{
        name: 's3tier',
        archiveAccessTierTime: cdk.Duration.days(90),
        deepArchiveAccessTierTime: cdk.Duration.days(180),
        tags: [{key: 'tagname', value: 'tag value'}]
      }],
     /*  lifecycleRules: [{
       // abortIncompleteMultipartUploadAfter: cdk.Duration.minutes(30),
        enabled: false,
        expiration: cdk.Duration.days(30),
        expirationDate: new Date(),
        expiredObjectDeleteMarker: false,
        id: 'id',
        noncurrentVersionExpiration: cdk.Duration.days(30),
        objectSizeGreaterThan: 500,
        prefix: 'prefix',
        objectSizeLessThan: 10000,
        transitions: [{
          storageClass: s3.StorageClass.GLACIER,
    
          // the properties below are optional
          transitionAfter: cdk.Duration.days(30),
          transitionDate: new Date(),
        }],
      }] */
    });

    cdk.Tags.of(this).add('env', 'dev');
    cdk.Tags.of(s3Resource).add('env', 's3-dev');

    this.myBucket = s3Resource;

    /*  const s3Topic = new Topic(this, 'S3Topic', {
       displayName: 'S3 Topic',
     });
  */
    const s3Queue = new Queue(this, 's3queue', {
      queueName: 's3queue',
    })

    // s3Resource.addEventNotification(s3.EventType.OBJECT_CREATED, new SnsDestination(s3Topic))
    s3Resource.addEventNotification(s3.EventType.OBJECT_CREATED, new SqsDestination(s3Queue));


    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      inventories: [{
        frequency: s3.InventoryFrequency.DAILY,
        includeObjectVersions: s3.InventoryObjectVersion.CURRENT,
        destination: {
          bucket: s3Resource
        }
      }]
    })
  }
}
