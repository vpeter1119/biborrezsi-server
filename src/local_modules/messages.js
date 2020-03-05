const nodemailer = require("nodemailer");
const EmailTemplate = require('email-templates').EmailTemplate;
const mailRoot = (__dirname + '/emails');
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

//Template-based sender function
var sendTestEmail = transporter.templateSender(
	new EmailTemplate('./templates/test'), {from: gmUser}
);

exports.SendTestMsg = function () {
	sendTestEmail({
		to: gmUser,
		subject: 'Test email from Biborrezsi Server'
	}, {
		message: 'This is the correct test message.',
		link: (serverUrl + '/api/status')
	}, function (err, info) {
		if (err) {
			console.log(err);
		} else {
			console.log('Link sent\n' + JSON.stringify(info));
		}
	});
};

///////////////////////////////////////////////////////

//Configure generic email instance
console.log("DEVLOG: " + mailRoot);
const email = new Email({
	views: { root: mailRoot },
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
/* exports.SendTestMsg = function SendTestMsg() {
	//Configure message data
	var msgTemplate = 'test-message';
	var msgData = {
		message: 'This is the correct test message.',
		link: '/api/status',
	};
	
	//Send the message
	SendMessage(gmUser, msgTemplate, msgData);
} */
