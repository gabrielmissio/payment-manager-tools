
<h1 align="center">PAYMENT-NOTIFICATION-ROUTINE</h1>



## Overview



This routine deals with the sending payment notifications (alerts of late payment, alerts of defaults, etc...)




## Technologies



 - [Nodejs (v 14.17)](https://nodejs.org/en/)
 - [npm](https://www.npmjs.com/)
 - [Serverless Framework](https://www.serverless.com/)
 - [DynamoDB](https://aws.amazon.com/dynamodb)
 - [Amazon SNS](https://aws.amazon.com/sns)
 - [AWS lambda](https://aws.amazon.com/lambda)
 - [AWS-SDK](https://www.npmjs.com/package/aws-sdk)
 - [ESLint](https://www.npmjs.com/package/eslint)




## Project anatomy



```
app
 └ node_modules (generated)         → NPM dependencies
 └ src                              → Application sources 
    └ domain                           → Application services layer
       └ services                         → Application business rules 
    └ infra                            → Application infrastructure layer
       └ adapters                         → Conuciation contracts between the domain layer and the infrastructure layer
       └ helpers                          → Database implementation helpers
       └ migrations                       → Script to create and delete dyanmodbLocal tables
       └ repositories                     → Database operations
       └ seeders                          → Script to put and delete dyanmodbLocal items
    └ main                             → Application main layer
       └ config                           → config
    └ presentation                     → Application presentation layer
       └ controllers                      → Application requests handler
       └ helpers                          → Presentation helpers
    └ utils                            → Application utils
       └ enums                            → enums
       └ errors                           → errors
 └ index-app.js                         → Application entry point
 └ ...                                  → Other files
 ```




## Install dependencies



```bash
npm install
```



## License



[LICENSE](/LICENSE)
