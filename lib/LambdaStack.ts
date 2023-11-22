import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';


export class LambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // Erstellen Sie eine neue Lambda-Funktion, die die Dashboard-URL generiert
        const dashboardUrlFunction = new lambda.Function(this, 'DashboardUrlFunction', {
            runtime: lambda.Runtime.NODEJS_LATEST,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'dashboard.handler',
            environment: {
                DASHBOARD_ID: 'my_dashboard', // ändern Sie dies nach Bedarf
                AWS_ACCOUNT_ID: this.account,
            },
        });

        // Erstellen Sie eine neue API-Gateway-Ressource, die die Lambda-Funktion aufruft
        const dashboardUrlApi = new apigateway.LambdaRestApi(this, 'DashboardUrlApi', {
            handler: dashboardUrlFunction,
            proxy: false,
        });

        // Erstellen Sie eine neue GET-Methode für die API-Gateway-Ressource
        const dashboardUrlMethod = dashboardUrlApi.root.addMethod('GET');
    }
}