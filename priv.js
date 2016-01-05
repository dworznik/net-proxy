
var bcoin = require('bcoin');

var privkey = bcoin.wallet().getPrivateKey('base58');
console.log(privkey);