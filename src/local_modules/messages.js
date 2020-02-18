const nodemailer = require("nodemailer");
const gmUser = process.env.GMAIL_USER;
const gmClientId = process.env.GOOGLE_CID;
const gmClientSecret = process.env.GOOGLE_CS;
const gmRefreshToken = process.env.GOOGLE_RT;

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

exports.SendTestMsg = function SendTestMsg() {
	//Configure message data
	var msgData = {
		from: gmUser,
		to: gmUser,
		subject: 'Test email from Bíborrezsi nodejs server',
		text: 'This email serves to test the nodemailer functionalities.'
	};
	
	//Send the message
	transporter.sendMail(msgData, (error,info) => {
		if (error) {
			console.log(error);
			console.log("DEVLOG: Message was not sent.");
		} else {
			console.log("DEVLOG: Message sent to " + msgData.to + ". Response: " + info.response);
		}
	});
}
