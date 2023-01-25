aws sts assume-role --role-arn "arn:aws:iam::$1:role/OrganizationAccountAccessRole" --role-session-name DeploySession > .aws_session
AWS_ACCESS_KEY_ID=$(cat .aws_session | jq -r .Credentials.AccessKeyId)
AWS_ACCESS_KEY_SECRET=$(cat .aws_session | jq -r .Credentials.SecretAccessKey)
AWS_SESSION_TOKEN=$(cat .aws_session | jq -r .Credentials.SessionToken)

cp ~/.aws/credentials ~/.aws/credentials.bak
printf '[default]
aws_access_key_id = %s
aws_secret_access_key = %s
aws_session_token = %s
' $AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY_SECRET $AWS_SESSION_TOKEN > ~/.aws/credentials

cdk deploy

# Bring back original credentials
cp ~/.aws/credentials.bak ~/.aws/credentials

