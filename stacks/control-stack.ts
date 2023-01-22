import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';

import { SERVICE_ACCOUNTS } from '../config/accounts';
import { SERVICES } from '../config/services';

const PREFIX = 'example'

export class ControlStack extends cdk.Stack {
    public userPool: cognito.UserPool;
    public userPoolClient: cognito.UserPoolClient;

    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, `${PREFIX}-service-userpool`, {
            userPoolName: `${PREFIX}-services`,
            selfSignUpEnabled: false,
        });

        const domainName = this.userPool.addDomain('domain-name', {
            cognitoDomain: {
                domainPrefix: `${PREFIX}-services`
            }
        });

        const resourceScopes: cognito.ResourceServerScope[] = [];
        for (let i = 0; i < SERVICE_ACCOUNTS.length; i++) {
            var account = SERVICE_ACCOUNTS[i];
            SERVICES.map(service => {
                resourceScopes.push(
                    { scopeName: `${service.name}-${account.name}`, scopeDescription: `access to ${service.name} on ${account.name}`}
                );
            });
        }

        const resourceServer: cognito.IUserPoolResourceServer = this.userPool.addResourceServer('resource-server', {
            userPoolResourceServerName: `${PREFIX}-services`,
            identifier: `${PREFIX}-services`,
            scopes: resourceScopes,
        });

        const oauthScopes: cognito.OAuthScope[] = [];
        for (let i = 0; i < SERVICE_ACCOUNTS.length; i++) {
            for (let j = 0; j < SERVICES.length; j++) {
                const oauthScope = cognito.OAuthScope.resourceServer(
                    resourceServer, resourceScopes[i*SERVICES.length + j]
                );
                oauthScopes.push(oauthScope);
            }
        }

        this.userPoolClient = this.userPool.addClient(`${PREFIX}-service-userpool`, {
            userPoolClientName: `${PREFIX}-service-oauth-client`,
            idTokenValidity: cdk.Duration.days(1),
            accessTokenValidity: cdk.Duration.days(1),
            authFlows: {
                userPassword: false,
                userSrp: false,
                custom: true,
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: false,
                    implicitCodeGrant: false,
                    clientCredentials: true,
                },
                scopes: oauthScopes,
            },
            preventUserExistenceErrors: true,
            generateSecret: true,
        });

        new cdk.CfnOutput(this, 'service-auth-domain-name', {
            value: `https://${domainName.domainName}.auth.${props.env!.region}.amazoncognito.com`,
        });

        new cdk.CfnOutput(this, 'service-user-pool', {
            value: this.userPool.userPoolArn,
        });
    }
}