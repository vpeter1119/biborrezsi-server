var app = require("express");
var router = app.Router();
var rs = require("randomstring");

const Report = require("../models/report.js");
const checkAuth = require("../middleware/check-auth");

var allReports = [{}];

//Report route functions
function GetAllReports() {
	return Report.find({}, (err, reports) => {
		if (err) {
			console.log(err);
			console.log("DEVLOG: Could not retrieve reports list from server.");
			return(null);
		} else {
			console.log("DEVLOG: Success.");
			return(reports);
		}
	});
}

//API endpoints

router.get("", checkAuth, (req, res, next) => {
	var origin = req.get('origin');
	console.log("DEVLOG: Reports GET request from: " + origin);
	var GetAllReportsPromise = new Promise((resolve,reject) => {
		var reportsList = GetAllReports();
		setTimeout(()=>{
			resolve(reportsList);
		}, 250);
	});
	GetAllReportsPromise.then(reportsList => {
		if (reportsList==null) {
			res.status(500).json({message:"Something went wrong."});
		} else {
			var responseDataRaw = reportsList.filter(report => {
				return report.isApproved == true;
			});
			var responseData = responseDataRaw.map( function (rep) {
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
});

router.post("", checkAuth, (req, res, next) => {
	var origin = req.get('origin');
	console.log("DEVLOG: Reports POST request from: " + origin);
	var input = req.body;
	//Get an array of all reports from DB
	var GetAllReportsPromise = new Promise((resolve,reject) => {
		allReports = GetAllReports();
		setTimeout(()=>{
			resolve(allReports);
		}, 250);
	});
	GetAllReportsPromise.then(reports => {
		//Send input for validation before doing anything else
		var inputValidated = new Promise((resolve,reject) => {
		  var isValidated = validateInput(input, reports);
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
});

//Validate input data
function validateInput(input, oldReports) {
	var lastReport = oldReports[oldReports.length - 1];
	if (lastReport.cold < input.cold || lastReport.hot < input.hot || lastReport.heat < input.heat || lastReport.elec < input.elec || input.cold==0 || input.hot==0 || input.heat==0 || input.elec==0) {
		return false;
	} else {
		return true;
	}
}

module.exports = router;
