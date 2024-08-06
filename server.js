// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto-js');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL);

// Password Model
const Password = require('./models/Password');

// Encrypt And Store Admin Password
async function storeAdminPassword() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const encryptedAdminPassword = crypto.AES.encrypt(adminPassword, process.env.SECRET_KEY).toString();

  await Password.findOneAndUpdate(
    { admin: true },
    { password: encryptedAdminPassword },
    { upsert: true }
  );
}

storeAdminPassword();

// API Route To Save Password
app.post('/save-password', async (req, res) => {
  const { website, username, password } = req.body;
  const encryptedPassword = crypto.AES.encrypt(password, process.env.SECRET_KEY).toString();

  const newPassword = new Password({ website, username, password: encryptedPassword });
  await newPassword.save();

  res.json({ message: 'Password Saved Successfully' });
});

// API Route To View Passwords
app.post('/view-passwords', async (req, res) => {
  const { adminPassword } = req.body;

  // Retrieve And Verify Admin Password
  const adminRecord = await Password.findOne({ admin: true });
  const decryptedAdminPassword = crypto.AES.decrypt(adminRecord.password, process.env.SECRET_KEY).toString(crypto.enc.Utf8);

  if (adminPassword === decryptedAdminPassword) {
    const passwords = await Password.find({ admin: { $ne: true } });
    const decryptedPasswords = passwords.map(pw => ({
      id: pw._id, // Include ID For Deleting Password
      website: pw.website,
      username: pw.username,
      password: crypto.AES.decrypt(pw.password, process.env.SECRET_KEY).toString(crypto.enc.Utf8)
    }));
    res.json(decryptedPasswords);
  } else {
    res.status(403).json({ message: 'Invalid Admin Password' });
  }
});

// API Route To Delete Password
app.delete('/delete-password/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Password.findByIdAndDelete(id);

    if (result) {
      res.json({ message: 'Password Successfully Deleted' });
    } else {
      res.status(404).json({ message: 'Password Not Found' });
    }
  } catch (error) {
    console.error('Error Deleting Password:', error);
    res.status(500).json({ message: 'Failed To Delete Password' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running On Port ${PORT}\nGitHub: https://github.com/Kyle8973/Password-Manager`));