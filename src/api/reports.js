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
		//Handle the heat value
		if (input.heat == 0 || input.heat == null) {
			input.heat = reports[(reports.length-1)].heat;
		}
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
			var newReport = {
				cold: vInput.cold,
				hot: vInput.hot,
				heat: vInput.heat,
				elec: vInput.elec,
				isHeating: vInput.isHeating,
				isApproved: false,
			};
			//Set "nr" attribute
			newReport.nr = reports.filter(rep => {return rep.isApproved}).length;
			//Set approve token
			newReport.approveToken = rs.generate();
			console.log(newReport);
			//Save the new report to the DB
			Report.create(newReport, (err, reportCreated) => {
				if (err) {
					console.log(err);
					console.log("DEVLOG: Could not save report to database.");
					res.status(500).json({message:"An error has occurred. Please try again later."});
				} else {
					console.log(reportCreated);
					console.log("DEVLOG: New report saved.");
					res.status(201).json({message:"Your report was saved.",report:newReport});
				}
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
	var lastReport = oldReports[(oldReports.length - 1)];
	//Declaring conditions - sum must be 0 to validate
	var a = (lastReport.cold > input.cold);
	var b = (lastReport.hot > input.hot);
	var c = (lastReport.heat > input.heat);
	var d = (lastReport.elec > input.elec);
	var e = (input.cold==0);
	var f = (input.hot==0);
	var g = (input.heat==0);
	var h = (input.elec==0);	
	if ((a+b+c+d+e+f+g+h)>0) {
		console.log("DEVLOG: Validation failed.");
		return false;
	} else {
		console.log("DEVLOG: Validation OK.");
		return true;
	}
}

module.exports = router;
