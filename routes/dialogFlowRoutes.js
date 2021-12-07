const chatbot = require('../chatbot/chatbot');
const config = require('../config/keys');
const { structProtoToJson } = require('../chatbot/structjson');
module.exports = app => {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


    next();
  });

  app.post('/api/df_text_query', async (req, res) => {
    try {
      console.log(req.body)

      const responses = await chatbot.textQuery(req.body.query, req.body.sessionId, req.body.parameters);

      responses[0].queryResult.webhookPayload = responses[0].queryResult.webhookPayload ? structProtoToJson(responses[0].queryResult.webhookPayload) : responses[0].queryResult.webhookPayload;

      console.log(responses[0].queryResult);

      res.send(responses[0].queryResult);

    } catch (error) {
      console.log(error);
      res.send(error);
    }



  });

  app.post('/api/df_event_query', async (req, res) => {
    try {
      console.log("BodyRequest: ", req.body)

      const responses = await chatbot.eventQuery(req.body.event, req.body.sessionId, req.body.parameters);

      responses[0].queryResult.webhookPayload = responses[0].queryResult.webhookPayload ? structProtoToJson(responses[0].queryResult.webhookPayload) : responses[0].queryResult.webhookPayload;

      console.log(responses[0].queryResult);

      res.send(responses[0].queryResult);
    } catch (error) {
      console.log(error);
      res.send(error);
    }

  });
}