import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as athena from 'aws-cdk-lib/aws-athena'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as iam from 'aws-cdk-lib/aws-iam'
import { DynamoDBSeeder, Seeds } from '@cloudcomponents/cdk-dynamodb-seeder';
import { Construct } from 'constructs'

interface DdbAthenaStackProps extends cdk.StackProps {
  readonly tableName: string;
}

export class AthenaDynamoDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DdbAthenaStackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    new DynamoDBSeeder(this, 'InlineSeeder', {
      table,
      seeds: Seeds.fromJsonFile('src/database.json'),
    });

    const spillbucket = new s3.Bucket(this, 'SpillBucket', {
      bucketName: 'spillbucketreliant',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const outputBucket = new s3.Bucket(this, 'outputBucket', {
      bucketName: 'outputbucketddbreliant',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new athena.CfnWorkGroup(this, 'workgroup', {
      name: 'ddbworkgroup',
      recursiveDeleteOption: true,
      workGroupConfiguration: {
        resultConfiguration: {
          outputLocation: outputBucket.s3UrlForObject(),
        },
        engineVersion: {
          selectedEngineVersion: 'Athena engine version 3',
        },
      },
    });

    // workaround please see Readme #AthenaDynamoDBConnector Lambda
    const connector = lambda.Function.fromFunctionArn(this, 'ddbconnector', `arn:aws:lambda:${this.region}:${this.account}:function:ddbconnector`);

    new athena.CfnDataCatalog(this, 'datacatalog', {
      name: 'ddbconnector',
      type: 'LAMBDA',
      parameters: {
        function: connector.functionArn,
      },
    });

    // allowing quicksight to access Lambdas
    // const qsrole = new iam.Role(this, 'QuickSightRole', {
    //   assumedBy: new iam.ServicePrincipal('quicksight.amazonaws.com'),
    // });
    const qsrole = iam.Role.fromRoleArn(this, 'QuickSightRoleImport', `arn:aws:iam::${this.account}:role/service-role/aws-quicksight-service-role-v0`);

    // qsrole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),)
    qsrole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSQuicksightAthenaAccess'));
    qsrole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaRole'));
    qsrole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['s3:ListAllMyBuckets'],
      resources: ['*'],
    }));
    qsrole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        's3:ListBucket',
        's3:ListBucketMultipartUploads',
        's3:GetBucketLocation',
      ],
      resources: [
        spillbucket.bucketArn,
        outputBucket.bucketArn,
      ],
    }));
    qsrole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:GetObjectVersion',
        's3:PutObject',
        's3:AbortMultipartUpload',
        's3:ListMultipartUploadParts',
      ],
      resources: [
        spillbucket.bucketArn + '/*',
        outputBucket.bucketArn + '/*',
      ],
    }));
  }
}