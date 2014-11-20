var config = require('./config'),
    mongodb = require('mongodb');

var arduino = require(config.arduino.default.uri);

var dbServer = new mongodb.Server(config.mongodb.host, 
    config.mongodb.port, 
    { auto_reconnect: true });

var db = new mongodb.Db(config.mongodb.dbName, 
    dbServer, 
    { w: 1 });

var listenerId = null;
var myCollection = null;

db.open(function (err, connection) {
    console.log('database opened.');

    db.collection(config.mongodb.collectionName, function (err, collection) {
        myCollection = collection;
    });
});

process.on('exit', function (code) {
    // close database on exit.
    db.close();
});

exports.api = {
    "api": [{
            "id": "/api/sensors",
            "type": "ItemList"
        },
        {
            "id": "/api/actuators",
            "type": "ItemList"
        }]
};

/*************************************************************************/
// Sensors

function Thermometer(id) {
    this.type = "thermometer";
    this.id = id;
    this.switch = "off";
}
var prevObj = null;
Thermometer.prototype.setMode = function (mode, cb) {
    if (mode == 'on') {
        if (listenerId == null) {
            arduino.connect(function () {
                if (myCollection == null) {
                    // error to open mongodb 
                    console.log('mongodb does not initialize properly.');
                    cb(false);
                } else {
                    listenerId = arduino.addSensorListener(function (tempValue, humidityValue) {
                        var sensingObj = {
                            datePublished: new Date(),
                            value: tempValue,
                            unitOfMeasure: "celsius",
                            humidity: humidityValue
                        };
                        if (prevObj === null) {
                            prevObj = sensingObj;
                        } else if (prevObj.value !== sensingObj.value || 
                            prevObj.humidity !== sensingObj.humidity) {
                            // insert object when the values of an object is updated.
                            console.log(sensingObj.datePublished.toTimeString() + 
                                ":temperature: " + sensingObj.value + "C, " + 
                                "humidity: " + sensingObj.humidity + "%");
                            myCollection.insert(sensingObj, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } 
                            });
                            prevObj = sensingObj; // save the object as the previous object
                        }

                    });
                    cb(true);
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
        arduino.removeListener(listenerId);
        cb(true);
    }
}

// translate dateString to Date object considering with appropriate time zone difference.
function getLocalDate(dateString) {
    var date = new Date(dateString);
    var timeZoneOffset = date.getTimezoneOffset();
    //console.log('time zone offset: ' + timeZoneOffset + ' mins');
    date.setMinutes(date.getMinutes() + timeZoneOffset);
    return date;    
}

Thermometer.prototype.getTemperatureList = function (callback, queries) {
    console.log("try to retrieve database...");
    try {
        if (myCollection == null) {
            console.log('mongodb does not initialize properly.');
            throw new Error('500');
        } else {
            var options = { };
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
            myCollection.find(dbquery, { _id: false }, options).toArray(function (err, result) {
                callback(result);
            });
        }
    } catch (err) {
        console.log("DB query error : " + err.message);
        throw new Error('500');
    }
}

Thermometer.prototype.getLatestTemperature = function (callback) {
    try {
        if (myCollection == null) {
            console.log('mongodb does not initialize properly.');
            throw new Error('500');
        } else {
            
            myCollection.find({}, { _id: false })
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

var myThermometer = new Thermometer("thermometer1");

var sensorsObj = {
    sensors: [ myThermometer ],
    find : function (id) {
        var sensorObj = null;
        var sensorList = this.sensors;
        for (var i = 0; i < sensorList.length; i++) {
            if (sensorList[i].id == id) {
                sensorObj = sensorList[i];
                return sensorObj;
            }
        }
        return null;
    }
};

exports.sensors = sensorsObj;

/*************************************************************************/
// Actuators

function Led(id) {
    this.type = 'led',
    this.id = id;
    this.switch = 'off';
}

Led.prototype.setMode = function (mode, cb) {
    arduino.connect(function () {
        arduino.setLedMode(mode);
        cb(true);
    }, function (err) {
        cb(false);
    });
}

var myLed = new Led("led0");

var actuatorsObj = {
    actuators: [myLed],
    find : function (id) {
        var actuatorObj = null;
        var actuatorList = this.actuators;
        for (var i = 0; i < actuatorList.length; i++) {
            if (actuatorList[i].id == id) {
                actuatorObj = actuatorList[i];
                return actuatorObj;
            }
        }
        return null;
    }
};

exports.actuators = actuatorsObj;