const nodemailer = require("nodemailer");
const EmailTemplate = require('email-templates').EmailTemplate;
const serverUrl = "https://biborrezsi-server.herokuapp.com/";
const gmUser = process.env.GMAIL_USER;
const gmClientId = process.env.GOOGLE_CID;
const gmClientSecret = process.env.GOOGLE_CS;
const gmRefreshToken = process.env.GOOGLE_RT;
const endUserEmail = process.env.ENDUSER_EMAIL;
const finalEmail = process.env.FINAL_EMAIL;
const finalRecName = process.env.FINAL_REC_NAME;
const myAddress = process.env.MY_ADDRESS;
const myName = process.env.MY_NAME;


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
exports.SendApproveMsg = function (reportData, diffData, reportId, approveToken) {
	//Configure message data
	var link = serverUrl + 'api/reports/' + reportId + '/approve?t=' + approveToken;
	
	var msgHtml = '<p>Új jelentés érkezett a Bíbor Rezsi weboldalon.</p><h4>Jelentés #'+reportId+'</h4><p>Hidegvíz: '+reportData.cold+' (fogy: '+diffData.cold+')</p><p>Melegvíz: '+reportData.hot+' (fogy: '+diffData.hot+')</p><p>Hőmennyiség: '+reportData.heat+' (fogy: '+diffData.heat+')</p><p>Villanyóra: '+reportData.elec+' (fogy: '+diffData.elec+')</p><p><a href="'+link+'">[ Jóváhagyás ]</a></p>'
	
	var msgData = {
		to: gmUser,
		subject: '[Biborrezsi] Új óraállás-jelentés',
		html: msgHtml
	};
	
	
	//Send the message
	SendMessage(msgData);
}

//Final message function (Exported)
exports.SendFinalMsg = function (reportData, isLate) {
	//Configure message data
	var lateMessage = '';
	if (isLate) {
		lateMessage = 'Elnézést kérek a kései leadásért.';
	}
	var msgHtml = '<p>Tisztelt '+finalRecName+'!</p><p>A '+myAddress+' aktuális mérőóra-állásai:</p><br><p>Hidegvíz: '+reportData.cold+'</p><p>Melegvíz: '+reportData.hot+'</p><p>Hőmennyiség: '+reportData.heat+'</p><p>Villanyóra: '+reportData.elec+'</p><br><p>'+lateMessage+'</p><br><p>Köszönettel és üdvözlettel:</p><p>'+myName+'</p>';
	
	var msgData = {
		to: finalEmail,
		bcc: gmUser,
		subject: 'Aktuális mérőóra-állások (Bíbor utca)',
		html: msgHtml
	}
	
	//Send the message
	SendMessage(msgData);
}

//Monthly reminder (Exported)
exports.SendReminder = function () {
	//Configure message data
	var msgHtml = '<p>Emlékeztető: kérlek, add le az e havi óraállásokat a <a target="_blank" rel="noopener noreferrer" href="https://biborrezsi.web.app/">biborrezsi.web.app</a> oldalon. Köszönöm!</p>';
	
	var msgData = {
		to: endUserEmail,
		subject: 'Emlékeztető: Aktuális óraállások leadása',
		html: msgHtml
	}
	
	//Send the message
	SendMessage(msgData);
}

//Confirmation message after approval (Exported)
exports.SendConfirmation = function (reportData) {
	//Configure message data
	var msgHtml = '<p>Az alábbi óraállás-jelentés jóvá lett hagyva:</p><p>Hidegvíz: '+reportData.cold+'</p><p>Melegvíz: '+reportData.hot+'</p><p>Hőmennyiség: '+reportData.heat+'</p><p>Villanyóra: '+reportData.elec+'</p>';
	
	var msgData = {
		to: endUserEmail,
		bcc: gmUser,
		subject: 'Visszajelzés: aktuális óraállások jóváhagyva',
		html: msgHtml
	}
	
	//Send the message
	SendMessage(msgData);
}