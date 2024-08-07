// Imports
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto-js');
const readline = require('readline');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL);

// Password Model
const Password = require('./models/Password');

// Function To Generate A Random Secret Key
function generateRandomSecret() {
  return crypto.lib.WordArray.random(128 / 8).toString(); // 128-bit Key
}

// Function To Prompt User Input For Admin Password
function promptAdminPassword(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (input) => {
      rl.close();
      resolve(input);
    });
  });
}

// Function To Initialise Or Update The Admin Password
async function initializeOrUpdateAdmin() {
  try {
    const adminRecord = await Password.findOne({ admin: true });

    if (adminRecord) {
      const updateChoice = await promptAdminPassword('An Admin Password Has Already Been Set, Do You Want To Update It? (yes / no): ');

      if (updateChoice.toLowerCase() === 'yes') {
        // Generate A New Secret Key
        const secretKey = generateRandomSecret();
        
        // Prompt User To Set A New Admin Password
        const adminPassword = await promptAdminPassword('Please Set A New Admin Password: ');
        const encryptedAdminPassword = crypto.AES.encrypt(adminPassword, secretKey).toString();

        // Update The Admin Password And Secret Key In The Database
        await Password.updateOne({ admin: true }, { password: encryptedAdminPassword, secretKey });
        console.log('The Admin Password And Secret Key Have Been Updated Successfully\nThese Credentials Have Been Encrypted And Saved In The Database\nRun `npm start` To Start The Server');
      } else {
        console.log('No Changes Were Made, Run `npm start` To Start The Server');
      }
    } else {
      // Generate A New Secret Key
      const secretKey = generateRandomSecret();

      // Prompt User To Set An Admin Password
      const adminPassword = await promptAdminPassword('Please Set An Admin Password: ');
      const encryptedAdminPassword = crypto.AES.encrypt(adminPassword, secretKey).toString();

      // Save The Admin Password And Secret Key In The Database
      await new Password({ admin: true, password: encryptedAdminPassword, secretKey }).save();
      console.log('The Admin Password And Secret Key Have Been Set Successfully\nThese Credentials Have Been Encrypted And Saved In The Database\nRun `npm start` To Start The Server');
    }
  } catch (error) {
    console.error('Error Initialising Or Updating Admin Password:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the setup
initializeOrUpdateAdmin();