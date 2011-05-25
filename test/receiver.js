var receiver = require('receiver');
var appzone = require('appzone');
var assert = require('assert');

exports.testsReceive = function() {
	var port = 8009;
	var address = '11';
	var conversationId = '878';
	var message = 'dwwjd';
	
	var rec = receiver.load(port, function() {
		sender = appzone.sender('http://localhost:' + port, 'user', 'pass');
		sender.sendUssd(address, conversationId, message, function(err, resp) {
			assert.ok(!err);
			assert.ok(resp);
		});
	});
	
	rec.onMessage(function(ussd) {
		
		assert.equal(ussd.message, message);
		assert.equal(ussd.address, address);
		assert.equal(ussd.conversationId, conversationId);
		rec.close();
	});
};