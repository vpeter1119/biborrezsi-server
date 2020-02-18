const nodemailer = require("nodemailer");
const gmUser = process.env.GMAIL_USER;
const gmPass = process.env.GMAL_APP_PW;

//Configure SMTP transport
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: gmUser,
		pass: gmPass
	}
});

exports = function SendTestMsg() {
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
