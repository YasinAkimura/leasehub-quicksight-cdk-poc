import * as cdk from 'aws-cdk-lib';
import * as qs from 'aws-cdk-lib/aws-quicksight';
import { Construct } from 'constructs';

export interface QSChartsStackProps extends cdk.StackProps {
    // readonly prodEnvId: string;
}
export class QSChartsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: QSChartsStackProps) {
        super(scope, id, props);

        const dataSource = new qs.CfnDataSource(this, 'QSDataSource', {
            awsAccountId: this.account,
            dataSourceId: 'qs-datasource',
            name: 'My DataSource',
            type: 'ATHENA',
            dataSourceParameters: {
                athenaParameters: {
                    workGroup: 'ddbworkgroup',
                },
            },
            permissions: [{
                principal: `arn:aws:quicksight:${this.region}:${this.account}:user/default/${this.account}`, // change this as needed
                actions: ['quicksight:DescribeDataSource', 'quicksight:DescribeDataSourcePermissions', 'quicksight:PassDataSource'],
            }]
        })
        const dataSet = new qs.CfnDataSet(this, 'QSDataSet', {
            awsAccountId: cdk.Aws.ACCOUNT_ID,
            dataSetId: 'leasehub-one', // change this as needed
            name: 'First DataSet', // change this as needed
            importMode: 'SPICE',
            physicalTableMap: {
                my_table: {
                    s3Source: {
                        dataSourceArn: dataSource.attrArn,
                        inputColumns: [
                            {
                                name: 'id',
                                type: 'STRING'
                            },
                            {
                                name: 'city',
                                type: 'STRING'
                            },
                            {
                                name: 'temperature',
                                type: 'INTEGER'
                            },
                            {
                                name: 'date',
                                type: 'DATETIME'
                            }
                        ],
                    }
                },
            },
            permissions: [
                {
                    principal: `arn:aws:quicksight:${this.region}:${this.account}:user/default/${this.account}/default`, // change this as needed
                    actions: ['quicksight:UpdateDataSetPermissions', 'quicksight:DescribeDataSet', 'quicksight:DescribeDataSetPermissions', 'quicksight:PassDataSet', 'quicksight:DescribeIngestion', 'quicksight:ListIngestions', 'quicksight:UpdateDataSet', 'quicksight:DeleteDataSet', 'quicksight:CreateIngestion', 'quicksight:CancelIngestion'],
                },
            ],
        });
        const analysis = new qs.CfnAnalysis(this, 'QSAnalysis', {
            awsAccountId: this.account,
            analysisId: 'my_analysis', // ändern Sie dies nach Bedarf
            name: 'My Analysis', // ändern Sie dies nach Bedarf
            definition: {
                dataSetIdentifierDeclarations: [
                    {
                        dataSetArn: dataSet.attrArn,
                        identifier: 'leasehub-one'
                    }
                ],
            }
        })
        const template = new qs.CfnTemplate(this, 'Template', {
            awsAccountId: cdk.Aws.ACCOUNT_ID,
            templateId: 'my_template', // ändern Sie dies nach Bedarf
            name: 'My Template', // ändern Sie dies nach Bedarf
            sourceEntity: {
              sourceAnalysis: {
                arn: analysis.attrArn, // ändern Sie dies nach Bedarf
                dataSetReferences: [
                  {
                    dataSetArn: dataSet.attrArn,
                    dataSetPlaceholder: 'my_data_set',
                  },
                ],
              },
            },
            permissions: [
              {
                principal: `arn:aws:quicksight:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:user/default/${cdk.Aws.ACCOUNT_ID}/default`, // ändern Sie dies nach Bedarf
                actions: ['quicksight:DescribeTemplate', 'quicksight:ListTemplateVersions', 'quicksight:UpdateTemplatePermissions', 'quicksight:DeleteTemplate', 'quicksight:DescribeTemplatePermissions', 'quicksight:UpdateTemplate', 'quicksight:UpdateTemplateAlias', 'quicksight:DeleteTemplateAlias', 'quicksight:DescribeTemplateAlias'],
              },
            ],
          });
        const dashboard = new qs.CfnDashboard(this, 'Dashboard', {
            awsAccountId: this.account,
            dashboardId: 'my_dashboard', // change this as needed
            name: 'My Dashboard', // change this as needed
            sourceEntity: {
                sourceTemplate: {
                    arn: template.attrArn, // change this as needed
                    dataSetReferences: [
                        {
                            dataSetArn: dataSet.attrArn,
                            dataSetPlaceholder: 'my_data_set',
                        },
                    ],
                },
            },
            permissions: [
                {
                    principal: `arn:aws:quicksight:${this.region}:${this.account}:user/default/${this.account}/default`, // change this as needed
                    actions: ['quicksight:DescribeDashboard', 'quicksight:ListDashboardVersions', 'quicksight:UpdateDashboardPermissions', 'quicksight:QueryDashboard', 'quicksight:UpdateDashboard', 'quicksight:DeleteDashboard', 'quicksight:DescribeDashboardPermissions', 'quicksight:UpdateDashboardPublishedVersion'],
                },
            ],
        });
    }
}