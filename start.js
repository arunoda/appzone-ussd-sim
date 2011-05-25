var config = require('./conf/config').load();
console.log(config);

var api = require('./lib/api').load(config.listenerPort);

var express = require('express');
var app = express.createServer();
app.use(express.static(__dirname + '/public'));
app.listen(config.uiPort);

var dnode = require('dnode');
var server = dnode(api);
server.listen(app);