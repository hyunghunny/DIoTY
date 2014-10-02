var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
if (typeof module !== 'undefined') {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

var LogFlag;
(function (LogFlag) {
    LogFlag[LogFlag["All"] = 0] = "All";
    LogFlag[LogFlag["Critical"] = 1] = "Critical";
    LogFlag[LogFlag["Major"] = 2] = "Major";
})(LogFlag || (LogFlag = {}));
;
var logger = {
    flag: 1 /* Critical */,
    e: function (message) {
        console.log('[ERROR] ' + message);
    },
    w: function (message) {
        if (this.flag != 1 /* Critical */)
            console.log('[WARN] ' + message);
    },
    i: function (message) {
        if (this.flag == 0 /* All */)
            console.log('[INFO] ' + message);
    }
};
logger.flag = 0 /* All */;

var Sensor = (function () {
    function Sensor(url, id, type) {
        this.url = url;
        this.id = id;
        this.type = type;
        logger.i('sensor url: ' + this.url);
    }
    return Sensor;
})();

var Thermometer = (function (_super) {
    __extends(Thermometer, _super);
    function Thermometer(url, id) {
        _super.call(this, url + '/' + id, id, 'thermometer');
    }
    Thermometer.prototype.retrieveAll = function (callback) {
        var url = this.url + '/temperatures';
        ajaxGet(url, function (xhr) {
            var jsonObj = JSON.parse(xhr.responseText);
            var temps = jsonObj.temperatures;
            var tempList = [];
            logger.i('The number of temperatures: ' + temps.length);
            for (var i = 0; i < temps.length; i++) {
                var temp = temps[i];
                logger.i(temp.datePublished + '\t' + temp.value);
                tempList.push(temp);
            }
            callback(tempList);
        });
    };

    Thermometer.prototype.retrieveLatest = function (callback) {
        var url = this.url + '/temperatures/latest';
        ajaxGet(url, function (xhr) {
            var jsonObj = JSON.parse(xhr.responseText);
            var temp = jsonObj.temperature;
            logger.i(temp.datePublished + '\t' + temp.value);
            callback(temp);
        });
    };
    return Thermometer;
})(Sensor);

function ajaxGet(url, scb) {
    try  {
        this.url = url;
        var xhr = new XMLHttpRequest();
        if (!xhr) {
            throw new Error('AJAX object is not initialized properly.');
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    scb(xhr);
                } else {
                    throw new Error('There was a problem with the request: ' + xhr.status);
                }
            }
        };
        logger.i('AJAX REQUEST: ' + url);
        xhr.open('GET', url);
        xhr.send();
    } catch (error) {
        logger.e(error);
    }
}

function OpenAPI(options) {
    var APIs = {
        ipAddress: 'http://127.0.0.1:3000',
        sensors: {
            /**
            * \brief Get all sensors or a specific sensor with id.
            * \param callback RetrieveSensorsCallback callback = function (Sensor sensorObj or Sensor[] sensors)
            * \param id DOMString sensorId
            */
            retrieve: function (callback, id) {
                this.url = this.ipAddress + '/api/sensors';

                if (id != null) {
                    this.url = this.url + '/' + id;
                }

                ajaxGet(this.url, function (xhr) {
                    var jsonObj = JSON.parse(xhr.responseText);

                    if (jsonObj.sensors) {
                        var sensorList = [];

                        for (var i = 0; i < jsonObj.sensors.length; i++) {
                            var sensor = jsonObj.sensors[i];
                            switch (sensor.type) {
                                case 'thermometer':
                                    var thermometer = new Thermometer(this.url, sensor.id);
                                    sensorList.push(thermometer);
                                    break;
                                default:
                                    throw new Error('Unsupported sensor type');
                                    break;
                            }
                        }
                        logger.i('the array of sensors are returned');
                        callback(sensorList);
                    } else if (jsonObj.sensor) {
                        // a sensor is returned
                        logger.i('a sensor is returned');
                        var sensor = jsonObj.sensor;
                        var thermometer = new Thermometer(this.url, sensor.id);
                        callback(thermometer);
                    } else {
                        throw new Error('Mismatched JSON type returned.');
                    }
                });
            }
        }
    };
    if (options && options.ipAddress) {
        APIs.ipAddress = options.ipAddress;
    }
    APIs.sensors.ipAddress = APIs.ipAddress;

    return APIs;
}

var apis = new OpenAPI();
apis.sensors.retrieve(function (sensor) {
    logger.i('sensors are successfully retrieved.');
    if (sensor.length >= 1) {
        for (var i = 0; i < sensor.length; i++) {
            logger.i('number of sensors: ' + sensor.length);
            logger.i(sensor[i].id);
            sensor[i].retrieveAll(function (list) {
                logger.i(list.length + ' temperatures are retrieved properly.');
            });
            sensor[i].retrieveLatest(function (temp) {
                logger.i('latest temperature is ' + temp.value + ' ' + temp.unitOfMeasure);
            });
        }
    } else {
        logger.i(sensor.id);
    }
});
