
var net = require('net-browserify');

console.log(net);
// Optionaly, set a custom proxy address 
// (defaults to the current host & port) 
net.setProxy({
    hostname: 'localhost',
    port: 3000
});

console.log('go');
// Use the net module like on a server 
var socket = net.connect({
    host: 'localhost',
    port: 9090
});

socket.on('connect', function() {
    console.log('Connected to localhost!');
});

socket.write('dupa\n\r');

document.write("It works.");