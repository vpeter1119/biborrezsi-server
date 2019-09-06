var http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
mongoose.connect(
  "mongodb+srv://" +
    mongoUser +
    ":" +
    mongoPW +
    "@biborrezsi-er8qg.mongodb.net/rezsi-data",
  { useNewUrlParser: true },
  err => {
    if (!err) {
      console.log("Connected to database.");
    } else {
      console.log(err);
      console.log("Did not connect to database.");
    }
  }
);

app.get("/", (req, res, next) => {
  res.send("They see the server rolling. They hating!");
});

//Declare API routes
const status = require("./api/status");
const reports = require("./api/reports");

//Use API routes
app.use("/api/status", status);
app.use("/api/reports", reports);

//create a server object:
http
  .createServer(function(req, res, err) {
    if (err) {
      console.log(err);
      return;
    }
  })
  .listen(8080, () => {
    console.log("Server is running.");
  });
