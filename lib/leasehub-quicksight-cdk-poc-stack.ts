import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AthenaDynamoDbStack } from './AthenaDynamoDbStack';
import { QSChartsStack } from './QuickSightChartsStack';
import { LambdaStack } from './LambdaStack';
import { WebsiteStack } from './WebsiteStack';

const DYNAMO_TABLE_NAME = "LeaseHub-POC-DynamoTable";
export class LeasehubQuicksightCdkPocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AthenaDynamoDbStack(this, 'AthenaStack', {tableName: DYNAMO_TABLE_NAME})
    new QSChartsStack(this, 'QuickSightDevStack', {
    })
    new LambdaStack(this, 'LambdaStack', { })
    new WebsiteStack(this, 'QSWebsiteStack', {})
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'LeasehubQuicksightCdkPocQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
