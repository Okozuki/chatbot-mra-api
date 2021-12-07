const uuidv4 = require('uuid/v4');
const Profile = require('../models/Profile');
const User = require('../models/User');

module.exports = app => {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post('/api/events/new', async (req, res) => {
    const botId = req.body.bot;
    const type = req.body.type;

    if (botId) {
      if (type === "promptClick" || type === "greeterClick") {
        try {
          const profile = await Profile.findOne({ _id: botId });

          if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
          }


          res.send(null);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
        return;
      }
      return res.status(400).json({ msg: 'Event Type Not Found' });
    }
    return res.status(400).json({ msg: 'BotId Not Found' });
  });

  app.get('/api/bots/lang', async (req, res) => {

    res.send('fr');
  });

  app.get('/api/bots/:id', async (req, res) => {
    const botId = req.params.id;

    if (botId) {

      try {
        const profile = await Profile.findOne({ _id: botId });

        if (!profile) {
          return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json({
          active: true,
          agent: {
            apiVersion: "API_VERSION_V2",
            classificationThreshold: 0.3,
            defaultLanguageCode: "fr",
            displayName: "MonRepondeurAutomatique",
            enableLogging: true,
            matchMode: "MATCH_MODE_HYBRID",
            parent: "projects/monrepondeurautomatique-jdndph",
            timeZone: "Europe/Kaliningrad"
          },
          countConversations: 212,
          countDailyUsage: 0,
          countEvents: 77,
          createdAt: "2019-10-10T13:51:03.865Z",
          industry: "",
          installedOn: [
            "monrepondeurautomatique.com",
            "localhost:3000"
          ],
          name: "Bot 1",
          newBot: false,
          newZero: 0,
          newZeroEvents: 0,
          organization: "5d9f3730d7cba7a5d831a1f0",
          projectId: "monrepondeurautomatique-jdndph",
          prompts: [{
            command: "GOOGLE_ASSISTANT_WELCOME",
            message: "",
            type: "event",
            url: "/",
            _id: profile._id
          }],
          theme: {
            css: {
              chatBackground: "#fff",
              cuiMode: false,
              dimensionsWindowHeight: ".85",
              dimensionsWindowHeightRaw: 0.85,
              fontType: "Open Sans",
              greeterBackground: "#2894B2",
              greeterBorder: "#2894B2",
              greeterFontColor: "#2894B2",
              greeterHoverFillColor: "#404f73",
              greeterHoverFontColor: "#fff",
              greeterPromptBackground: "#fff",
              hoverFillColor: "#404f73",
              hoverFontColor: "#fff",
              primaryColor: "#2894B2",
              secondaryColor: "#fff",
              showMenu: true,
              showPoweredByMonRepondeurAuto: true,
              showPrompts: true,
              typingAnimationDots: "#2894B2",
              typingAnimationFill: "#f2f2f2",
              userBoxColor: "#2894B2",
              userResponseColor: "#fff",
              widgetShape: "50%"
            },
            images: {
              avatar: "https://www.monrepondeurautomatique.com/wp-content/uploads/2021/widgets/bot-icon-960_720.png",
              logo: "https://www.monrepondeurautomatique.com/wp-content/uploads/2021/widgets/bot-icon-960_720.png"
            }
          },
          updatedAt: "2021-10-28T22:40:44.170Z",
          website: "www.monrepondeurautomatique.com",
          _id: profile._id
        });

      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
      return;
    }
    return res.status(400).json({ msg: 'BotId Not Found' });
  });

  app.post('/api/session/bot/:id', async (req, res) => {
    const botId = req.params.id;

    if (botId) {

      try {
        const profile = await Profile.findOne({ _id: botId });

        if (!profile) {
          return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json({
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQ…Q0NH0.suJ6M_bAal3Dz70mTZ2ikXKH6pkegLa7IL9mSS6AdrA",
          sessionId: uuidv4()
        });

      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
      return;
    }

    return res.status(400).json({ msg: 'BotId Not Found' });
  });


}