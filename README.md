# AmpStack API

This project is the `AmpStack API`, which is a __Serverless Framework__ based __Serverless ExpressJS REST API__ implemented with AWS __API Gateway__ and __Lambda__.  The front end is implemented in [AmpStack API](https://github.com/ids/ampstack-ui). See the other READMEs for more details.

### Serverless Environment Variables

These are contained in the `.env.sample`, which should be renamed to `.env` and populated with the correct environment values, such as the REST API endpoint.

For multi-stage environments (Eg. dev/prod), name the `.emv` as `.env.<stage>`, such as `.env.prod`, and the `serverless.yml` will pickup the correct settings with you specify, eg. `sls deploy --env dev`.

> Make sure to associate the correct Amplify Environment Cognito ARN with the correct stage, and also update the __VITE_EXPRESS_ENDPOINT__ in the Amplify UI __Environment Variables__ correctly for the associated backend.

### Cognito User Pools
If you only have a single front-end environment, you will only need the `COGNITO_ARN0` specified.

Adjust the env.<stage> file with the correct __Amplify__ Cognito User Pool ARN:
```
COGNITO_ARN0=arn:aws:cognito-idp:us-east-1:XXXXXXXXXX
ALLOW_ORIGIN=*
```

Adjust the `serverless.yml` file, commenting out the extra `COGNITO(n)` lines:
```
        ProviderARNs:
          - ${env:COGNITO_ARN0}
#         - ${env:COGNITO_ARN1}
#          ${env:COGNITO_ARN2}
#          ${env:COGNITO_ARN3}
```

#### Multiple Amplify Front-Ends to Single API Backend
For cases where you have several environments all wishing to make use of the same backend, multiple Cognito ARNS must be specified.  This seems to be because a single Amplify Front-End can't share the same Cognito User Pool with a different redirect URL.  At the present time the solution is to have the API Gateway custom Authorizer use multiple Cognito User Pools.

Adjust the env.<stage> file with the correct __Amplify__ Cognito User Pool ARNs:
```
COGNITO_ARN0=arn:aws:cognito-idp:us-east-1:XXXXXXXXXX
COGNIT1_ARN0=arn:aws:cognito-idp:us-east-1:SOMEOTHERPOOL
ALLOW_ORIGIN=*
```

Adjust the `serverless.yml` file, commenting out the extra `COGNITO(n)` lines, but also ensuring the correct lines are uncommented:
```
        ProviderARNs:
          - ${env:COGNITO_ARN0}
          - ${env:COGNITO_ARN1}
#          ${env:COGNITO_ARN2}
#          ${env:COGNITO_ARN3}
```

### Allow Origin
Adjust __ALLOW_ORIGIN__ to suit your front-end environment.  S

#### Local DynamoDB
It is handy to use the local DynamoDB for debugging when developing.

```
sls dynamodb install
```

Other `sls` related `dynamodb` plugin commands are available with `sls help`
