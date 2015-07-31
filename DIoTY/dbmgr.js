var mongodb = require('mongodb');

var MongoDBManager = function (options) {
    var dbServer = new mongodb.Server(
        options.host, 
        options.port, 
        { auto_reconnect: true }
    );
    
    var db = new mongodb.Db(options.dbName, 
    dbServer, 
    { w: 1 }
    );
    
    this.collection = null;
    this.prevObj = null;
    var self = this;
    db.open(function (err, connection) {
        if (err) {
            console.log(err);
        } else {
            console.log('database opened.');
            db.collection(options.collectionName, function (err, collection) {
                self.collection = collection;
            });
        }
 
    });
    
    process.on('exit', function (code) {
        // close database on exit.
        db.close();
    });

}

MongoDBManager.prototype.insert = function (tempValue, humidityValue) {
    var obj = {
        datePublished: new Date(),
        value: tempValue,
        unitOfMeasure: "celsius",
        humidity: humidityValue
    };    

    if (this.prevObj === null) {
        this.prevObj = obj; // save the sensingObj at first retrieving

    } else if (this.prevObj.value !== obj.value ||
               this.prevObj.humidity !== obj.humidity) {
        
        // insert object when the values of an object is updated.
        console.log(obj.datePublished.toTimeString() + 
                    ":temperature: " + obj.value + "C, " + 
                    "humidity: " + obj.humidity + "%");
        this.collection.insert(obj, function (err, result) {
            if (err) {
                console.log(err);
            }
        });
        this.prevObj = obj; // save the object as the previous object
    }

}

MongoDBManager.prototype.isReady = function () {
    return this.collection != null;
}

MongoDBManager.prototype.findAll = function (queries, callback) {
    var options = {};
    var dbquery = {};
    if (queries.limit != null) {
        options.limit = queries.limit;
    }
    
    if (queries.skip != null) {
        options.skip = queries.skip;
    }
    
    if (queries.date != null) {
        var dateString = queries.date;
        //XXX:validate dateString later
        var startDate = getLocalDate(dateString);
        var endDate = getLocalDate(dateString);
        endDate.setDate(endDate.getDate() + 1);
        console.log("from " + startDate + " to " + endDate);
        
        dbquery.datePublished = {
            $gt: startDate,
            $lt: endDate
        }
    }
    this.collection.find(dbquery, { _id: false }, options)
                .toArray(function (err, result) {
        if (err) {
            console.log('error during find all: ' + err);
        }
        callback(result);
    });
 
}

MongoDBManager.prototype.findLatest = function (callback) {
    this.collection.find({}, { _id: false })
                .sort({ $natural : -1 })
                .limit(1)
                .toArray(function (err, result) {
            if (err) {
                console.log('error during find latest: ' + err);
            }
            if (result != null && result.length == 1) {
                callback(result[0]);
            } else {
                callback(0); // XXX:unexpected return from mongodb
            }
        
    });
}
// translate dateString to Date object considering with appropriate time zone difference.
var getLocalDate = function (dateString) {
    var date = new Date(dateString);
    // XXX:This makes a timeshift to 15:00 hours 
    //var timeZoneOffset = date.getTimezoneOffset();
    //console.log('time zone offset: ' + timeZoneOffset + ' mins');
    //date.setMinutes(date.getMinutes() + timeZoneOffset);
    return date;
}

module.exports = MongoDBManager;