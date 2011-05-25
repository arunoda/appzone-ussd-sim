var config = {
	
		server: {
			url: 'http://localhost:8002',
			appId: 'app',
			password: 'pass'
		},
		port: 8005
};

exports.load = function() {
	return config;
};