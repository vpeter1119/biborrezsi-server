var app = require("express");
var router = app.Router();
const Report = require("../models/report.js");

router.get("", (req, res, next) => {
  var origin = req.get('origin');
  console.log("DEVLOG: Reports GET request from: " + origin);
  Report.find({}, (err,reportsList) => {
	  if (err) {
		  console.log(err);
		  console.log("Could not retrieve reports list from server.");
		  res.status(500).json({message:"Something went wrong."})
	  } else {
		  console.log("Success.");
		  res.status(200).json(reportsList);
	  }
  });
});

/*router.post("", (req, res, next) => {
  var newReport = req.body;
  console.log(newReport);
  res.status(200).send({
    message: "Got the report!",
    report: newReport
  });
}); */

module.exports = router;
