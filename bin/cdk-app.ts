#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { ControlStack } from '../stacks/control-stack';
import { ServiceStack } from '../stacks/service-stack';
import { CONTROL_ACCOUNT, SERVICE_ACCOUNTS, ServiceAccount } from '../config/accounts'
import { SERVICES } from '../config/services'

const app = new cdk.App();

const controlStack = new ControlStack(app, 'control-stack', {
    stackName: 'control-stack',
    env: {
        region: CONTROL_ACCOUNT.region,
        account: CONTROL_ACCOUNT.id,
    },
});

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
            vpc: baseStack.vpc,
            cluster: baseStack.cluster,
            userPool: controlStack.userPool,
            userPoolClient: controlStack.userPoolClient,
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