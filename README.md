<h1 align="center">PAYMENT-MANAGER-TOOLS</h1>



## Overview



This repository is used to deal with the system routines and for configuring the  cloud computing services.



## Technologies



 - [Nodejs (v 14.17)](https://nodejs.org/en/)
 - [npm](https://www.npmjs.com/)
 - [AWS Cloud​Formation](https://aws.amazon.com/cloudformation/)
 - [Serverless Framework](https://www.serverless.com/)
 - [DynamoDB](https://aws.amazon.com/dynamodb)
 - [AWS lambda](https://aws.amazon.com/lambda)
 - [Amazon Cognito](https://aws.amazon.com/cognito/)
 - [Amazon SNS](https://aws.amazon.com/sns)
 - [AWS-SDK](https://www.npmjs.com/package/aws-sdk)
 - [ESLint](https://www.npmjs.com/package/eslint)




## Related Repositories  

 - [PAYMENT-MANEGER-CORE_API](https://github.com/gabrielmissio/payment-manager-core-api)
 - [PAYMENT-MANEGER-AUTH_API](https://github.com/gabrielmissio/payment-manager-auth-api) 




## Project anatomy




```
routines                          → Application routines
  └ payment-notification-routine     → Payment notification routine
    └ ...                              → Other files 
    └ README                           → Routine deployment instructions
stacks                            → Application stacks
  └ cognito-user-pool                → Cognito user pool stack
  └ dynamodb-table                   → DyanamoDB table stack
  └ sns-topics                       → SNS topics stack
  └ README                           → Stacks deployment instructions
 ```




## License




[LICENSE](/LICENSE)
