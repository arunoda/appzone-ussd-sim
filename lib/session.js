/**
	Sending USSD Message to Application
*/

var rest = require('restler');

exports.load = function(appUrl) {
	return {
		initiate: function(phone) {
			return new Session(appUrl, phone);
		}
	};
};

var id = 0;
var correlation = 1;

function Session(appUrl, phone) {
	
	this.conversationId = ++id; 
	var headers = [];
	headers['X-Requested-Shortcode'] = '4499';
	headers['Content-Type'] = 'application/json';
	headers['X-Requested-Version'] = '1.0';
	headers['X-Requested-Conversation-ID'] = this.conversationId;
	
	this.sendMessage = function (message, callback) {
		
		headers['X-Message-Type'] = 'X-USSD-Message';
		
		var request = {
				correlationId: ++correlation,
				address: phone,
				message: message
		};
		
		console.log('sending message: %s', JSON.stringify(request));
		sendMessage(headers, request, callback);
	};
	
	this.terminate = function (callback) {
		
		headers['X-Message-Type'] = 'X-USSD-Terminate-Message';
		
		var request = {
				correlationId: ++correlation,
				address: phone
		};
		sendMessage(headers, request, callback);
	};
	
	function sendMessage(headers, request, callback) {
		
		rest.post(appUrl + '/ussd/', {
			headers: headers,
			data: JSON.stringify(request)
			
		}).on('complete', sendCompleted).on('error', sendError);
		
		function sendCompleted(data, response) {
			console.log("message sent: %s", JSON.stringify(request));
			callback(null);
		}
		
		function sendError(data, err) {
			console.error('something wrong sending message: %s  with error:',
					JSON.stringify(request), JSON.stringify(err));
			callback(err);
		}
	}
}