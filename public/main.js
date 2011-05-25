
/**
 * Sessions
 */
function Session(phone) {
	
	this.phoneNo = phone;
	this.state = Session.SESSION_TERMINATED;
	this.display = '';
}

Session.SESSION_STARTED = 1;
Session.SESSION_TERMINATED = 2;

var sessions = [];
var currentSession = null;

$(document).ready(function() {
	DNode.connect(dNodeConnected);
	sessionSwitch();
});

function dNodeConnected(remote) {
	
	api = remote;
	
	loadSessions();
	loadAppUrl();
	handleConfiguration();
	handleStartSession();
	handleSendMessage();
	handleTerminate();
}

function handleStartSession() {
	/**
	 * Start a Session
	 */
	$('#optionView #startSession').click(function() {
		
		var phoneNo = $('#phoneNo').val();
		sessions[phoneNo] = new Session(phoneNo);
		api.onMessage(phoneNo,receiveMessages);
		api.startSession(phoneNo, function(err) {
			if(!err) {
				console.log('session created for: %s', phoneNo);
				addOptionToSessionList(phoneNo);
				currentSession = sessions[phoneNo];
			} else {
				notifyError(err.message);
				delete sessions[phoneNo];
			}
			$('#phoneNo').val('');
		});
	});
}

function handleConfiguration() {
	/**
	 * Configuration
	 */
	$('#configure').click(function() {
		
		var appUrl = $('#appUrl').val();
		api.reset();
		api.init(appUrl, afterInitialized);
		
		function afterInitialized() {
			$('#manager').show();
		}
	});
}

function handleSendMessage() {
	
	$('#send').click(function() {
		
		if(currentSession) {
			var message = $('#messageBox').val();
			api.sendMessage(currentSession.phoneNo, message, afterSent);
			
			function afterSent(err) {
				if(err) {
					notifyError(err.message);
				} else {
					notifyMessage("message sent");
				}
				
				$('#messageBox').val('');
				$('#messageBox').focus();
			}
		} else {
			notifyError('Please select a Session');
		}
	});
}

/**
 * Terminate current Session
 */
function handleTerminate() {
	
	$('#terminate').click(function() {
		
		if(currentSession) {
			
			api.terminateSession(currentSession.phoneNo, afterTerminated);
			
			function afterTerminated(err) {
				if(err) {
					notifyError(err.message);
				} else {
					console.log('session for: %s terminated', currentSession.phoneNo);
					$('#sessions option[value=' + currentSession.phoneNo +']').remove();
					notifyMessage("Session Terminated");
					$('#display').text('');
					
					//switch the session
					delete sessions[currentSession.phoneNo];
					currentSession = sessions[$('#sessions').val()];
					renderDisplay();
				}
				
			}
		} else {
			notifyError('Please select a Session');
		}
	});
}

//receive messages
function receiveMessages(ussd) {
	var session = sessions[ussd.address];
	if(session) {
		console.log('receiving message: %s for: %s', ussd.message, ussd.address);
		session.display = ussd.message;
	} else {
		console.log('receiving message: %s for: %s (No Session Attached)', ussd.message, ussd.address);
	}
	
	renderDisplay();
}

//rendering the display
function renderDisplay() {

	if(currentSession) {
		$('#display').text(currentSession.display);
	}
}

//sessionSwitch
function sessionSwitch() {
	$('#sessions').change(function() {
		
		var session = sessions[$(this).val()];
		if(session) {
			console.log('changing current session to: %s', session.phoneNo);
			currentSession = session;
			renderDisplay();
		}
	});
}

//loadSessions by getting details from the API
function loadSessions() {
	
	api.getSessions(function(list) {
		console.log("loading sessions %s", JSON.stringify(list));
		sessions = [];
		list.forEach(function(phoneNo) {
			api.onMessage(phoneNo, receiveMessages);
			sessions[phoneNo] = new Session(phoneNo);
			addOptionToSessionList(phoneNo);
		});
		
		if(list.length > 0) {
			currentSession = sessions[list[0]];
		}
	});

}

//load AppUrl from the Server if Configured
function loadAppUrl() {
	
	api.getAppUrl(function(appUrl) {
		$('#appUrl').val(appUrl);
	});
}


/*
 * GENERAL METHODS
 */
function notifyError(message) {
	alert(message);
}

function notifyMessage(message) {
	window.title = message;
}

function addOptionToSessionList(phoneNo) {
	$('#sessions').append('<option selected="selected">' + phoneNo + '</option>');
}