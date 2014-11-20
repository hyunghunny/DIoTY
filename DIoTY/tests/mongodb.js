var mongodb = require('mongodb');
var dbServer = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongodb.Db('dioty', dbServer, { w: 1 });

var temp_collection;
var startTime;
db.open(function(err, connection) {

	db.collection('temperatures', function (err, collection) {
		temp_collection = collection;

		startTime = new Date();

		var date = '2014-11-19';
		var startDate = new Date(date);
		var endDate = new Date(date);
		endDate.setDate(endDate.getDate() + 1);
		console.log("from " + startDate + " to " + endDate);
		var options = {};

//		options.limit = 1000;
//		options.skip = 1000;

		var query = {
			"datePublished" : {
				$gt: startDate,
				$lt: endDate

			}
		}

		// all item will be listed
		//temp_collection.find({}, {_id: false }).limit(1000).toArray(function (err, result) {
		temp_collection.find(query, {_id: false }, options).toArray(function (err, result) {	
			//console.log(result);

			console.log(result[0]);
			var elepsedTime = new Date() - startTime;
			console.log(result.length + ' objects listed. elepsed time: ' + elepsedTime);

			var options = {
				_id : false,
				sort: [ '_id', 'desc' ]
			}
			
			// get a latest one
			temp_collection.find({}, {_id: false }).sort({ $natural : -1 }).limit(1).toArray(function (err, result) {
			//temp_collection.findOne({}, options, function (err, result) {

				console.log(result);
				console.log('The above is latest. ');
				// close database
				db.close();
				
			})

		})
	})
});