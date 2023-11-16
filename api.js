const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const AWS = require('aws-sdk');

const app = express()
 
const USERS_TABLE = process.env.USERS_TABLE;
const QUOTES_TABLE = process.env.QUOTES_TABLE;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN;
 
console.info(`USERS_TABLE: ${USERS_TABLE}`);
console.info(`QUOTES_TABLE: ${QUOTES_TABLE}`);

const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  console.info(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
};

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Credentials", true)
  next()
});

app.use(bodyParser.json({ strict: false }));

app.get('/users/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
})

app.post('/users', function (req, res) {
  const { userId, email } = req.body;

  console.info("User POST Request");
  console.debug(req);

  if(req.requestContext.authorizer && req.requestContext.authorizer.claims) {
    const username = req.requestContext.authorizer.claims['cognito:username'];
    console.info(`Authenicated Username: ${username}`);
    if(username !== userId) {
      res.status(400).json({ error: 'Not authorized to update other users' });
    }
  }

  if (!userId) {
    res.status(400).json({ error: '"userId" must be specified' });
  }
  if (!email) {
    res.status(400).json({ error: '"email" must be specified' });
  }

  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof email !== 'string') {
    res.status(400).json({ error: '"email" must be a string' });
  }  
  
  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      email: email,
      lastWorkspaceIp: undefined,
      lastWorkspaceDate: Date(),
      providerType: undefined,
      providerId: undefined
    },
  };

  if(req.requestContext.authorizer && req.requestContext.authorizer.claims) {
    const username = req.requestContext.authorizer.claims['cognito:username'];
    console.info(`Authenicated Username: ${username}`);

    try{
      params.Item.lastWorkspaceIp = req.client.remoteAddress;

      console.debug("identities:");
      console.debug(req.requestContext.authorizer.claims.identities);
      const claims = JSON.parse(req.requestContext.authorizer.claims.identities);

      console.debug("claims:");
      console.debug(claims);

      params.Item.providerType = claims.providerType;  
      params.Item.providerId = claims.userId;  

    } catch(error) {
      console.error("Unable to set user meta properties");
      console.error(error);
    }
  }

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      res.status(400).json({ error: 'Could not create user' });
    }
    res.json(params.Item);
  });
})

app.get('/quotes/:quoteId', function (req, res) {
  console.info(`Quote(s) GET Request: ${req.params.quoteId}`);

  const params = {
    TableName: QUOTES_TABLE,
  };

  if(req.params.quoteId !== "all") {
    params.Key = {
      quoteId: req.params.quoteId,
    };
  
    dynamoDb.get(params, (error, result) => {
      if (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
      }
      if (result.Item) {
        res.json(result.Item);
      } else {
        res.status(404).json({ error: "Quotes not found!" });
      }
    });
  } else {
    dynamoDb.scan(params, (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
      }
      if (result.Items) {
        res.json(result.Items);
      } else {
        res.status(404).json({ error: "Quote not found" });
      }
    });
  }
})

app.post('/quotes', function (req, res) {
  const { quoteId, text, author, submittedBy } = req.body;

  console.info("Quote POST Request");

  if(req.requestContext.authorizer && req.requestContext.authorizer.claims) {
    const username = req.requestContext.authorizer.claims['cognito:username'];
    console.info(`Authenicated Username: ${username}`);

    if(username !== submittedBy) {
      res.status(400).json({ error: 'You can only update quotes you have submitted.' });      
    }
  }

  if (!quoteId) {
    res.status(400).json({ error: '"quoteId" must be specified' });
  }
  if (!text) {
    res.status(400).json({ error: '"text" must be specified' });
  }
  if (!submittedBy) {
    res.status(400).json({ error: '"submittedBy" must be specified' });
  }

  let adjustedAuthor = author !== undefined ? author : "";

  if (typeof quoteId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof text !== 'string') {
    res.status(400).json({ error: '"text" must be a string' });
  } else if (typeof adjustedAuthor !== 'string') {
    res.status(400).json({ error: '"author" must be a string' });
  } else if (typeof submittedBy !== 'string') {
    res.status(400).json({ error: '"submittedBy" must be a string' });
  }

  const params = {
    TableName: QUOTES_TABLE,
    Item: {
      quoteId: quoteId,
      text: text,
      author: author !== undefined ? author : "",
      submittedBy: submittedBy,
      submittedDate: Date()
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
    res.json(params.Item);
  });
})

app.delete("/quotes/:quoteId", function (req, res) {
  console.log("Quote DELETE Request");

  if (!req.params.quoteId) {
    res.status(400).json({ error: '"quoteId" must be specified' });
  }

  const params = {
    TableName: QUOTES_TABLE,
    Key: {
      quoteId: req.params.quoteId
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
    if (result.Item) {
      if(req.requestContext.authorizer && req.requestContext.authorizer.claims) {
        const username = req.requestContext.authorizer.claims['cognito:username'];
        console.info(`Authenicated Username: ${username}`);
    
        if(username !== result.Item.submittedBy) {
          res.status(400).json({ error: 'You can only delete quotes you have submitted.' });      
        }
      }
      dynamoDb.delete(params, (error, data) => {
        if (error) {
          console.error(error);
          res.status(400).json({ error: error.message });
        }
        res.json(data);
      });
    } else {
      res.status(404).json({ error: "Quote not found!" });
    }
  });
})

module.exports.handler = serverless(app);