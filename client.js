var bcoin = require('bcoin');
bcoin.protocol.network.set('testnet');
var net = require('net');
var levelup = require('levelup');

var sqldown = require('sqldown');

var storage = levelup('./db.sqlite3', {
    db: sqldown,
    valueEncoding: 'json'
});

// var storage = sqldown('./db.sqlite3');

// storage.on('error', function(err) {
//     console.log(err);
// });


// Standard bitcoin seeds
// var seeds = [
//     'seed.bitcoin.sipa.be',
//     'dnsseed.bluematt.me',
//     'dnsseed.bitcoin.dashjr.org',
//     'seed.bitcoinstats.com',
//     'seed.bitnodes.io',
//     'bitseed.xf2.org'
// ];

var seeds = bcoin.protocol.network.seeds;

var index = 0;
var pool = bcoin.pool({
    // Number of peers allowed
    size: 32,
    redundancy: 1,
    parallel: 4000,
    loadWindow: 750,
    // This function must return a socket that supports the standard
    // node socket model: `write()`, `destroy()` `on('data')`, etc.
    createConnection: function() {
        console.log('connecting');
        if (index >= seeds.length) {
            index = 0;
        }

        var addr = seeds[index++];
        var parts = addr.split(':');
        var host = parts[0];
        var port = +parts[1] || 18333;
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
    console.log(JSON.stringify(block));
    console.log(block.txs);
    console.log('Received block %s from %s.', hash, ip);
});

// Receive a transaction.
pool.on('tx', function(tx, peer) {
    var hash = bcoin.utils.revHex(tx.hash('hex'));
    var ip = peer.socket.remoteAddress;
    console.log(tx);
    console.log('Received transaction %s from %s.', hash, ip);
});


// var privkey = bcoin.wallet().getPrivateKey('base58');


var privkey = 'L4iRU4MQH92nZRokxoYaHxTCyerx5K6Pu4PTfc59sdEN9usAPdRa';

var wallet = new bcoin.wallet({
    priv: privkey,
    storage: pool.storage
});

console.log('Opened our wallet with address: %s', wallet.getAddress());

// Make sure we keep an eye on any transactions pertaining to us.
pool.watch(wallet.getPublicKey());
pool.watch(wallet.getHash());

pool.once('full', finish);
process.once('SIGINT', finish);

var once = false;
function finish() {
    if (once)
        return;
    once = true;

    console.log('Done...');
    pool.destroy();
}


// Watch our balance update as we receive transactions.
wallet.on('balance', function(balance) {
    // Convert satoshis to BTC.
    var btc = bcoin.utils.toBTC(balance);
    console.log('Your wallet balance has been updated: %s', btc);
});
