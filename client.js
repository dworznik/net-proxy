var net = require('net');

// Optionaly, set a custom proxy address 
// (defaults to the current host & port) 
net.setProxy({
    hostname: 'localhost',
    port: 3000
});

// Use the net module like on a server 
var socket = net.connect({
    host: 'localhost',
    port: 8080
});

socket.on('connect', function() {
    console.log('Connected to localhost!');
});