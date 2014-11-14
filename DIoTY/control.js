var config = require('./config'),
    arduino = require('./arduino'),
    mongodb = require('mongodb');

var dbServer = new mongodb.Server(config.mongodb.host, config.mongodb.port, { auto_reconnect: true });
var db = new mongodb.Db(config.mongodb.dbName, dbServer, { w: 1 });
var listenerId = null;
var tempsCollection = null;

db.open(function (err, connection) {
    console.log('database opened.');

    db.collection(config.mongodb.collectionName, function (err, collection) {
        tempsCollection = collection;
    });
});

process.on('exit', function (code) {
    db.close();
});

exports.writeToDb = function (mode, cb) {

    if (mode == 'on') {            
        if (listenerId == null) {

            arduino.connect(function (board) {
                if (tempsCollection == null) {
                    // error to open mongodb 
                    console.log('mongodb does not initialize properly.');
                    cb(false);
                } else {
                    listenerId = arduino.addTempListener(board, function (tempValue) {
                        
                        var tempObj = {
                            datePublished: new Date(),
                            value: tempValue,
                            unitOfMeasure: "celsius"
                        };
                        
                        tempsCollection.insert(tempObj, function (err, result) {
                            console.log(result._id + ' has been inserted.');
                            cb(true);
                        }); 
                    }); 
                }

            }, function (err) {
                console.log('unable to connect arduino board.');
                cb(false);
            });

        } else {
            cb(true);
        }
    } else {
        // stop to write temperatures into database 
        arduino.removeTempListener(listenerId);
        cb(true);
    }
};

exports.getTemperatureList = function (callback, queries) {
    console.log("try to retrieve database...");
    try {
        if (tempsCollection == null) {
            console.log('mongodb does not initialize properly.');
            throw new Error('500');
        } else {
            // TODO: handle queries later
            tempsCollection.find({}, { _id: false }).toArray(function (err, result) {
               callback(result);
            });
        }
    } catch (err) {
        console.log("DB query error : " + err.message);
        throw new Error('500');
    }
};

exports.getLatestTemperature = function (callback) {
    try {
        if (tempsCollection == null) {
            console.log('mongodb does not initialize properly.');
            throw new Error('500');
        } else {
            
            tempsCollection.find({}, { _id: false })
                .sort({ $natural : -1 })
                .limit(1)
                .toArray(function (err, result) {
               callback(result[0]);
            });
        }
    } catch (err) {
        console.log("DB query error : " + err.message);
        throw new Error('500');
    }
}