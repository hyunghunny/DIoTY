var config = require('./config'),
    mongodb = require('mongodb');

var arduino = require(config.arduino.default.uri);

var dbServer = new mongodb.Server(
    config.mongodb.host, 
    config.mongodb.port, 
    { auto_reconnect: true }
);

var db = new mongodb.Db(config.mongodb.dbName, 
    dbServer, 
    { w: 1 }
);

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

/*************************************************************************/
// APIs
var APIManager = function (contentType) {
    this.contentType = contentType;    
};

APIManager.prototype.getBillboard = function () {
    if (this.contentType == 'application/json') {
        var apiObj = {
            "api": [{
                    "href": "/api/sensors",
                    "type": "ItemList"
                },
        {
                    "href": "/api/actuators",
                    "type": "ItemList"
                }]
        }
        return JSON.stringify(apiObj);
    }
    // TODO: add more content type here.
}

APIManager.prototype.getContentHeader = function () {
    return { "Content-Type": this.contentType };
}

exports.api = new APIManager('application/json');


/*************************************************************************/
// Sensors

var Sensor = function (id) {
    this.type = 'sensor';
}

var prevSensingObj = null;

var Thermometer = function (id) {
    this.type = "thermometer";

    this.id = id;
    this.switch = "off";

    this.api = [{
            "href" : "/api/sensors/" + this.id + "/temperatures",
            "type": "ItemList"
        },
        {
            "href" : "/api/sensors/" + this.id + "/temperatures/latest",
            "type": "ItemList"
        }
    ]
}

var listenerId = null;
Thermometer.prototype.startLogging = function () {
    //TODO: check the sensor parts
    listenerId = arduino.board.hygrometer.addListener(
        function (tempValue, humidityValue) {            
            var sensingObj = {
                datePublished: new Date(),
                value: tempValue,
                unitOfMeasure: "celsius",
                humidity: humidityValue
            };
            
            if (prevSensingObj === null) {
                prevSensingObj = sensingObj; // save the sensingObj at first retrieving

            } else if (prevSensingObj.value !== sensingObj.value ||
                        prevSensingObj.humidity !== sensingObj.humidity) {

                // insert object when the values of an object is updated.
                console.log(sensingObj.datePublished.toTimeString() + 
                                    ":temperature: " + sensingObj.value + "C, " + 
                                    "humidity: " + sensingObj.humidity + "%");
                myCollection.insert(sensingObj, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                });
                prevSensingObj = sensingObj; // save the object as the previous object
            }
        });
}

Thermometer.prototype.stopLogging = function () {
    //TODO: check the sensor parts

    if (listenerId != null) {        
        arduino.board.hygrometer.removeListener(listenerId);
    }
}

Thermometer.prototype.setMode = function (mode, cb) {
    if (mode == 'on') {
        if (listenerId == null) {            
            arduino.board.connect(function () {
                if (myCollection == null) {
                    // error to open mongodb 
                    console.log('mongodb does not initialize properly.');
                    cb(false);
                } else {                    
                    this.startLogging();
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
        this.stopLogging();
        cb(true);
    }
}

// translate dateString to Date object considering with appropriate time zone difference.
Thermometer.prototype.getLocalDate = function (dateString) {
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
                var startDate = this.getLocalDate(dateString);
                var endDate = this.getLocalDate(dateString);
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


var SensorsManager = function(array) {
    this.sensors = array;
    this.api = [];
    for (var i = 0; i < array.length; i++) {
        var apiObj = {
            "href": "/api/sensors/" + array[i].id,
            "type": "ItemList"
        }
        this.api.push(apiObj);
    }
}

SensorsManager.prototype.find = function (id) {
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

//TODO: add more sensors to SensorsManager 
exports.sensors = new SensorsManager(
    [
        new Thermometer("thermometer1")
    ]
);

/*************************************************************************/
// Actuators

var Led = function (id) {
    this.type = 'led',
    this.id = id;
    this.switch = 'off';

}

Led.prototype.setMode = function (mode, cb) {
    var led = arduino.board.builtinLed;
    arduino.board.connect(function () {
        switch (mode) {
            case 'on':
                led.stop();
                led.on();
                console.log('LED is on.');
                this.switch = 'on';
                break;

            case 'off':
                led.stop();
                led.off();
                console.log('LED is off');
                this.switch = 'off';
                break;

            case 'blink':
                led.stop();
                console.log('LED is blinking');
                led.blink();
                this.switch = 'blink';
                break;

            case 'fade':
                builtinLed.stop();
                console.log('LED is fading');
                led.fade();
                this.switch = 'fade';
                break;

            default:
                console.log('invalid mode - Set LED off');
                led.stop();
                led.off();
                break;
        }
        cb(true);
    }, function (err) {
        cb(false);
    });
}

var ColorLed = function(id) {
    this.type = 'led',
    this.id = id;
    this.switch = 'off';
}

ColorLed.prototype.setMode = function (mode, cb) {
    var led = arduino.board.colorLed;
    arduino.board.connect(function () {
        switch (mode) {
            case 'on':
                led.on();
                console.log('LED is on.');
                this.switch = 'on';
                break;

            case 'off':
                led.off();
                console.log('LED is off');
                this.switch = 'off';
                break;

            default:
                console.log('Set LED color to ' + mode);
                led.setColor(mode);
                this.switch = mode;
                break;
        }
        cb(true);
    }, function (err) {
        cb(false);
    });
}

var ActuatorsManager = function (array) {
    this.actuators = array;
    this.api = [];
    for (var i = 0; i < array.length; i++) {
        var apiObj = {
            "href": "/api/actuators/" + array[i].id,
            "type": "ItemList"
        }
        this.api.push(apiObj);
    }
}

ActuatorsManager.prototype.find = function (id) {
    var actuatorsObj = null;
    var actuatorList = this.actuators;
    for (var i = 0; i < actuatorList.length; i++) {
        if (actuatorList[i].id == id) {
            actuatorObj = actuatorList[i];
            return actuatorObj;
        }
    }
    return null;
}

//TODO: add more actuators to ActuatorsManager 
exports.actuators = new ActuatorsManager(
    [
        new Led("led0"), 
        new ColorLed("led1")
    ]
);