# stacks

## deploy DynamoDB table

```bash
aws --region <REGION> cloudformation create-stack --stack-name payment-manager-table-<STAGE> --template-body file://stacks/dynamodb-table.yaml --parameters ParameterKey=StageName,ParameterValue=<STAGE>
```

## deploy Cognito user pool and user pool client

```bash
aws --region <REGION> cloudformation create-stack --stack-name payment-manager-user-pool-<STAGE> --template-body file://stacks/cognito-user-pool.yaml --parameters ParameterKey=StageName,ParameterValue=<STAGE>
```

## signup user

```bash
aws cognito-idp admin-create-user --user-pool-id <USER_POOL_ID> --username <USERNAME> --user-attributes "Name"="email_verified","Value"="true" "Name"="email","Value"="yourv@mail.com"
```

## deploy SNS topics

```bash
aws --region us-east-1 cloudformation create-stack --stack-name payment-manager-topics-dev --template-body file://stacks/sns-topics.yaml --parameters ParameterKey=StageName,ParameterValue=dev
```
