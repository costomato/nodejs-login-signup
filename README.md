# Nodejs login Signup

## About
This is a login signup demonstration written in node.js. The backend is the main part of this project. Frontend is only for demonstration purpose of all features of this project. Backend uses expressjs for processing http requests, mongo-db for database.

## Testing
#### [Click here to test this app](https://nodejs-login-signup.onrender.com/)

## Usage

| Endpoint | HTTP method | Description | Request body contains | Response data contains |
| :------- |:-----------:|:------------| --------------------- | ---------------------- |
| /createNewUser | POST | Sign up a new user | `{ email: String, name: String, password: String }` | `{ statusOk: Boolean, statusString: String, _id: String, sessionToken: String }` |
| /authenticateUser | POST | Log in a user | `{ email: String, password: String }` | `{ statusOk: Boolean, statusString: String, _id: String, _name: String, _isVerified: Boolean, sessionToken: String }` |
| /updateUser | POST | Update credentials for a user | `{ _id: String, password: String, update: { email or name or whatever to udpate } }` | `{ statusOk: Boolean, statusString: String, data: { newSessionToken: String } }` |
| /deleteUser | DELETE | Delete a user | `{ _id: String, email: String, password: String }` | `{ statusOk: Boolean, statusString: String }` |
| /getResetLink | POST | Get password reset link on email | `{ email: String }` | `{ statusOk: Boolean, statusString: String }` | 
| /getEmailUpdateLink | POST | Get verification link for updating email | `{ oldEmail: String, password or sessionToken: String, newEmail: String }` | `{ statusOk: Boolean, statusString: String }` |
| /sendOtp | POST | Get OTP on email for verification | `{ email: String, name: String, _id: String }` | `{ statusOk: Boolean, statusString: String }` |
| /verifyOtp | POST | Verify OTP for email verification | `{ _id: String, email: String, _otp: String }` | `{ statusOk: Boolean, statusString: String }` |
| /getId | POST | Get id for a particular account | `{ email: String, password: String }` | `{ statusOk: Boolean, statusString: String }` |
| /sendMail | POST | Send details to mail | `{ firstName: String, lastName: String, email: String, message: String, phone: String }` | `{ statusOk: Boolean, statusString: String }` |

## Basics

#### REST API BASE URL:
`https://nodejs-login-signup.onrender.com/api/v1/`

#### Environment Variables:

- MONGO_URL = URL of your mongo cluster
  - You can use `mongodb://127.0.0.1:27017/logintestdb` if you are testing this project locally
- API_KEY = API key for safety
  - In this case, it is `mockKey987`
- EMAIL = Email account from which verification OTP, password reset link, etc will be sent to user
- PASS = Password of the email account
- BASE_URL = Base URL of site
  - In this case, it is `https://nodejs-login-signup.onrender.com`

## Note

#### Email sending work is done using nodemailer. So, if you are using gmail, google doesn't let third party services to sign in. You need to follow these steps for gmail:
1. Method 1
- Enable less secure apps
  - https://www.google.com/settings/security/lesssecureapps
- Disable Captcha temporarily so you can connect the new device/server
  - https://accounts.google.com/b/0/displayunlockcaptcha

2. Method 2
- Enable 2 factor authentication and use app passwords.

#### If you are seeing this message in mac while trying to start mongodb: `connect ECONNREFUSED 127.0.0.1:27017`, then try the following command:
```zsh
sudo mongod --dbpath /usr/local/var/mongodb
```

## Contributing

- Pull requests are welcome. 
- Css to frontend or any design changes are welcome.
- For major changes, please open an issue first to discuss what you would like to change.
