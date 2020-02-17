var http = require("http");
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const listenPort = process.env.PORT;



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
	  //InitialDatabaseOperations();
    } else {
      console.log(err);
      console.log("Did not connect to database.");
    }
  }
);


//Handle basic GET request
app.get("/", (req, res, next) => {
  var origin = req.get('origin');
  console.log("DEVLOG: Root GET request from: " + origin);
  res.send("They see the server rolling. They hating!");
});

//Declare API routes
const status = require("./api/status");
const reports = require("./api/reports");

//Use API routes
app.use("/api/status", status);
app.use("/api/reports", reports);

///////////////////////////////////
//Create server
app.listen(listenPort, () => console.log(`Biborrezsi server listening on port ${listenPort}!`))
