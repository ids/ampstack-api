#! /bin/bash

# Make sure to set the AMPSTACK_ENDPOINT
#
# AMPSTACK_ENDPOINT=http://localhost:3000/dev/quotes bash seed.sh
# AMPSTACK_ENDPOINT=https://2hogmlccyl.execute-api.us-east-1.amazonaws.com/dev/quotes bash seed.sh
# AMPSTACK_ENDPOINT=https://j3ckn61tsg.execute-api.us-east-1.amazonaws.com/prod/quotes bash seed.sh
#
# Remember to deploy without authentication to Cognito for seeding or this won't work

echo $AMPSTACK_ENDPOINT

echo "Pusing up 4 sample Quote records"

curl -H "Content-Type: application/json" -X \
  POST $AMPSTACK_ENDPOINT \
  -d $'{"quoteId": "f07ac3e4-54c0-436e-855f-4ef906051c65", "text": "If you tell the truth, you don\'t have to remember __anything__", "author": "Mark Twain", "submittedBy": "system" }'

curl -H "Content-Type: application/json" -X \
  POST $AMPSTACK_ENDPOINT \
  -d '{"quoteId": "6cfbcb09-ccb8-4fc7-9050-af9e04d08993", "text": "Sometimes the questions are complicated and the answers are simple.", "author": "Dr. Suess", "submittedBy": "system" }'

curl -H "Content-Type: application/json" -X \
  POST $AMPSTACK_ENDPOINT \
  -d '{"quoteId": "5cec8be4-6673-400b-8d41-8f653a5d2e80", "text": "A rich man is nothing but a __poor man__ with money.", "author": "W.C. Fields", "submittedBy": "system" }'

curl -H "Content-Type: application/json" -X \
  POST $AMPSTACK_ENDPOINT \
  -d '{"quoteId": "11e314e9-2a0f-4b9a-aeee-62027fae4aee", "text": "Computers are Dumb.", "author": "Sean Hignett", "submittedBy": "system" }'

echo ""
echo ""
echo "Fetching All the Quote records"
curl -H "Content-Type: application/json" -X GET $AMPSTACK_ENDPOINT/all
echo ""

echo ""
echo "Fetching the Dr. Suess Records"
curl -H "Content-Type: application/json" -X GET $AMPSTACK_ENDPOINT/6cfbcb09-ccb8-4fc7-9050-af9e04d08993
echo ""

echo ""
echo "Deleting the last one"
curl -H "Content-Type: application/json" -X DELETE $AMPSTACK_ENDPOINT/11e314e9-2a0f-4b9a-aeee-62027fae4aee
echo ""

echo ""
echo ""
echo "Fetching All the Quote records"
curl -H "Content-Type: application/json" -X GET $AMPSTACK_ENDPOINT/all
echo ""
