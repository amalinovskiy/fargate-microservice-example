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
    userPoolArn: string;
}

// Accounts with sample micro service infrastructure
export const SERVICE_ACCOUNTS: ServiceAccount[] = [
   { id: '271300360526', name: 'integ', region: 'us-west-2', stage: StageType.INTEG, userPoolArn: 'arn' },
   { id: '757760262163', name: 'prod', region: 'us-west-2', stage: StageType.PROD, userPoolArn: 'arn' },
]