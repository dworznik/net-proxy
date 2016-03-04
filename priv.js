
var bcoin = require('bcoin');
var bitcore = require('bitcore-lib');
// bcoin.protocol.network.set('testnet');

//priv: '5Cz4DHGZgmjhEpjoqq3Sa3LFv3u5E5RUnerVuH5wuwwZqwtnPU8wRsJKftz5k3mq3pEcoGEWEtC8uWy1JRtwzKDK'


var w = bcoin.wallet(
    {

        priv: bcoin.utils.toArray('a5ba7338078f84b3dd94a7d06ecba5ffd85f09ecc21cf337262a8da73bd1ac5d', 'hex')
    }
)
console.log(w.toAddress());

var bk = new bitcore.PrivateKey('a5ba7338078f84b3dd94a7d06ecba5ffd85f09ecc21cf337262a8da73bd1ac5d');
var bpk = bk.toPublicKey();
console.log(bpk.toAddress(bitcore.Networks.livenet));