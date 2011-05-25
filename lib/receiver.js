var connect = require('connect');

exports.load = function(port, afterStarted) {
	
	return new Receiver(port, afterStarted);
};

function Receiver(port, afterStarted) {
	
	var correlator = 32;
	var onMessageCallback = null;
	var onAuthCallback = null;
	var that = this;
	
	var app = connect.createServer(
			connect.bodyParser(),
			function(req, res, next) {
				
				var ussd = {
						address: req.body.address,
						message: req.body.message,
						sessionTermination: req.body.sessionTermination,
						conversationId: req.headers['x-requested-conversation-id'],
						version: req.headers['x-requested-version']
				};
				
				console.log("receiving ussd: " + JSON.stringify(ussd));
				
				var statusCode = "SBL-USSD-MT-2000";
				var statusMessage = "SUCCESS";
				
				if(onMessageCallback) {
					console.log("calling the onMessage callback with ussd: " + JSON.stringify(ussd));
					onMessageCallback(ussd);
					
				}
				
				var response = {
						correlationId: correlator++,
						statusCode: 'SBL-USSD-MT-2000',
						statusDescription: 'SUCCESS'
				};
				
				console.log("sending the response: " + JSON.stringify(response));
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end(JSON.stringify(response));
				
	});
	
	console.log("Simulator started on port: " + port);
	app.listen(port, function() {
		//after the server started
		if(afterStarted)  afterStarted();
	});
	
	function whenAuth(user, pass) {
//		console.log("calling the onAuth callback with user: " + user + " pass: " + pass);
		if(onAuthCallback) {
			onAuthCallback(user, pass);
		}
		return true;
	}
	
	this.onMessage = function(callback) {
		onMessageCallback = callback;
	};
	
	this.onAuth = function(callback) {
		onAuthCallback = callback;
	};
	
	this.close = function() {
		app.close();
	};
	
}