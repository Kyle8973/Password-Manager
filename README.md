# Password Manager

# Description:
This Is A Web-Based Password Manager Application That Allows Users To Generate, Save, View, And Delete Passwords Securely. The App Encrypts Stored Passwords, Ensuring That Only An Admin Can View The Saved Passwords

# Features:

- **Generate Strong Passwords**: Create Random Passwords With Customisable Length And Character Types (Uppercase, Lowercase, Numbers, Symbols)
- **Save Passwords**: Save Generated Passwords Along With Website And Username Information
- **View Passwords**: Admins Can View Saved Passwords After Entering The Admin Password
- **Delete Passwords**: Remove Saved Passwords From The Database

# Tech Stack:

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Encryption**: crypto-js


# Installation:

Clone The Repository:
```bash
git clone https://github.com/Kyle8973/password-manager
cd password-manager
```

Install Dependencies:
```bash
npm install
```

Create A .env File And Add The Following:
```bash
PORT=3000 # Port The Server Will Run On
MONGODB_URL= # MongoDB URL
ADMIN_PASSWORD= # Admin Password For Viewing Passwords
SECRET_KEY= # Secret Key For Encrypting Passwords
```

Run The Application:
```bash
npm start
```

# Usage:

**Generating Passwords:**
- Set The Desired Password Length.
- Select The Types Of Characters You Want To Include: Uppercase, Lowercase, Numbers, And/Or Symbols.
- Click The "Generate" Button To Create A New Password.

**Saving Passwords:**
- After Generating A Password, Click "Save Password"
- Fill Out The Website And Username Fields, Then Click "Submit"

**Viewing Saved Passwords:**
- Enter The Admin Password.
- Click The "View Passwords" Button.
- A List Of Saved Passwords Will Be Displayed.
- Use The "Reveal" Button To Show A Password, Or The "Delete" Button To Remove It.

# Screenshots:
![Main Page](images/Main_Page.png)
![Generated Password](images/Generated_Password.png)
![Save Password](images/Save_Password.png)
![View Passwords](images/View_Passwords.png)

# License:
This Project Is Licensed Under The MIT License - See The [LICENSE](LICENSE) File For Details

# Authors:

- [Kyle8973](https://www.github.com/kyle8973)

