"use strict";
require('babel-register');
var socket = require('../src/socket.js');
var config = require('../src/config').default
var app = require('../src/server').default
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(app.get('port'), function (){
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
io.on('connection', socket);
