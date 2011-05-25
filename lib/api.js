var EventEmitter = require("events").EventEmitter;

exports.load = function(listenerPort) {
	return new Api(listenerPort);
};

function Api(listenerPort) {
	
	var sessions = [];
	var messageListeners = new EventEmitter();
	var terminateListeners = new EventEmitter();
	var receiver = require('./receiver').load(listenerPort);
	var appUrl = '';
	
	var session;
	
	receiver.onMessage(function(ussd) {

		if(ussd.sessionTermination == true) {
			console.log('session terminated for: %s', ussd.address);
			terminateListeners.emit(ussd.address);
			delete sessions[ussd.address];
		} else {
			console.log('tarnsfering message for: %s', ussd.address);
			messageListeners.emit(ussd.address, ussd);
		}
	});
	
	this.startSession = function(address, callback) {
		
		console.log('starting session for: %s', address);
		//check for the Initiation
		if(!session) {
			if(callback instanceof Function) callback({code: 'NOT_INIT', message: 'not initiated with a APP'});
		} else if(sessions[address]) {
			if(callback instanceof Function) callback({code: 'SESSION_EXISTS', message: 'session already started'});
		} else {
			sessions[address] = session.initiate(address);
			this.sendMessage(address, "", function(err) {
				
				if(!err) {
					if(callback instanceof Function) callback();
				} else {
					console.log('First session message of the: %s failed', address);
					if(callback instanceof Function) callback({code: 'SENDING_FAILED', message: 'message sending failed. appUrl may not be correct'});
				}
				
			});
		}
		
		
	};
	
	this.sendMessage = function(address, message, callback) {
		
		console.log('sending message: %s to: %s', message, address);
		//check for the Initiation
		if(!session) {
			if(callback instanceof Function) callback({message: 'not initiated with a APP'});
			return;
		}
		
		if(sessions[address]) {
			
			sessions[address].sendMessage(message, function(err) {
				if(err) {
					console.log('message: %s sending to address: %s failed: %s', message, address, JSON.stringify(err));
					if(callback instanceof Function) callback(err);
				} else {
					console.log('message: %s sent to address: %s', message, address);
					if(callback instanceof Function) callback(null);
				}
			});
			
		} else {
			if(callback instanceof Function) {
				callback({
					message: 'no session exists'
				});
			}
		}
	};
	
	this.terminateSession = function(address, callback) {
		
		//check for the Initiation
		if(!session) {
			if(callback instanceof Function) callback({message: 'not initiated with a APP'});
			return;
		}
		
		console.log('terminating session for: %s', address);
		
		if(sessions[address]) {
			
			sessions[address].terminate(function(err) {

				if(err) {
					console.log('session for:%s termination failed with:', address, JSON.stringify(err));
					if(callback instanceof Function) callback(err);
				} else {
					console.log("session for:% terminated", address);
					if(callback instanceof Function) callback(null);
				}
			});
			
			delete sessions[address];
			
		} else {
			if(callback instanceof Function) {
				callback({
					message: 'no session exists'
				});
			}
		}
	};
	
	this.onMessage = function(address, callback) {
		
		//check for the Initiation
		if(!session) {
			if(callback instanceof Function) callback({message: 'not initiated with a APP'});
			return;
		}
		
		messageListeners.on(address, callback);
	};
	
	this.onTerminate = function(address, callback) {
		
		//check for the Initiation
		if(!session) {
			if(callback instanceof Function) callback({message: 'not initiated with a APP'});
			return;
		}
		
		terminateListeners.on(address, callback);
	};
	
	this.init = function(appUrl_, callback) {
		
		appUrl = appUrl_;
		console.log('initalizing with appUrl: %s', appUrl);
		if(session) {
			console.log('asks to init already initialized session with url:%s', appUrl);
			callback({message: 'session already started'});
			return;
		}
		
		session = require('./session').load(appUrl);
		if(callback instanceof Function) callback();
	};
	
	this.reset = function(callback) {
		
		console.log('resetting');
		sessions = [];
		messageListeners = new EventEmitter();
		terminateListeners = new EventEmitter();
		session = null;
		
		if(callback instanceof Function) callback();
	};
	
	this.getSessions = function(callback) {
		
		var phones = [];
		for(var index in sessions) {
			phones.push(index);
		}
		
		if(callback instanceof Function) callback(phones);
	};
	
	this.getAppUrl = function(callback) {
		if(callback instanceof Function) callback(appUrl);
	};
}