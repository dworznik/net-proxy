var bcoin = require('bcoin');
var net = require('net-browserify');
var leveljs = require('level-js');
var levelup = require('levelup');

net.setProxy({
    hostname: window.location.hostname,
    port: 3000
});

var storage = levelup('dupa', {
    db: leveljs,
    valueEncoding: 'json'
});

// Standard bitcoin seeds
var seeds = [
    'seed.bitcoin.sipa.be',
    'dnsseed.bluematt.me',
    'dnsseed.bitcoin.dashjr.org',
    'seed.bitcoinstats.com',
    'seed.bitnodes.io',
    'bitseed.xf2.org'
];

var index = 0;
var pool = new bcoin.pool({
    // Number of peers allowed
    size: 32,
    // This function must return a socket that supports the standard
    // node socket model: `write()`, `destroy()` `on('data')`, etc.
    createConnection: function() {
        if (index >= seeds.length) {
            index = 0;
        }

        var addr = seeds[index++];
        var parts = addr.split(':');
        var host = parts[0];
        var port = +parts[1] || 8333;
        var socket = net.connect(port, host);

        socket.on('connect', function() {
            console.log('Connected to %s:%d', host, port);
        });

        return socket;
    },
    // Storage DB for transactions and wallet, must support
    // the levelup `put`/`del`/`createReadStream` methods.
    storage: storage
});

pool.on('error', function(err) {
    console.log('Error: %s', err.message);
});

// Receive the address of another peer.
pool.on('addr', function(data, peer) {
    var host = data.ipv4 + ':' + data.port;
    if (!~seeds.indexOf(host)) {
        console.log('Found new peer: %s', host);
        seeds.push(host);
    }
});

// Receive a block.
pool.on('block', function(block, peer) {
    var hash = bcoin.utils.revHex(block.hash('hex'));
    var ip = peer.socket.remoteAddress;
    console.log(block);
    console.log('Received block %s from %s.', hash, ip);
    // Add tx hashes to our bloom filter. They're not useful if they're not our
    // own, but what the hell: let's see what's going on in the world of bitcoin.
    block.tx.forEach(function(hash) {
        pool.watch(hash);
    });
});

// Receive a transaction.
pool.on('tx', function(tx, peer) {
    var hash = bcoin.utils.revHex(tx.hash('hex'));
    var ip = peer.socket.remoteAddress;
    console.log(tx);
    console.log('Received transaction %s from %s.', hash, ip);
});


var privkey = bcoin.wallet().getPrivateKey('base58');

var wallet = new bcoin.wallet({
    priv: privkey,
    storage: pool.storage
});

console.log('Opened our wallet with address: %s', wallet.getAddress());

// Make sure we keep an eye on any transactions pertaining to us.
pool.watch(wallet.getPublicKey());
pool.watch(wallet.getHash());

// Watch our balance update as we receive transactions.
wallet.on('balance', function(balance) {
    // Convert satoshis to BTC.
    var btc = bcoin.utils.toBTC(balance);
    console.log('Your wallet balance has been updated: %s', btc);
});
