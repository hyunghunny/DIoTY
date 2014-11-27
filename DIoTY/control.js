var config = require('./config');

var arduino = require(config.arduino.default.uri);
var DBManager = require('./dbmgr');
var dbmgr = new DBManager(config.mongodb);

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

Thermometer.prototype.setMode = function (mode, cb) {
    if (mode == 'on') {
        if (listenerId == null) {            
            arduino.board.connect(function () {
                if (!dbmgr.isReady()) {
                    // error to open mongodb 
                    console.log('mongodb does not initialize properly.');
                    cb(false);
                } else {
                    listenerId = arduino.board.hygrometer.addListener(
                        function (tempValue, humidityValue) {
                            
                            dbmgr.insert(tempValue, humidityValue);
                        }
                    );
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
        if (listenerId != null) {
            arduino.board.hygrometer.removeListener(listenerId);
        }
        cb(true);
    }
}

Thermometer.prototype.getTemperatureList = function (callback, queries) {
    console.log("try to retrieve database...");
    if (!dbmgr.isReady()) {
        console.log('mongodb does not initialize properly.');
        throw new Error('500');
    } else {
        dbmgr.findAll(queries, callback);
    }
}

Thermometer.prototype.getLatestTemperature = function (callback) {

    if (!dbmgr.isReady()) {
        console.log('mongodb does not initialize properly.');
        throw new Error('500');
    } else {
        dbmgr.findLatest(callback);
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