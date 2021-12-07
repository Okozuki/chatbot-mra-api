const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const connectDB = require('./config/db');



if (process.env.NODE_ENV !== 'production') {
  const livereload = require('livereload');
  const reload = livereload.createServer();
  reload.watch([__dirname + "/", __dirname + "/chatbot", __dirname + "/config", __dirname + "/routes"]);

}



const app = express();

// Connect Database
connectDB();

app.use(bodyParser.json());

app.use(cors());
app.options('*', cors());

// Define Routes
app.get('/', (req, res) => res.send('API Running..'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

require('./routes/dialogFlowRoutes')(app);
require('./routes/botRoutes')(app);


if (process.env.NODE_ENV === 'production') {
  // js and css files
  app.use(express.static('client/build'));

  // index.html for all page routes
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });

}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});