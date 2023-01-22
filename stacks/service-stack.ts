import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apigateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import { HttpAlbIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';

import { ServiceAccount, CONTROL_ACCOUNT } from '../config/accounts';

interface ServiceProps extends cdk.StackProps {
    name: string;
    account: ServiceAccount;
    vpc: ec2.Vpc;
    cluster: ecs.Cluster;
    userPool: cognito.UserPool;
    userPoolClient: cognito.UserPoolClient;
}

export class ServiceStack extends cdk.Stack {
    private name: string;
    private loadBalancer!: elb.ApplicationLoadBalancer;
    private loadBalancerListener!: elb.ApplicationListener;
    private httpApi!: apigateway.HttpApi;

    constructor(scope: cdk.App, id: string, props: ServiceProps) {
        super(scope, id, props);
        this.name = props.name;

        this.setupLoadBalancer(props.vpc);
        this.setupFargateService(props.vpc);
        this.setupApiGateway(props.userPool, props.userPoolClient, `${this.name}-${props.account.name}`);

        new cdk.CfnOutput(this, `${this.name}-api-endpoint`, {
            value: this.httpApi.apiEndpoint,
        });
    }

    private setupLoadBalancer(vpc: ec2.Vpc) {
        const internalLoadBalancerSecurityGroup = new ec2.SecurityGroup(this, `${this.name}-alb-sg`, {
            vpc: vpc,
        });

        // it is an internal group, no need for ip rules
        internalLoadBalancerSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
        this.loadBalancer = new elb.ApplicationLoadBalancer(this, `${this.name}-alb`, {
            vpc,
            internetFacing: false,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            securityGroup: internalLoadBalancerSecurityGroup,
        });
    }

    private setupFargateService(vpc: ec2.Vpc) {
        // Setting up service security groups, they are not public internet facing 
        // and can only be accessed by port 80
        const selectedSubnets = vpc.selectSubnets({
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        });

        const taskSecurityGroup = new ec2.SecurityGroup(this, `${this.name}-instance-sg`, {
            vpc: vpc,
        });

        for (const privateSubnet of selectedSubnets.subnets) {
            taskSecurityGroup.addIngressRule(ec2.Peer.ipv4(privateSubnet.ipv4CidrBlock), ec2.Port.tcp(80));
        }
    }

    private setupApiGateway(userPool: cognito.UserPool, userPoolClient: cognito.UserPoolClient, scopeName: string) {
        const cognitoAuthorizer = new HttpUserPoolAuthorizer(`${this.name}-authorizer`, userPool, {
            userPoolClients: [userPoolClient],
            userPoolRegion: CONTROL_ACCOUNT.region,
            identitySource: ['$request.header.Authorization'],
        });

        this.httpApi = new apigateway.HttpApi(this, `${this.name}-api`, {
            defaultIntegration: new HttpAlbIntegration(`${this.name}-alb-integration`, this.loadBalancerListener),
            defaultAuthorizer: cognitoAuthorizer,
            defaultAuthorizationScopes: ['example-services/' + scopeName],
        });
    }
}