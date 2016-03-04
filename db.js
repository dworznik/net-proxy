var Dexie = require('dexie');
console.log('DB');

var db = new Dexie('TestDB');
db.version(1).stores({
    store1: '++id,name'
});

db.version(2).stores({
    store1: '++id,&name,description'
});

db.version(3).stores({
    store1: '++id,&name,description,order'
});

db.open();
db.store1.add({
    name: 'razdwaczy',
    'wat': 2
}).then(function() {
	db.store1.each(function(item) {
		console.log(item);
	});
    console.log('testtt');
}).catch(function(err) {
	console.log(err);
});