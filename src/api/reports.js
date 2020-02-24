var app = require("express");
var router = app.Router();
var rs = require("randomstring");

const Report = require("../models/report.js");
const checkAuth = require("../middleware/check-auth");

//Report route functions
function GetAllReports() {
	Report.find({}, (err, reports) => {
		if (err) {
			console.log(err);
			console.log("Could not retrieve reports list from server.");
			return(null);
		} else {
			console.log("Success.");
			return(reports);
		}
	});
}

//API endpoints

router.get("", checkAuth, (req, res, next) => {
	var origin = req.get('origin');
	console.log("DEVLOG: Reports GET request from: " + origin);
	var reportsList = GetAllReports();
	if (reportsList==null) {
		res.status(500).json({message:"Something went wrong."});
	} else {
		var responseDataRaw = reportsList.filter(report => {
			return report.isApproved;
		});
		var responseData = reportsList.map( function (rep) {
			return {
				cold: rep.cold,
				hot: rep.hot,
				heat: rep.heat,
				elec: rep.elec,
				isHeating: rep.isHeating,
				nr: rep.nr,
			}
		});
		res.status(200).json(responseData);
	}
});

router.post("", checkAuth, (req, res, next) => {
  var origin = req.get('origin');
  console.log("DEVLOG: Reports POST request from: " + origin);
  var input = req.body;
  //Send input for validation before doing anything else
  var inputValidated = new Promise((resolve,reject) => {
	  var isValidated = validateInput(input);
	  if (isValidated) {
		  resolve(input);
	  } else {
		  reject();
	  }
  });
  inputValidated.then(vInput => {
	//Process the validated input
	var newHeat = 0;
	if (vInput.heat == 0 || vInput.heat == null) {
		//heat should be set to value in latest report
	} else {
		newHeat = vInput.heat;
	}
	var newReport = {
		cold: vInput.cold,
		hot: vInput.hot,
		heat: vInput.heat,
		elec: vInput.elec,
		isHeating: vInput.isHeating,
		isApproved: false,
	};
	//Set "nr" attribute
	//Set approve token
	newReport.approveToken = rs.generate();
	console.log(newReport);
	res.status(200).send({
		message: "Got the report!",
		report: newReport
	});
  }, () => {
	  //Handle validation rejection
	  res.status(400).json({
		  errcode: "BADINPUT",
		  message: "Input validation failed.",
	  });
  });
});

//Validate input data
function validateInput() {
	return true;
}

module.exports = router;
