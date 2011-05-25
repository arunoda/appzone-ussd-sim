var nodespy = require('nodespy');
var nodemock = require('nodemock');
var session = require('session');
var rest = require('restler');
var assert = require('assert');
nodespy(rest);

exports.testsSendMessage = function() {
	
	var s = null;
	
	rest.stub('post', function(url, data) {
		
		assert.equal(data.headers['X-Message-Type'], 'X-USSD-Message');
		assert.equal(data.headers['X-Requested-Shortcode'], '4499');
		assert.equal(data.headers['X-Requested-Conversation-ID'], s.conversationId);
		assert.equal(data.headers['X-Requested-Version'], '1.0');
		
		var d = JSON.parse(data.data);
		assert.equal(d.message, 'hello');
		assert.equal(d.address, '0721234567');
		var ctrl = {
				on: function(event, callback) {
					if(event == 'complete') {
						callback('', { statusCode: 200 });
					}
					return ctrl;
				}
		};
		
		return ctrl;
	});
	
	s = session.load('http://url').initiate('0721234567');
	s.sendMessage('hello', function(err) {
		assert.ok(!err);
	});
};

exports.testsTerminate = function() {

	var s = null;
	
	rest.stub('post', function(url, data) {
		
		assert.equal(data.headers['X-Message-Type'], 'X-USSD-Terminate-Message');
		assert.equal(data.headers['X-Requested-Shortcode'], '4499');
		assert.equal(data.headers['X-Requested-Conversation-ID'], s.conversationId);
		assert.equal(data.headers['X-Requested-Version'], '1.0');
		
		var ctrl = {
				on: function(event, callback) {
					if(event == 'complete') {
						callback('', { statusCode: 200 });
					}
					return ctrl;
				}
		};
		
		return ctrl;
	});
	
	s = session.load('http://url').initiate('0721234567');
	s.terminate(function(err) {
		assert.ok(!err);
	});
};

exports.testsError = function() {

	var s = null;
	
	rest.stub('post', function(url, data) {
		
		assert.equal(data.headers['X-Message-Type'], 'X-USSD-Terminate-Message');
		assert.equal(data.headers['X-Requested-Shortcode'], '4499');
		assert.equal(data.headers['X-Requested-Conversation-ID'], s.conversationId);
		assert.equal(data.headers['X-Requested-Version'], '1.0');
		
		var ctrl = {
				on: function(event, callback) {
					if(event == 'error') {
						callback({}, {});
					}
					return ctrl;
				}
		};
		
		return ctrl;
	});
	
	s = session.load('http://url').initiate('0721234567');
	s.terminate(function(err) {
		assert.ok(err);
	});
};