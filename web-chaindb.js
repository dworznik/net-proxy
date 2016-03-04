var bcoin = require('bcoin');
var network = bcoin.protocol.network;
var utils = bcoin.utils;
var assert = utils.assert;

/**
 * Web ChainDB
 */
function ChainDB(chain, options) {
    if (!(this instanceof ChainDB))
        return new ChainDB(chain);

    if (!options)
        options = {};

    this.options = options;
    this.chain = chain;

    this._queue = [];
    this._cache = {};
    this._bufferPool = {
        used: {}
    };
    this.tip = -1;
    this.size = 0;
    this.fd = null;

    this.storage = this.options.storage || chain.storage;

    // Need to cache up to the retarget interval
    // if we're going to be checking the damn
    // target all the time.
    if (network.powAllowMinDifficultyBlocks)
        this._cacheWindow = network.powDiffInterval + 1;
    else
        this._cacheWindow = network.block.majorityWindow + 1;

    this._init();
}

ChainDB.prototype._init = function _init() {};

ChainDB.prototype.exists = function exists() {
return false;
};

ChainDB.prototype.getSize = function getSize() {
return 999999999999; //TODO
};

ChainDB.prototype.count = function count(cb) {
console.log('count');
this.storage.chain.toCollection().last(function(data) {
    if (data)
        return cb(null, data.height + 1);
    return cb(null, 0);
})
};

ChainDB.prototype.cache = function cache(entry) {
    console.log('Cashing %j', entry);
if (entry.height > this.tip) {
    this.tip = entry.height;
    delete this._cache[entry.height - this._cacheWindow]
    ;
    this._cache[entry.height] = entry;
    assert(Object.keys(this._cache).length <= this._cacheWindow);
}
};

ChainDB.prototype.all = function all(cb) {
return this.storage.chain.each(function(item) {
    console.log(item);
    cb(item);
})
}

ChainDB.prototype.get = function get(height) {
return this.getSync(height);
};

ChainDB.prototype.getSync = function getSync(height) {
var data, entry, error;
console.log('Checking height: ' + height);
console.log(JSON.stringify(this._cache));
if (this._cache[height])
    return this._cache[height];

if (this._queue[height])
    return this._queue[height];

if (height < 0 || height == null)
    return;

    //TODO it doesn't fetch anything from the db

    // height = this._pad(height);

    // var ret, error;

    // this.getAsync(height, function(err, res) {
    //     if (err) {
    //         error = err;
    //     } else {
    //         ret = res;
    //     }
    // })

    // while (!data && !error) {
    // }

    // if (!data)
    //     return;

    // entry = ChainBlock.fromJSON(this.chain, data);
    // this.cache(entry);

// return entry;
};

ChainDB.prototype.getAsync = function getAsync(height, callback) {
var self = this;
height = this._pad(height);
this.storage.chain.get(height).then(function(entry) {
    return callback(null, entry);
}).catch(function(err) {
    return callback(err);
})
};

ChainDB.prototype.save = function save(entry, cb) {
return this.saveAsync(entry, cb);
};

ChainDB.prototype.saveAsync = function saveAsync(entry, callback) {
console.log('Saving entry: %j', entry);
var self = this;
if (!this.storage)
    return;

// Cache the past 1001 blocks in memory
// (necessary for isSuperMajority)
this.cache(entry);

// Something is already writing. Cancel it
// and synchronously write the data after
// it cancels.
if (this._queue[entry.height]) {
    this._queue[entry.height] = entry;
    return callback();
}

// Speed up writes by doing them asynchronously
// and keeping the data to be written in memory.
this._queue[entry.height] = entry;

var obj = this._preSave(entry);
callback = utils.asyncify(callback);
console.log('Use storage');
this.storage.chain.add(obj).then(function(data) {
    console.log('Add: success');
    delete self._queue[entry.height]
    callback(null, data);
}).catch(function(err) {
    console.log('Add: error ' + err);
    delete self._queue[entry.height]
    callback(err);
});
};

ChainDB.prototype.saveSync = function saveAsync(entry, callback) {
console.log('Saving entry sync: %j', entry);
var self = this;
if (!this.storage)
    return;

var obj = this._preSave(entry);
callback = utils.asyncify(callback);
console.log('Use storage');
this.storage.chain.add(obj).then(function(data) {
    console.log('Add: success');
    callback(null, data);
}).catch(function(err) {
    console.log('Add: error ' + err);
    callback(err);
});
}

ChainDB.prototype.remove = function remove(height) {
assert(height >= 0);
//TODO
return true;
};


ChainDB.prototype.has = function has(height) {
console.log('Calling has');
var data;

if (this._queue[height] || this._cache[height])
    return true;

if (height < 0 || height == null)
    return false;

if ((height + 1) * BLOCK_SIZE > this.size)
    return false;

data = this._has(height);

if (!data)
    return false;


};

ChainDB.prototype._has = function _has(height) {
height = this._pad(height);
var ret;
var error;

this.storage.chain.get(height)(function(entry) {
    ret = entry;
}).catch(function(err) {
    error = err;
});

while (!ret && !error) {
}
return ret;
}

ChainDB.prototype._preSave = function _preSave(entry) {
var json = entry.toJSON();
if (json === undefined)
    return null;
json.paddedHeight = this._pad(json.height);
return json;
}

ChainDB.prototype._pad = function _pad(height) {
if (height === undefined)
    return height;
var pad = '000000000000';
return (pad + height).slice(-pad.length);
}

module.exports = ChainDB;
