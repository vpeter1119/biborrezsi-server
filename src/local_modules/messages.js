const nodemailer = require("nodemailer");
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
exports.SendTestMsg = function SendTestMsg() {
	//Configure message data
	var msgData = {
		from: gmUser,
		to: gmUser,
		subject: "Test email from Bíborrezsi nodejs server",
		text: "This email serves to test the nodemailer functionalities."
	};
	
	//Send the message
	SendMessage(msgData);
}

//Approve message function (Exported)
exports.SendApproveMsg = function SendApproveMsg(reportData, reportId, approveToken) {
	//Configure message data
	var msgData = {
		from: gmUser,
		to: gmUser,
		subject: "[Biborrezsi Server] New report on Bíbor Rezsi!",
		html: '<p>User has submitted a new report to Bíborrezsi Server:</p><h4>Report report_id</h4><table><thead><th>Név</th><th>Állás</th></thead><tbody><tr><td>Hidegvíz</td><td>'+ reportData.cold +'</td></tr></tbody></table><p>Click on the link below to approve the report:</p><p><a href="https://biborrezsi-server.herokuapp.com/api/report?id=report_id&a=approve&t=approve_token">[APPROVE]</a></p>'
	};
	
	//Send the message
	SendMessage(msgData);
}