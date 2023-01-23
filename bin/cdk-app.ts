#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { ServiceStack } from '../stacks/service-stack';
import { ServiceBaseStack } from '../stacks/service-base-stack';
import { SERVICE_ACCOUNTS, ServiceAccount } from '../config/accounts'
import { SERVICES } from '../config/services'

const app = new cdk.App();

function createServiceAccountInfrastructure(account: ServiceAccount) {
    const baseStack = new ServiceBaseStack(app, `service-base-${account.name}`, {
        stackName: `service-base-${account.name}`,
        account: account,
        env: {
            region: account.region,
            account: account.id,
        },
    });

    SERVICES.map(service => {
        new ServiceStack(app, `service-${service.name}-${account.name}`, {
            stackName: `service-${service.name}-${account.name}`,
            account: account,
            name: service.name,
            vpc: baseStack.vpc,
            cluster: baseStack.cluster,
            userPoolArn: account.userPoolArn,
            userPoolClientId: service.userPoolClientId,
            env: {
                region: account.region,
                account: account.id,
            },
        });
    });
}

SERVICE_ACCOUNTS.forEach((account) => {
    createServiceAccountInfrastructure(account);
});