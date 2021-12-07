const mongoose = require('mongoose');

const SnipetSchema = new mongoose.Schema({
  script: {
    type: String
  },
  type: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Snipet = mongoose.model('snipet', SnipetSchema);
