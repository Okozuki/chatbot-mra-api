'use strict';
const dialogflow = require('dialogflow');
const structjson = require('./structjson');
const config = require('../config/keys');

const projectID = config.googleProjectID;

const credentials = {
  client_email: config.googleClientEmail,
  private_key: config.googlePrivateKey
}


const sessionClient = new dialogflow.SessionsClient({
  projectID,
  credentials
});



module.exports = {
  textQuery: async function (text, userID, parameters = {}) {
    let sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID + userID);

    let self = module.exports;
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: text,
          // The language used by the client (en-US)
          languageCode: config.dialogFlowSessionLanguageCode
        }
      },
      queryParams: {
        payload: {
          data: parameters
        }
      }
    };

    // Send request and log result
    try {
      let responses = await sessionClient.detectIntent(request);
      console.log('Detected intent');
      let result = responses[0].queryResult;

      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
      } else {
        console.log(`  No intent matched.`);
      }

      responses = await self.handleAction(responses);
      return responses;
    } catch (err) {
      console.log(err);
    }

  },

  eventQuery: async function (event, userID, parameters = {}) {
    let sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID + userID);
    let self = module.exports;
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        event: {
          // The query to send to the dialogflow agent
          name: event,
          parameters: structjson.jsonToStructProto(parameters),
          // The language used by the client (en-US)
          languageCode: config.dialogFlowSessionLanguageCode
        }
      }
    };

    // Send request and log result
    try {
      let responses = await sessionClient.detectIntent(request);
      console.log('Detected intent');
      let result = responses[0].queryResult;

      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
      } else {
        console.log(`  No intent matched.`);
      }

      responses = await self.handleAction(responses);
      return responses;
    } catch (err) {
      console.log(err);
    }

  },

  handleAction: function (responses) {
    return responses;
  }
}