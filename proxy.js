var express = require('express');
var netApi = require('net-browserify');
var cors = require('cors');

// Create our app 
var app = express();

app.use(cors({
    credentials: true,
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'CONNECT', 'HEAD', 'OPTIONS']
}));
app.use(netApi());


// Start the server 
var server = app.listen(3000, function() {
    console.log('Server listening on port ' + server.address().port);
});