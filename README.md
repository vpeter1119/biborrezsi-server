# biborrezsi-server
A server for the personal overhead expenses app. The purpose of this project is to make my life easier and practice building a simple CRUD web app.

#### API endpoints
* `/status` GET → returns `{running:true}`, used to ping server to wake up
* `/auth` POST → expects `{username:string,password:string}` and returns a JSON Web Token if authenticated
* `/reports` GET (_requires authentication_) → returns an array of approved reports
* `/reports` POST (_requires authentication_) → expects a proper report format, generates metadata, saves unapproved report to database and returns a message
* `/reports/:id/approve` GET → expects report id and matching `approveToken`, approves the report and returns a message

#### Dependencies used
* [Express](https://github.com/expressjs/express) with [Body-Parser](https://github.com/expressjs/body-parser)
* [Mongoose](https://github.com/Automattic/mongoose)
* [Dotenv](https://github.com/motdotla/dotenv)
* [JSON Web Token (JWT)](https://github.com/auth0/node-jsonwebtoken) for authentication
* [Nodemailer](https://github.com/nodemailer/nodemailer)
* [email-templates](https://github.com/forwardemail/email-templates)
* [Randomstring](https://github.com/klughammer/node-randomstring) for approve token creation
