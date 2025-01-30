const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, 
  },
  invalidatedAt: {
    type: Date,
    default: Date.now, 
  },
});

const Blacklist = mongoose.model('Blacklist', BlacklistSchema);
module.exports = Blacklist;
