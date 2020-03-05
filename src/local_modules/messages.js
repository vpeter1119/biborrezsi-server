const nodemailer = require("nodemailer");
const EmailTemplate = require('email-templates').EmailTemplate;
const serverUrl = "https://biborrezsi-server.herokuapp.com/";
const gmUser = process.env.GMAIL_USER;
const gmClientId = process.env.GOOGLE_CID;
const gmClientSecret = process.env.GOOGLE_CS;
const gmRefreshToken = process.env.GOOGLE_RT;
const endUserEmail = process.env.ENDUSER_EMAIL;

//Configure SMTP transport
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	auth: {
		type: "OAuth2",
		user: gmUser,
		clientId: gmClientId,
		clientSecret: gmClientSecret,
		refreshToken: gmRefreshToken,
	}
});

//Message send function (Common)
function SendMessage(msgData){
		
	transporter.sendMail(msgData, (error,info) => {
		console.log("DEVLOG: Sending message to " + msgData.to);
		if (error) {
			console.log(error);
			console.log("DEVLOG: Message was not sent.");
		} else {
			console.log("DEVLOG: Message sent to " + msgData.to + ". Response: " + info.response);
		}
	});
};

//Test message function (Exported)
exports.SendTestMsg = function () {
	//Configure message data
	var link = serverUrl + 'api/status';
	
	var msgData = {
		to: gmUser,
		subject: '[Biborrezsi] Teszt üzenet',
		text: 'Kérlek kattints a következő hivatkozásra: ' + link
	};
	
	//Send the message
	SendMessage(msgData);
}

//Approve message function (Exported)
exports.SendApproveMsg = function (reportData, reportId, approveToken) {
	//Configure message data
	var link = serverUrl + 'api/reports/' + reportId + '/approve?t=' + approveToken;
	var msgData = {
		to: gmUser,
		subject: '[Biborrezsi] Új óraállás-jelentés',
		text: 'Új jelentés érkezett a Bíbor Rezsi weboldalon. Kattints ide a jóváhagyáshoz: ' + link
	};
	
	//Send the message
	SendMessage(msgData);
}