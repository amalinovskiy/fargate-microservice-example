# Example Fargate Service

Describes and deploys an example microservice based on fargate platform

## Directory structure

* `bin` - contains main app file which is responsible for creation of all the CloudFormation stacks defined in the project
* `config` - configuration for CloudFormation stacks
* `stacks` - CloudFormation stack definition (currently contains only service-base stack with vpc and cluster deinition and service stack - with a a basic infrastructure for a service consisting of api gateway which authorises requests against a user pool, which is connected to a redundant fargate service behind a load balancer).

## Project assumption

* there are 2 accounts - integ and prod for service deployment, which are members of a same organisation as root account
* the admin role for organisation is AWS default one - OrganizationAccountAccessRole
* user pool and user pool clients are already created via [Cognito Example](https://github.com/amalinovskiy/cognito-cdk-example)



## Development environment installation

Infrastructure is defined using [CDK](https://aws.amazon.com/cdk/) with TypeScript and NodeJS. To synth stack (compile 
TypeScript code into [CloudFormation](https://aws.amazon.com/cloudformation/)) definitions locally you need to:

* Install NodeJS 18
* Install CDK toolkit `npm install -g aws-cdk`
* Install type script `npm install -g typescript`
* Run `npm install` in project root 
* Run `cdk synth` to synch the CloudFormation stacks

> **Important!** Developer who is working on AWS infrastructure needs to be registered in the root account and have assume role permissions for OrganizationAccountAccessRole on integ and prod accounts.
Example of assume role policy giving the users ability to assume OrganizationAccountAccessRole:

    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": "arn:aws:iam::ACCOUNT_ID:role/OrganizationAccountAccessRole"
            }
        ]
    }
    ```

## Bootstrap CDK 

CDK infrastructure needs to be bootstrapped once per account, it creates a dedicated CloudFormation stack with all required resources.

To bootstrap the insfrastructure run:

```
./bootstrap.sh $ACCOUNT-NUMBER $REGION
```


## Deploying Infrastructure

Run 

```
./deploy.sh $ACCOUNT-NUMBER $REGION $STACK-NAME $USER-POOL-ARN $USER-POOL-CLIENT-ID
```

That's all infrastructure changes (or new infrastucture) will be automatically deployed.