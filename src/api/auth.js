const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const jwtSecret = process.env.JWT_SECRET;

//Authentication with jsonwebtoken
router.post("/login", (req, res) => {
	var reqUser = req.body.username;
	console.log("Authentication request, username=" + reqUser);
	var userData = {};
	//The password from the frontend form	
	var inputPW = req.body.pw;
	console.log("inputPW=" + inputPW);	
	
	//Get user data from DB for password compare
	var promiseGetUserData = new Promise((resolve) => {
		User.findOne({'username':reqUser}, (err,user) => {
			if (err) {
				console.log("Other error:")
				console.log(err);
				res.status(500).json({
					errcode:"ERR",
					message:"A belépés sikertelen a szerver hibája miatt. Kérlek, értesíts  hibáról és próbálkozz később. Elnézést a kellemetlenségért."
				});
			} else if (user) {
				userData = user;
				setTimeout( ()=> {
					resolve(userData);
				}, 250);
			} else {
				console.log("DEVLOG: Authentication failed: could not find user with username " + reqUser);
				res.status(500).json({
					errcode:"ERR",
					message:"A belépés sikertelen a szerver hibája miatt. Kérlek, értesíts  hibáról és próbálkozz később. Elnézést a kellemetlenségért."
				});
			}
		});	
	});
	
	//Compare passwords after getting user data
	promiseGetUserData.then((fetchedData) => {
		if (inputPW == fetchedData.password) {
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
				message: "Sikeres belépés."
			});
		} else {
			console.log("DEVLOG: Authentication failed: incorrect password.");
			//Send response
			res.status(401).json({
				errcode: "WRONGPW",
				message: "Hibás jelszó. Kérlek, próbálkozz újra. Kis- és nagybetűk számítanak."
			});
		}
	});
	
});

//Export routes
module.exports = router;
