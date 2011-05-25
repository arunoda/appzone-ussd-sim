var appzone = require('appzone');
var config = require('./config').load();

var receiver = appzone.receiver(config.port);
var sender = appzone.sender('http://localhost:8002', config.appId, config.password);

var count = [];
receiver.onUssd(function(ussd) {
	console.log('receiving message: %s', JSON.stringify(ussd));
	if(count[ussd.conversationId] == null) {
		count[ussd.conversationId] = 0;
 	}
	
	var message = 'reply back' + ++count[ussd.conversationId];
	sender.sendUssd(ussd.address, ussd.conversationId, message, function(err, resp) {
		if(err) {
			console.log('message: %s to: %s failed with: %s', message, ussd.address, err);
		} else {
			console.log('message: %s sent to: %s', message, ussd.address);
		}
	});
});

receiver.onUssdTerminate(function(ussd) {
	console.log('receiving terminate message: %s', JSON.stringify(ussd));
	if(count[ussd.conversationId] != null) {
		count[ussd.conversationId] = null;
	}
});