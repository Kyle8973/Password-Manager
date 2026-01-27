const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  admin: { type: Boolean, default: false }, // Admin Password To View Saved Passwords
  password: { type: String, required: true }, // Password To Save
  secretKey: { type: String }, // Secret Key For Encryption
  website: { type: String }, // Website Associated With The Password
  username: { type: String } // Username Associated With The Password
});

module.exports = mongoose.model('Password', passwordSchema);