// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto-js');

// Initialise Express
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Import Chalk For Coloured Console Logs
(async () => {
  const chalk = await import('chalk'); 
  
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log(chalk.default.green.bold('Connected To MongoDB')))
  .catch(error => console.error(chalk.default.red.bold('Error Connecting To MongoDB: ') + error));

// Password Model
const Password = require('./models/Password');
const AuditLog = require('./models/auditLog'); // Import the AuditLog model

// Rate Limiter Map To Track Attempts By IP
const loginAttempts = new Map();

// Rate Limiter Settings
const RATE_LIMIT_WINDOW_MS = (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 5) * 60 * 1000; // Default 5 Minutes
const MAX_ATTEMPTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5; // Default 5 Requests

// Function To Check If An IP Should Be Rate Limited
function isRateLimited(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, time: Date.now(), logged: false };
  const currentTime = Date.now();

  if (currentTime - attempts.time > RATE_LIMIT_WINDOW_MS) {
    // Reset Attempts If Window Has Passed
    loginAttempts.set(ip, { count: 0, time: currentTime, logged: false });
    return { limited: false };
  }

  const timeLeftMs = RATE_LIMIT_WINDOW_MS - (currentTime - attempts.time);
  return { limited: attempts.count >= MAX_ATTEMPTS, timeLeftMs };
}

// Function To Increment Login Attempts
function incrementAttempts(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, time: Date.now(), logged: false };
  attempts.count += 1;
  attempts.time = Date.now();
  loginAttempts.set(ip, attempts);
}

// Function To Log Audit Events
async function logEvent(action, details, ip) {
  console.log(chalk.default.yellow(`- ${action}: ${details} (IP: ${ip})`));
  await AuditLog.create({ action, details, ip });
}

// Function To Check If The Admin Password Is Set
async function checkAdminPassword() {
  try {
    const adminRecord = await Password.findOne({ admin: true });
    return !!adminRecord;
  } catch (error) {
    console.error('Error Checking The Admin Password:', error);
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

      const adminRecord = await Password.findOne({ admin: true });
      if (!adminRecord) {
        return res.status(500).json({ message: 'Admin Settings Not Found, Run Setup' });
      }

      const secretKey = adminRecord.secretKey;
      if (!secretKey) {
        console.error('Error: Secret Key Not Found In The Admin Record, Try Running `node setup.js` To Reinitialise The Admin Settings');
        return res.status(500).json({ message: 'Secret Key Missing, Check The Console For More Information' });
      }

      const encryptedPassword = crypto.AES.encrypt(password, secretKey).toString();
      const newPassword = new Password({ website, username, password: encryptedPassword });
      await newPassword.save();
      const message = `Website: (${website}) Username: (${username}) At ${new Date().toLocaleString()}`;
      await logEvent('Password Saved', message, req.ip);

      res.json({ message: 'Password Saved Successfully' });
    } catch (error) {
      console.error('Error Saving Password:', error);
      res.status(500).json({ message: 'An Error Occurred While Saving The Password, Check The Console For More Information' });
    }
  });

  // API Route To View Passwords (With Custom Rate Limiting)
  app.post('/view-passwords', async (req, res) => {
    try {
      const { adminPassword } = req.body;
      const ip = req.ip;

      // Check If The IP Is Rate Limited
      const { limited, timeLeftMs } = isRateLimited(ip);

      if (limited) {
        const retryAfterMinutes = Math.floor(timeLeftMs / 60000);
        const retryAfterSeconds = Math.floor((timeLeftMs % 60000) / 1000);

        // Log Rate Limit
        const attempts = loginAttempts.get(ip) || { count: 0, time: Date.now(), logged: false };
        if (!attempts.logged) {
          const message = `Too Many Login Attempts At ${new Date().toLocaleString()}`;
          await logEvent('Login Rate Limit Applied:', message, ip);
          attempts.logged = true;
          loginAttempts.set(ip, attempts);
        }

        return res.status(429).json({
          message: `Too Many Login Attempts, Please Try Again In ${retryAfterMinutes} Minutes And ${retryAfterSeconds} Seconds`
        });
      }

      // Retrieve And Verify The Admin Password
      const adminRecord = await Password.findOne({ admin: true });
      if (!adminRecord) {
        return res.status(500).json({ message: 'Admin Settings Not Found, Run Setup' });
      }

      const secretKey = adminRecord.secretKey;
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
        const message = `Admin Successfully Logged In At ${new Date().toLocaleString()}`;
        await logEvent('Successful Admin Login', message, ip);
        
        res.json({ passwords: decryptedPasswords, success: true });
      } else {
        incrementAttempts(ip); // Increment Attempts On Failure
        const message = `Invalid Password Provided At ${new Date().toLocaleString()}`;
        await logEvent('Failed Login Attempt', message, ip);
        res.status(403).json({ message: 'Invalid Admin Password, Please Try Again', success: false });
      }
    } catch (error) {
      console.error('Error Retrieving Passwords:', error);
      res.status(500).json({ message: 'An Error Occurred While Retrieving Passwords, Check The Console For More Information' });
    }
  });

  // API Route To Delete A Password
  app.delete('/delete-password/:id', async (req, res) => {
    const { id } = req.params;
    const ip = req.ip; // Capture IP For Audit Log

    try {
      const deletedPassword = await Password.findByIdAndDelete(id);
      if (deletedPassword) {
        const message = `Website: (${deletedPassword.website}) Username: (${deletedPassword.username}) At ${new Date().toLocaleString()}`;
        await logEvent('Password Deleted', message, ip);
        res.json({ message: `Password Successfully Deleted For ${deletedPassword.website}` });
      } else {
        res.status(404).json({ message: 'Password Not Found' });
      }
    } catch (error) {
      console.error('Error Deleting Password:', error);
      await logEvent('Error Deleting Password', `An Error Occurred While Attempting To Delete Password With ID ${id}`, ip);
      res.status(500).json({ message: 'An Error Occurred While Deleting The Password, Check The Console For More Information' });
    }
  });

  // Server
  const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(chalk.default.green.bold(`Server Running On Port ${PORT}\nGitHub: https://github.com/Kyle8973/Password-Manager`));
      console.log('');
      console.log(chalk.default.yellow.bold('Audit Log:'));

    });
  }

// Start The Server
startServer();
})();