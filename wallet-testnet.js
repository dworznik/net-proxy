var assert = require('assert');
var dns = require('dns');
var net = require('net');
var path = require('path');
var bcoin = require('../bcoin');
bcoin.protocol.network.set('testnet');

var levelup = require('levelup');
var sqldown = require('sqldown');

var storage = levelup('./db.testnet.sqlite3', {
    db: sqldown,
    valueEncoding: 'json'
});



var seeds = bcoin.protocol.network.seeds;
seeds.unshift('testnet-seed.runter.net');
console.log(seeds);

var index = 0;
var pool = bcoin.pool({
    seeds: seeds,
    size: 64,
    redundancy: 2,
    parallel: 2000,
    loadWindow: 1000,
    storage: storage
});


pool.on('debug', function() {
    console.log.apply(null, arguments);
});

pool.on('block', function(block) {
    var hash = bcoin.utils.revHex(block.hash('hex'));
    console.log('Got: %s from %s chain len %d orp %d act %d queue %d',
        hash,
        new Date(block.ts * 1000).toString(),
        pool.chain.index.hashes.length,
        pool.chain.orphan.count,
        pool.request.active,
        pool.request.queue.length);
});


pool.on('error', function(err) {
    console.log('Error: %s', err.message);
});


var privkey = 'L4iRU4MQH92nZRokxoYaHxTCyerx5K6Pu4PTfc59sdEN9usAPdRa';

var wallet = new bcoin.wallet({
    priv: privkey,
    storage: pool.storage
});

console.log('Opened our wallet with address: %s', wallet.getAddress());
console.log('Hash: ' + wallet.getHash());
// Make sure we keep an eye on any transactions pertaining to us.
pool.watch(wallet.getPublicKey());
pool.watch(wallet.getHash());
// Watch our balance update as we receive transactions.
wallet.on('balance', function(balance) {
    // Convert satoshis to BTC.
    var btc = bcoin.utils.toBTC(balance);
    console.log('Your wallet balance has been updated: %s', btc);
});

pool.once('full', finish);
process.once('SIGINT', finish);

var once = false;
function finish() {
    console.log('WAT');
    if (once)
        return;
    once = true;
    console.log('Done...');
    pool.destroy();
}
