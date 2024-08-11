# Version 5.0.0 [Audit Logs] - `August 11th 2024`

### Added:

- **Audit Log Model Creation:**
  - **Model Definition:** Added A New `AuditLog` Model To The Application For Tracking Significant Events Related To Security And Administrative Actions. This Model Captures Details Such As Action Type, Event Description, And The IP Address Of The Requester
  - **Schema Design:** The `AuditLog` Schema Includes Fields For `action` (Type Of Event), `details` (Description Of The Event), And `ip` (IP Address From Which The Request Originated) This Design Facilitates Detailed Record-Keeping And Auditing

- **Tracking Security Events:**
  - **Event Logging:** Implemented Logging For Various Security-Related Events, Including Successful And Failed Login Attempts, Password Saves, And Password Deletions. Each Event Is Recorded With Relevant Details And The Requester's IP Address
  - **Rate Limiting Events:** Added Specific Logging For Rate-Limited Actions To Track When And Why Requests Are Denied Due To Excessive Login Attempts

- **Coloured Console Text:**
  - **Enhanced Output:** Utilised The `chalk` Library To Colour-Code Console Outputs For Better Readability And Quick Identification Of Different Types Of Messages
    - **Green Text:** Used For Successful Operations, Such As Successful Database Connections And Successful Actions
    - **Red Text:** Applied To Error Messages To Clearly Indicate Issues That Require Attention
    - **Yellow Text:** Employed For Audit Log Information

# Version 4.0.0 [Dark Mode & Mobile Responsiveness] - `August 9th 2024`

### Added:
- **Dark Mode**: Implemented Dark Mode Styling
  - Background Colour And Text Colour Adjustments For Dark Mode
  - Updated Button And Table Header Colours For Dark Mode

### Fixed:
- **Mobile Responsiveness**: Improved Responsiveness For Various Screen Sizes
  - Adjusted Container Padding And Width For Mobile Devices
  - Ensured Table Scrolls Horizontally On Small Screens
 
### Updated:
- **Password Display Section**: Enhanced The Styling And Visibility Of The Generated Password Display
  - Updated Background And Border Colour For Better Visibility In Both Light And Dark Modes

- **Search Filter**: Added A Search Filter To The Password View Section
  - Included Styling Adjustments For Filter Wrapper Visibility And Alignment

- **Error Messages**: Improved Visibility And Styling Of Error Messages
  - Made Error Messages More Prominent With Updated Styling

- **Button Styles**: Unified Button Styles And Ensured Consistent Appearance Across Different States
  - Updated Hover Styles For Different Buttons To Ensure Proper Visual Feedback

- **Table Styling**: Refined Table Styling To Improve Readability
  - Ensured Consistent Header And Row Colours, With Appropriate Hover Effects

# Version 3.0.0 [Rate Limits] - `August 8th 2024`

### Added:
- **Rate Limiting:**
  - Implemented Rate Limiting On The `/view-passwords` API Endpoint To Enhance Security Against Brute Force Attacks
  - Configurable Rate Limit Settings Through Environment Variables:
    - `RATE_LIMIT_MAX_REQUESTS`: Maximum Number Of Requests In The Window (Default: 5)
    - `RATE_LIMIT_WINDOW_MINUTES`: Time Window In Minutes For The Rate Limit (Default: 5)
  - Custom Handler To Display A User-Friendly Message With The Exact Time Before Another Request Can Be Made

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