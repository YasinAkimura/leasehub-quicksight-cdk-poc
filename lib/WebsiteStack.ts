import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'

export class WebsiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);
        // Create a S3 bucket for the website
        const bucket = new s3.Bucket(this, 'WebsiteBucket', {
            bucketName: 'website-bucket',
            websiteIndexDocument: 'index.html', // Set the index document
            publicReadAccess: true, // Allow public read access
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete the bucket when the stack is deleted
        });

        // Upload the index.html file to the bucket
        new s3deploy.BucketDeployment(this, 'WebsiteDeployment', {
            sources: [s3deploy.Source.asset('./web')], // The folder containing the index.html file
            destinationBucket: bucket, // The bucket to upload to
        });

    }
}