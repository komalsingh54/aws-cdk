import * as cdk from 'aws-cdk-lib';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import { LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';

interface CIStackProps extends cdk.StackProps {
  repositoryName: string
}

export class CiCdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CIStackProps) {
    super(scope, id, props);

    // create a code pipeline 
    const pipeline = new Pipeline(this, 'MyPipeline', {
      pipelineName: 'MyPipeline',
    });

    const repo = Repository.fromRepositoryName(this, 'MyRepo', props.repositoryName);
    const sourceOutput = new Artifact('sourceOutput');

    const sourceAction = new CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: repo,
      branch: 'main',
      output: sourceOutput,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    const buildAction = new CodeBuildAction({
      actionName: 'CodeBuild',
      input: sourceOutput,
      project: new PipelineProject(this, 'MyProject', {
        description: 'Builds my project',
        environment: {
          buildImage: LinuxBuildImage.STANDARD_3_0,
        },
      }),
    });


    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction],
    })
  }
}

// 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