const nodemailer = require("nodemailer");
const Email = require('email-templates');
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

//Configure generic email instance
const email = new Email({
	views: { root: __dirname },
	message: {from: gmUser},
	send: true,
	transport: transporter,	
});

//Message send function (Common)
function SendMessage(sendTo, msgTemplate, msgData){
	
	email.send({
		//Configure message data
		template: msgTemplate,
		message: {to: sendTo},
		locals: msgData,
	})
	.then(console.log)
	.catch(console.error);
	
	/* transporter.sendMail(msgData, (error,info) => {
		console.log("DEVLOG: Sending message to " + msgData.to);
		if (error) {
			console.log(error);
			console.log("DEVLOG: Message was not sent.");
		} else {
			console.log("DEVLOG: Message sent to " + msgData.to + ". Response: " + info.response);
		}
	}); */
};

//Test message function (Exported)
exports.SendTestMsg = function SendTestMsg() {
	//Configure message data
	var msgTemplate = 'test-message';
	var msgData = {
		message: 'This is the correct test message.',
		link: '/api/status',
	};
	
	//Send the message
	SendMessage(gmUser, msgTemplate, msgData);
}

//Approve message function (Exported)
exports.SendApproveMsg = function SendApproveMsg(reportData, reportId, approveToken) {
	//Set message text
	var content = ('<p>User has submitted a new report to Bíborrezsi Server:</p><p><a href=biborrezsi-server.herokuapp.com/api/reports/"' + reportId + '/approve?t=' + approveToken + '"></a></p>');
	//Configure message data
	var msgData = {
		from: gmUser,
		to: gmUser,
		subject: "[Biborrezsi Server] New report on Biborrezsi!",
		html: content
	};
	
	//Send the message
	SendMessage(msgData);
}
