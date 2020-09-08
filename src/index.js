require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const listenPort = process.env.PORT;

//Set up local modules
//const msg = require("./local_modules/messages.js");

//Setup Express

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

//Setup HTTP response headers

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  next();
});

//Setup mongoDB
const mongoPW = process.env.MONGODB_PW;
const mongoUser = process.env.MONGODB_USER;
console.log("Connecting to MongoDB...");
mongoose.connect(
  "mongodb+srv://" +
    mongoUser +
    ":" +
    mongoPW +
    "@biborrezsi-er8qg.mongodb.net/rezsi-data",
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (!err) {
      console.log("Connected to database.");
    } else {
      console.log(err);
      console.log("Did not connect to database.");
    }
  }
);


//Handle basic GET request
app.get("/", (req, res) => {
  var origin = req.get('origin');
  console.log("DEVLOG: Root GET request from: " + origin);
  res.sendFile("index.html", {root: __dirname });
});

//Declare API routes
const status = require("./api/status");
const reports = require("./api/reports");
const auth = require("./api/auth");

//Use API routes
app.use("/api/status", status);
app.use("/api/reports", reports);
app.use("/api/auth", auth);

//Repeating operations
// - send reminder email at the end of every month => msg.SendReminder


///////////////////////////////////
//Create server
app.listen(listenPort, () => console.log(`Biborrezsi server listening on port ${listenPort}!`))
