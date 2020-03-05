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
	var testData = {
		key1: 'value',
		key2: 2,
		key3: true
	};
	
	var link = serverUrl + 'api/status';
	var msgHtml = '<p>Value is ' + testData.key1 + 'two is ' + testData.key2 + ', boolean is ' + testData.key3 + '</p><br><a href="' + link + '">Server Status</a>';
	
	var msgData = {
		to: gmUser,
		subject: '[Biborrezsi] Teszt üzenet',
		html: msgHtml
	};
	
	//Send the message
	SendMessage(msgData);
}

//Approve message function (Exported)
exports.SendApproveMsg = function (reportData, reportId, approveToken) {
	//Configure message data
	var link = serverUrl + 'api/reports/' + reportId + '/approve?t=' + approveToken;
	
	var msgHtml = '<p>Új jelentés érkezett a Bíbor Rezsi weboldalon.</p><h4>Jelentés #'+reportId+'</h4><p>Hidegvíz: '+reportData.cold+'</p><p>Melegvíz: '+reportData.hot+'</p><p>Hőmennyiség: '+reportData.heat+'</p><p>Villanyóra: '+reportData.elec+'</p><p><a href="'+link+'">[ Jóváhagyás ]</a></p>'
	
	var msgData = {
		to: gmUser,
		subject: '[Biborrezsi] Új óraállás-jelentés',
		html: msgHtml
	};
	
	
	//Send the message
	SendMessage(msgData);
}