# AmpStack API

This project is the `ampstack-api`, which is a __Serverless Framework__ based __Serverless ExpressJS REST API__ implemented with AWS __API Gateway__ and __Lambda__.  The front end is implemented in [ampstack-ui]().

### Serverless Environment Variables

These are contained in the `.env.sample`, which should be renamed to `.env` and populated with the correct environment values, such as the REST API endpoint.

For multi-stage environments (Eg. dev/prod), name the `.emv` as `.env.<stage>`, such as `.env.prod`, and the `serverless.yml` will pickup the correct settings.

> Make sure to associate the correct Amplify Environment Cognito ARN with the correct stage, and also update the __VITE_EXPRESS_ENDPOINT__ in the Amplify __Environment Variables__ correctly for the associated backend.

```
COGNITO_ARN=arn:aws:cognito-idp:us-east-1:XXXXXXXXXX
ALLOW_ORIGIN=*
```

Adjust __ALLOW_ORIGIN__ to suit your front-end environment.  Set __COGNITO_ARN__ to the user pool ARN established in the [ampstack-ui]() front-end.

#### Local DynamoDB

```
sls dynamodb install
```
