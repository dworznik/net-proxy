var express = require('express');
var path = require('path');
var webpack = require('webpack');

var netApi = require('net-browserify');
var cors = require('cors');

// Create proxy
var proxy = express();

proxy.use(function(req, res, next) {
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
proxy.use(cors({
    credentials: true,
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'CONNECT', 'HEAD', 'OPTIONS']
}));
proxy.use(netApi());


// Start the server 
var server = proxy.listen(3000, function() {
    console.log('Server listening on port ' + server.address().port);
});

var static_path = path.join(__dirname);

var app = express();
app.use(express.static(static_path))
  .get('/', function (req, res) {
    res.sendFile('index.html', {
      root: static_path
    });
  }).listen(process.env.PORT || 8080, function (err) {
    if (err) { console.log(err) };
    console.log('Listening at localhost:' + (process.env.PORT || 8080));
  });