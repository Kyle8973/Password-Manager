const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  website: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false }
});

module.exports = mongoose.model('Password', passwordSchema);
