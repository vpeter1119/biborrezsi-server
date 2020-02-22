const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const jwtSecret = process.env.JWT_SECRET;

//Authentication with jsonwebtoken
router.post("/login", (req, res, next) => {
	const userData;
	//The password from the frontend form	
	let inputPW = req.body.pw;	
	//The password from the database
	let storedPW = User.findOne({username:req.body.username}, user => {
		if (user) {
			userData = user;
			return user.password;
		} else {
			console.log("DEVLOG: Authentication failed: could not find user with username " + req.body.username);
			res.status(500).json({
				errcode:"ERR",
				message:"Could not authenticate due to server-side error. Please try again later, or contact me."
			});
		}		
	});	
	//Compare passwords
	if (inputPW === storedPW) {
		console.log("DEVLOG: Authentication successful.");
		//Create token
		const token = jwt.sign(
			{
				username: req.body.username,
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