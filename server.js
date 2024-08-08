// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto-js');
const rateLimit = require('express-rate-limit');

// Initialise Express
const app = express();
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL);

// Password Model
const Password = require('./models/Password');

// Rate Limiter Middleware
const loginLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 5) * 60 * 1000, // Default 5 Minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5, // Default 5 Requests
  handler: (req, res) => {
    const retryAfterMs = req.rateLimit.resetTime - Date.now();
    const retryAfterMinutes = Math.floor(retryAfterMs / 60000);
    const retryAfterSeconds = Math.floor((retryAfterMs % 60000) / 1000);
    res.status(429).json({
      message: `Too Many Login Attempts, Please Try Again In ${retryAfterMinutes} Minutes And ${retryAfterSeconds} Seconds`
    });
  }
});

// Function To Check If The Admin Password Is Set
async function checkAdminPassword() {
  try {
    const adminRecord = await Password.findOne({ admin: true });
    return !!adminRecord;
  } catch (error) {
    console.error('Error checking admin password:', error);
    return false;
  }
}

// Function To Initialise The Server If The Admin Password Is Set
async function startServer() {
  const adminPasswordSet = await checkAdminPassword();

  if (!adminPasswordSet) {
    console.log('Admin Password Not Set, Please Run `node setup.js` To Set The Admin Password');
    process.exit(1); // Exit The Process
  }

  // API Route To Save Password
  app.post('/save-password', async (req, res) => {
    try {
      const { website, username, password } = req.body;

      if (!website || !username || !password) {
        return res.status(400).json({ message: 'Website, Username, And Password Are Required Fields' });
      }

      const adminRecord = await Password.findOne({ admin: true }); // Retrieve Admin Record
      if (!adminRecord) {
        return res.status(500).json({ message: 'Admin Settings Not Found, Run Setup' });
      }

      const secretKey = adminRecord.secretKey; // Retrieve The Secret Key
      if (!secretKey) {
        console.error('Error: Secret Key Not Found In The Admin Record, Try Running `node setup.js` To Reinitialise The Admin Settings');
        return res.status(500).json({ message: 'Secret Key Missing, Check The Console For More Information' });
      }

      const encryptedPassword = crypto.AES.encrypt(password, secretKey).toString();
      const newPassword = new Password({ website, username, password: encryptedPassword });
      await newPassword.save();

      res.json({ message: 'Password Saved Successfully' });
    } catch (error) {
      console.error('Error Saving Password:', error);
      res.status(500).json({ message: 'An Error Occurred While Saving The Password, Check The Console For More Information' });
    }
  });

  // API Route To View Passwords (With Rate Limiting)
  app.post('/view-passwords', loginLimiter, async (req, res) => {
    try {
      const { adminPassword } = req.body;

      // Retrieve And Verify The Admin Password
      const adminRecord = await Password.findOne({ admin: true });
      if (!adminRecord) {
        return res.status(500).json({ message: 'Admin Settings Not Found, Run Setup' });
      }

      const secretKey = adminRecord.secretKey; // Retrieve The Secret Key
      if (!secretKey) {
        console.error('Error: Secret Key Not Found In The Admin Record, Try Running `node setup.js` To Reinitialise The Admin Settings');
        return res.status(500).json({ message: 'Secret Key Missing, Check The Console For More Information' });
      }

      const decryptedAdminPassword = crypto.AES.decrypt(adminRecord.password, secretKey).toString(crypto.enc.Utf8);

      if (adminPassword === decryptedAdminPassword) {
        const passwords = await Password.find({ admin: { $ne: true } });
        const decryptedPasswords = passwords.map(pw => {
          const decryptedPassword = crypto.AES.decrypt(pw.password, secretKey).toString(crypto.enc.Utf8);
          return {
            id: pw._id, // Include ID For Deleting Passwords
            website: pw.website,
            username: pw.username,
            password: decryptedPassword
          };
        });
        res.json(decryptedPasswords);
      } else {
        res.status(403).json({ message: 'Invalid Admin Password, Please Try Again' });
      }
    } catch (error) {
      console.error('Error Retrieving Passwords:', error);
      res.status(500).json({ message: 'An Error Occurred While Retrieving Passwords, Check The Console For More Information' });
    }
  });

  // API route To Delete A Password
  app.delete('/delete-password/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const deletedPassword = await Password.findByIdAndDelete(id);
      if (deletedPassword) {
        res.json({ message: 'Password Successfully Deleted' });
      } else {
        res.status(404).json({ message: 'Password Not Found' });
      }
    } catch (error) {
      console.error('Error Deleting Password:', error);
      res.status(500).json({ message: 'An Error Occurred Whilst Deleting The Password, Check The Console For More Information' });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server Running On Port ${PORT}\nGitHub: https://github.com/Kyle8973/Password-Manager`));
}

// Start The Server
startServer();