import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

import { ServiceAccount, CONTROL_ACCOUNT } from '../config/accounts';

interface ServiceBaseProps extends cdk.StackProps {
    account: ServiceAccount;
}

export class ServiceBaseStack extends cdk.Stack {
    public vpc!: ec2.Vpc;
    public cluster!: ecs.Cluster;

    constructor(scope: cdk.App, id: string, props: ServiceBaseProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'vpc', {
            maxAzs: 3,
            natGateways: 1,
            subnetConfiguration: [
                { name: 'isolated-subnet', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
                { name: 'private-subnet', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
                { name: 'public-subnet', subnetType: ec2.SubnetType.PUBLIC },
            ],
        });

        this.cluster = new ecs.Cluster(this, 'common-cluster', {
            vpc: this.vpc,
        });        
    }
}