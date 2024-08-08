# Version 3.0.0 [Rate Limits] - `August 8th 2024`

### Added:
- **Rate Limiting:**
  - Implemented Rate Limiting On The `/view-passwords` API Endpoint To Enhance Security Against Brute Force Attacks
  - Configurable Rate Limit Settings Through Environment Variables:
    - `RATE_LIMIT_MAX_REQUESTS`: Maximum Number Of Requests In The Window (Default: 5)
    - `RATE_LIMIT_WINDOW_MINUTES`: Time Window In Minutes For The Rate Limit (Default: 5)
  - Custom Handler To Display A User-Friendly Message With The Exact Time Before Another Request Can Be Made

**Full Changelog**: https://github.com/Kyle8973/Password-Manager/commits/v3.0.0?since=2024-08-08&until=2024-08-08

# Version 2.0.0 [Security Update] - `August 7th 2024`

### Changed:
- **Admin Password Configuration:**
  - Removed Admin Password And Secret Key From `.env` File
  - Added `setup.js` Script To Handle The Setup Of The Admin Password And Generation Of A Random Secret Key
    - Users Are Now Prompted To Enter An Admin Password
    - A Random Secret Key Is Generated And Stored In The Database Alongside The Admin Password

- **Password Management UI Enhancements:**
  - Updated The Password Saving Form To:
   	 - Show The Generated Password Field
   	 - Prefill The Password Field With The Generated Password
  - Adjusted The UI To Ensure The Password Field Is Visible Upon Generating A New Password

### Added:
- **`setup.js` Script:**
  - A New Script That Initialises The Admin Password And Generates A Secret Key
  - Replaced The Previous Method Of Storing These Details In The `.env` File
  - Handles The Encryption And Storage Of The Admin Password And Secret Key

### Fixed:
- **Password Display:**
  - Corrected The Visibility Of The Password Field In The Save Password Form
  - Ensured The Generated Password Is Automatically Filled In The Form For Convenience

### Notes:
- Ensure To Run `node setup.js` To Configure The Admin Password And Generate A Secret Key Before Starting The Server.
- The `.env` File No Longer Needs To Include Admin Password And Secret Key.
- This Update Enhances Security By Managing Sensitive Information Directly In The Database And Improves User Experience With Prefilled Password Fields.

**Full Changelog:** https://github.com/Kyle8973/Password-Manager/commits/v2.0.0?since=2024-08-07&until=2024-08-07

# Version 1.0.0 [Initial Release] - `August 6th 2024`

### Added:
- **Password Manager Functionality:**
  - Basic Functionality To Save And Retrieve Passwords
  - Integrated MongoDB For Data Storage
  - Implemented Basic API Endpoints:
    - `post /save-password`: Save A New Password Entry
    - `post /view-passwords`: Retrieve Stored Passwords (Admin Authentication Required)
    - `delete /delete-password/:id`: Delete A Specific Password Entry By ID

- **Admin Password Configuration:**
  - Admin Password And Secret Key Stored In `.env` File For Initial Setup
  - Encryption Of Passwords Using A Secret Key To Enhance Security

- **Server And Middleware Setup:**
  - Configured Express Server To Handle JSON Requests And Serve Static Files
  - Added MongoDB Connection Handling
  - Set Up Basic Error Handling And Response Messages For API Endpoints

- **Basic User Interface:**
  - HTML And JavaScript For Generating, Saving, And Viewing Passwords
  - Initial Form And UI Components For User Interactions

**Full Changelog**: https://github.com/Kyle8973/Password-Manager/commits/v1.0.0?since=2024-08-06&until=2024-08-06
