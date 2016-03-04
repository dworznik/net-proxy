
var crypto = require('crypto');
var sourceCreateHash = crypto.createHash;
crypto.createHash = function createHash(alg) {
if (alg === 'ripemd160') {
    return sourceCreateHash('rmd160');
}

return sourceCreateHash(alg);
};

// var bcoin = require('../bcoin');
var Dexie = require('dexie');

describe('test', function() {
it('should run', function(done) {
    var db = new Dexie('TestDB');
    db.version(1).stores({
        store1: '++id, name'
    });
    db.open();
        jasmine.clock().tick();
    jasmine.clock().tick();

    db.store1.add({name: 'razdwaczy', 'wat': 2}).then(function() {
            jasmine.clock().tick();

        console.log('testtt');
        done();
        // db.store1.toCollection(function(t) {
        //     console.log(t);
        // });
    });
    jasmine.clock().tick();
        jasmine.clock().tick();

    jasmine.clock().tick();
        jasmine.clock().tick();
    jasmine.clock().tick();


    console.log('WAT')
});
});