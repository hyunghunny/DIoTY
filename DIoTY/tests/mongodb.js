var mongodb = require('mongodb');
var dbServer = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongodb.Db('dioty', dbServer, { w: 1 });

var temp_collection;
db.open(function(err, connection) {
	console.log('database opened.');
	var jsonObj = {
		datePublished: new Date(),
		value: 20,
		unitOfMeasure: "celsius"
	};
	db.collection('temperatures', function (err, collection) {
		temp_collection = collection;
		temp_collection.insert(jsonObj, function (err, result) {

			console.log(result[0]);
			console.log('above object has been inserted.');

			// all item will be listed
			temp_collection.find({}, {_id: false }).toArray(function (err, result) {
				console.log(result);
				console.log('above objects listed.');
				
				// get a latest one
				temp_collection.find({}, {_id: false }).sort({ $natural : -1 }).limit(1).toArray(function (err, result) {

					console.log(result[0]);
					console.log('The above is latest. ');
					// close database
					db.close();
					
				})
				
			});

		})
	})
});