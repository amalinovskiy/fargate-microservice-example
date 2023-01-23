export enum StageType {
    PERSONAL = 'personal',
    INTEG = 'integ',
    PROD = 'prod',
}

export interface ServiceAccount {
    id: string;
    name: string;
    region: string;
    stage: StageType;
}

// Account with Authz infrastructure
export const CONTROL_ACCOUNT = { 
    id: '207722082920', 
    region: 'us-west-2', 
    userPoolArn: 'arn:aws:cognito-idp:us-east-1:123412341234:userpool/us-east-1_123412341',
}

// Accounts with sample micro service infrastructure
export const SERVICE_ACCOUNTS: ServiceAccount[] = [
   { id: '271300360526', name: 'integ', region: 'us-west-2', stage: StageType.INTEG },
   { id: '757760262163', name: 'prod', region: 'us-west-2', stage: StageType.PROD },
]