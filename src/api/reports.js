var app = require("express");
var router = app.Router();
var rs = require("randomstring");
var mongoose = require("mongoose");

const Report = require("../models/report.js");
const checkAuth = require("../middleware/check-auth");
const msg = require("../local_modules/messages.js");

var allReports = [{}];

//Report route functions
function GetAllReports() {
	return Report.find({}, (err, reports) => {
		if (err) {
			console.log(err);
			console.log("DEVLOG: Could not retrieve reports list from database.");
			return(null);
		} else {
			console.log("DEVLOG: Reports fetched from database.");
			return(reports);
		}
	});
};
function FindReport(id) {
	var idIsValid = (mongoose.Types.ObjectId.isValid(id));
	if (idIsValid) {
		return Report.findById(id, (err, report) => {
			if (err) {
				console.log(err);
				console.log("DEVLOG: Could not retrieve report from database.");
				return(null);
			} else {
				console.log("DEVLOG: Report fetched from database.");
				return(report);
			}
		});
	} else {
		console.log("DEVLOG: " + id + " is not a valid ID.");
		return(null);
	}
	
};

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
					msg.SendApproveMsg(newReport, reportCreated._id, newReport.approveToken);
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

router.get("/:id/approve", (req,res,next) => { //URL: <server>/api/reports/:id?t=<approveToken>
	var origin = req.params.origin;
	var id = req.params.id;	
	var approveToken = req.query.t; //substitute for authentication
	var report = {};
	console.log("DEVLOG: Approve request for report " + id + " with token " + approveToken + " from " + origin);
	//Find report by id
	var ReportFound = new Promise((resolve, reject) => {
		report = FindReport(id);
		if (report!=null) {
			setTimeout(()=>{
				resolve(report);
			}, 250);
		} else {
			reject();
			res.status(404).json({
				errcode: "NOTFOUND",
				message: "Could not find report."
			});
		}
	});
	ReportFound.then((rep) => {
		if (rep==null) { //This should not be reached at all but lets leave it here for now
			//Deny the request
			console.log("DEVLOG: Request denied: report not found.");
			res.status(404).json({
				errcode: "NOTFOUND",
				message: "Could not find report."
			});
		} else if (rep.approveToken != approveToken && rep!=null) {
			console.log("DEVLOG: Request denied: wrong token.");
			//Deny the request
			res.status(401).json({
				errcode: "NOAUTH",
				message: "Not authorized to access resource."
			});
		} else if (rep.approveToken == approveToken && rep!=null) {
			//Approve the report
			//STEPS:
			//1. Update report: isApproved=true, approveToken=null
			var ReportApproved = new Promise((resolve, reject) => {
				console.log("DEVLOG: Finding report to approve by id=" + id);
				Report.findOneAndUpdate({_id:id}, {isApproved:true,approveToken:null}, (err, updatedReport) => {
					if (err) {
						//Handle error
						console.log(err);
						console.log("DEVLOG: An error has occured while updating record.");
						reject();
						res.status(500).json({message: "An error has occurred. Please try again later."});
					} else {
						setTimeout(()=>{
							console.log("DEVLOG: Report attribute isApproved set to true.");
							resolve(updatedReport);
						}, 250);
					}
				});
			}, () => {
				//Promise was rejected due to an error while updating
				console.log("DEVLOG: Promise was rejected due to an error while updating");
			});
			ReportApproved.then((approvedRecord) => {
				//2. Delete other unapproved reports with the same "nr"
				Report.deleteMany({'isApproved':false,'nr':approvedRecord.nr}, (err) => {
					if (err) {
						//Handle error
						console.log(err);
						console.log("DEVLOG: An error has occured while deleting unapproved records.");
						res.status(500).json({message: "An error has occurred. Please try again later."});
					} else {
						console.log("DEVLOG: Unapproved reports deleted.");
					}
				});
				//3. Send message to maintenance
				//4. Send message to end user
				//5. Send message to admin (me)
				//6. Send response to client
				res.status(200).json({message:"Report approved successfully."});
			});
			
			
		} else {
			//This should not be even possible but let's just leave it here for now
			console.log("DEVLOG: Request denied: other error.");
			res.status(500).json({message: "An error has occurred. Please try again later."});
		}
	}, () => {
		//Promise was rejected: could not find report, wrong id?
		console.log("DEVLOG: Promise rejected.");
	});
});

//Validate input data
function validateInput(input, oldReports) {
	var approvedRecords = oldReports.filter(rep => {return rep.isApproved});
	var lastReport = approvedRecords[(approvedRecords.length - 1)];
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
