
  

<h1  align="center">STACKS</h1>

  
  
  

## Overview

  
  
  

Cloudformation templates responsible for configuring the cloud computing services used by the application.
  
  
  
  

## Technologies

  
  
  
- [AWS Cloud​Formation](https://aws.amazon.com/cloudformation/)

- [AWS-CLI](https://aws.amazon.com/cli/)

- [yaml](https://yaml.org/)

- [DynamoDB](https://aws.amazon.com/dynamodb)

- [Amazon Cognito](https://aws.amazon.com/cognito/)

- [Amazon SNS](https://aws.amazon.com/sns)

  
  
  

## Deployment instructions  
  

### deploy DynamoDB table

  

```bash

aws --region <REGION> cloudformation create-stack --stack-name payment-manager-table-<STAGE> --template-body file://stacks/dynamodb-table.yaml --parameters ParameterKey=StageName,ParameterValue=<STAGE>

```

  

### deploy Cognito user pool and user pool client

  

```bash

aws --region <REGION> cloudformation create-stack --stack-name payment-manager-user-pool-<STAGE> --template-body file://stacks/cognito-user-pool.yaml --parameters ParameterKey=StageName,ParameterValue=<STAGE>

```

  

### signup user

  

```bash

aws cognito-idp admin-create-user --user-pool-id <USER_POOL_ID> --username <USERNAME> --user-attributes "Name"="email_verified","Value"="true"  "Name"="email","Value"="yourv@mail.com"

```

  

### deploy SNS topics

  

```bash

aws --region us-east-1 cloudformation create-stack --stack-name payment-manager-topics-dev --template-body file://stacks/sns-topics.yaml --parameters ParameterKey=StageName,ParameterValue=dev

```
  
  
  

## License

  
  
  

[LICENSE](/LICENSE)