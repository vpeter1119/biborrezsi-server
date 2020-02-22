const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const jwtSecret = process.env.JWT_SECRET;

//Authentication with jsonwebtoken
router.post("/login", (req, res, next) => {
	var reqUser = req.body.username;
	console.log("Authentication request, username=" + reqUser);
	var userData = {};
	//The password from the frontend form	
	var inputPW = req.body.pw;	
	var storedPW = "";
	//The password from the database
	User.findOne({'username':reqUser}, (err,user) => {
		if (err) {
			console.log("Other error:")
			console.log(err);
			res.status(500).json({
				errcode:"ERR",
				message:"Could not authenticate due to server-side error. Please try again later, or contact me."
			});
		} else if (user) {
			userData = user;
			storedPW = user.password;
			return user.password;
		} else {
			console.log("DEVLOG: Authentication failed: could not find user with username " + reqUser);
			res.status(500).json({
				errcode:"ERR",
				message:"Could not authenticate due to server-side error. Please try again later, or contact me."
			});
		}		
	});	
	//Compare passwords
	if (inputPW == storedPW) {
		console.log("DEVLOG: Authentication successful.");
		//Create token
		const token = jwt.sign(
			{
				username: reqUser,
				isAdmin: userData.isAdmin,
			},
			jwtSecret,
			{expiresIn:"4h"}
		);
		//Send response with token
		res.status(200).json({
			token: token,
			expiresIn: 14400,
			message: "Authentication successful."
		});
	} else {
		console.log("DEVLOG: Authentication failed: incorrect password.");
		//Send response
		res.status(401).json({
			errcode: "WRONGPW",
			message: "Authentication failed: wrong password. Please note that the password is case-sensitive."
		});
	}
});

//Export routes
module.exports = router;