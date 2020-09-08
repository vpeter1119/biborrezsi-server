const nodemailer = require("nodemailer");
const EmailTemplate = require('email-templates').EmailTemplate;
const serverUrl = "https://biborrezsi-server.herokuapp.com/";
const gmUser = process.env.GMAIL_USER;
const endUserEmail = process.env.ENDUSER_EMAIL;
const finalEmail = process.env.FINAL_EMAIL;
const finalRecName = process.env.FINAL_REC_NAME;
const myAddress = process.env.MY_ADDRESS;
const myName = process.env.MY_NAME;

// SMTP configuration
const smtp_host = process.env.SMTP_HOST;
const smtp_port = process.env.SMTP_PORT;
const smtp_user = process.env.SMTP_USER;
const smtp_pass = process.env.SMTP_PASS;

// Message configuration
const email_server = process.env.EMAIL_SERVER; // For the 'from' property
const email_maintainer = process.env.EMAIL_MAINTAINER; // Secret copy to developer address
const email_user = process.env.EMAIL_USER; // Confirmation is sent to the user after approving report => this should be handled dynamically later
const email_reportTo = process.env.EMAIL_REPORTTO; // Who to send the final report to
const name_reportTo = process.env.NAME_REPORTTO; // How to adress them


// Configure SMTP transport
const transporter = nodemailer.createTransport({
	host: smtp_host,
	port: smtp_port,
	secure: false,
	auth: {
		user: smtp_user,
		pass: smtp_pass
	},
	tls: {
		rejectUnauthorized: false
	}
});

//Message send function (Common)
function SendMessage(msgData){
		
	transporter.sendMail(msgData, (error,info) => {
		console.log("Sending message to " + msgData.to);
		if (error) {
			console.log(error);
			console.log("Message was not sent.");
		} else {
			console.log(`Message sent to ${info.appected}.`);
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
		to: email_maintainer,
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