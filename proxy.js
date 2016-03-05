var express = require('express');
var netApi = require('net-browserify');
var cors = require('cors');

// Create our app 
var app = express();

app.use(function(req, res, next) {
  var oldSetHeader = res.setHeader;
  res.setHeader = function() {
    if (!res._headerSent) {
      oldSetHeader.apply(res, arguments);
    } else {
      console.log('Headers already sent.');
    }
  };
  next();
});
app.use(cors({
  credentials: true,
  origin: 'https://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'CONNECT', 'HEAD', 'OPTIONS']
}));
app.use(netApi());


// Start the server 
var server = app.listen(3000, function() {
  console.log('Server listening on port ' + server.address().port);
});