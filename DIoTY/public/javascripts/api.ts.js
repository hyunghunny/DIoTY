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
        if (message.stack) {
            console.log(message.stack);
        }
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
logger.flag = 1 /* Critical */;

var SensorsManager = (function () {
    function SensorsManager(url) {
        this.url = url;
        logger.i('The Manager of sensors at ' + url + ' is initialized.');
    }
    SensorsManager.prototype.retrieve = function (scb, ecb, id) {
        if (id != null) {
            this.url = this.url + '/' + id;
        }
        try  {
            ajaxGet(this.url, function (xhr) {
                var jsonObj = JSON.parse(xhr.responseText);

                if (jsonObj.sensors) {
                    var sensorList = [];

                    for (var i = 0; i < jsonObj.sensors.length; i++) {
                        var sensor = jsonObj.sensors[i];
                        switch (sensor.type) {
                            case 'thermometer':
                                var thermometer = new Thermometer(this.url, sensor);
                                sensorList.push(thermometer);
                                break;
                            default:
                                throw new Error('Unsupported sensor type');
                                break;
                        }
                    }
                    logger.i('the array of sensors are returned');
                    scb(sensorList);
                } else if (jsonObj.sensor) {
                    // a sensor is returned
                    logger.i('a sensor is returned');
                    var sensor = jsonObj.sensor;
                    var thermometer = new Thermometer(this.url, sensor);
                    scb(thermometer);
                } else {
                    throw new Error('Mismatched JSON type returned.');
                }
            }, function (err) {
                ecb(err);
            });
        } catch (error) {
            logger.e(error);
            ecb(error);
        }
    };
    return SensorsManager;
})();

var Sensor = (function () {
    function Sensor(url, info) {
        this.url = url;
        logger.i('sensor url: ' + this.url);
        logger.i(JSON.stringify(info));
        this.type = info.type;
        this.id = info.id;
        this.status = info['switch'];
    }
    Sensor.prototype.turnOn = function (scb, ecb) {
        var body = '{ "switch": "on" }';
        ajaxPut(this.url, body, function (xhr) {
            this.status = 'on';
            logger.i('The sensor is ' + this.status);

            scb();
        }, function (err) {
            if (ecb) {
                ecb(err);
            } else {
                logger.e(err);
            }
        });
    };

    Sensor.prototype.turnOff = function (scb, ecb) {
        var body = '{ "switch": "off" }';

        ajaxPut(this.url, body, function (xhr) {
            this.status = 'off';
            logger.i('The sensor is ' + this.status);

            scb();
        }, function (err) {
            if (ecb) {
                ecb(err);
            } else {
                logger.e(err);
            }
        });
    };
    return Sensor;
})();

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var Thermometer = (function (_super) {
    __extends(Thermometer, _super);
    function Thermometer(url, info) {
        _super.call(this, url + '/' + info.id, info);
    }
    Thermometer.prototype.getTempList = function (scb, ecb, options) {
        var url = this.url + '/temperatures';
        if (options != null) {
            url = url + '?';
            if (options.date != null) {
                url = url + 'date=' + options.date;
            }
            if (options.limit != null) {
                if (!endsWith(url, '&')) {
                    url = url + '&';
                }
                url = url + 'limit=' + options.limit;
            }
            if (options.skip != null) {
                if (!endsWith(url, '&')) {
                    url = url + '&';
                }
                url = url + 'skip=' + options.skip;
            }
        }
        ajaxGet(url, function (xhr) {
            var jsonObj = JSON.parse(xhr.responseText);
            var temps = jsonObj.temperatures;
            var tempList = [];
            logger.i('The number of temperatures: ' + temps.length);
            for (var i = 0; i < temps.length; i++) {
                var temp = temps[i];
                temp.datePublished = new Date(temp.datePublished);
                logger.i(temp.datePublished + '\t' + temp.value);
                tempList.push(temp);
            }
            scb(tempList);
        }, function (err) {
            if (ecb) {
                ecb(err);
            } else {
                logger.e(err);
            }
        });
    };

    Thermometer.prototype.getLatestTemp = function (scb, ecb) {
        var url = this.url + '/temperatures/latest';
        ajaxGet(url, function (xhr) {
            var jsonObj = JSON.parse(xhr.responseText);
            var temp = jsonObj.temperature;
            temp.datePublished = new Date(temp.datePublished);
            logger.i(temp.datePublished + '\t' + temp.value);
            scb(temp);
        }, function (err) {
            if (ecb) {
                ecb(err);
            } else {
                logger.e(err);
            }
        });
    };
    return Thermometer;
})(Sensor);

// Factory class for creating APIs object
var OpenAPIManager = (function () {
    function OpenAPIManager(options) {
        // default options
        this.options = {
            ipAddress: ''
        };
        if (options && options.ipAddress) {
            this.options.ipAddress = options.ipAddress;
        }
        this.sensors = new SensorsManager(this.options.ipAddress + '/api/sensors');
    }
    return OpenAPIManager;
})();

function ajaxGet(url, scb, ecb) {
    try  {
        this.url = url;
        var xhr = new XMLHttpRequest();
        if (!xhr) {
            var err = new Error('AJAX object is not supported.');
            logger.e(err);
            ecb(err);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    scb(xhr);
                } else {
                    var err = new Error('Unexpected response: ' + xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('GET REQUEST: ' + url);
        xhr.open('GET', url);
        xhr.send();
    } catch (error) {
        logger.w(error);
        ecb(error);
    }
}

function ajaxPut(url, body, scb, ecb) {
    try  {
        this.url = url;
        var xhr = new XMLHttpRequest();
        if (!xhr) {
            var err = new Error('AJAX object is not supported.');
            logger.e(err);
            ecb(err);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 202) {
                    scb(xhr);
                } else {
                    var err = new Error('Unexpected response: ' + xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('PUT REQUEST: ' + url);
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    } catch (error) {
        logger.w(error);
        ecb(error);
    }
}

// Open API discovery in nearby devices class
var OpenAPIFinder = (function () {
    function OpenAPIFinder() {
        this.classA = 0;
        this.classB = 0;
        this.classC = 0;
        this.portNumber = 3000;
        this.nearbySensors = [];
    }
    OpenAPIFinder.prototype.checkAddress = function (ip) {
        var x = ip.split("."), x1, x2, x3, x4;

        if (x.length == 4) {
            x1 = parseInt(x[0], 10);
            x2 = parseInt(x[1], 10);
            x3 = parseInt(x[2], 10);
            x4 = x[3];

            if (isNaN(x1) || isNaN(x2) || isNaN(x3)) {
                logger.e('non numeric string input');
                return 'invaild';
            }

            if ((x1 >= 0 && x1 <= 255) && (x2 >= 0 && x2 <= 255) && (x3 >= 0 && x3 <= 255) && (x4 == '*')) {
                this.classA = x1;
                this.classB = x2;
                this.classC = x3;
                logger.i('retrieving submask: ' + ip);
                return 'range';
            } else if (parseInt(x4) >= 0 && parseInt(x4) <= 255) {
                return 'single';
            }
        } else {
            logger.e('invalid ip address');
            return 'invalid';
        }
    };

    OpenAPIFinder.prototype.findSensors = function (address, scb, ecb) {
        switch (this.checkAddress(address)) {
            case 'range':
                var prefix = 'http://' + this.classA + '.' + this.classB + '.' + this.classC + '.';
                var postfix = ':' + this.portNumber;

                /*
                // XXX:below code doesn't work properly.
                retrieveAsync(prefix, postfix, this.nearbySensors, function (list) {
                if (list.length > 0) {
                scb(list);
                } else {
                ecb(new Error('No devices found!'));
                }
                });
                */
                //XXX:below code works but it takes too long time :(
                logger.i('start to retrieve sensors...');
                retrieveSync(prefix, 2, postfix, this.nearbySensors, function (list) {
                    if (list.length > 0) {
                        scb(list);
                    } else {
                        ecb(new Error('No devices found!'));
                    }
                });
                break;

            case 'single':
                var candidate = new OpenAPIManager({ ipAddress: 'http://' + address + ':' + this.portNumber });
                candidate.sensors.retrieve(function (sensors) {
                    for (var j = 0; j < sensors.length; j++) {
                        logger.i(sensors[j].url + ' is available in the local network.');
                        this.nearbySensors.push(sensors[j]);
                    }
                    scb(this.nearbySensors);
                }, function (err) {
                    if (ecb) {
                        ecb(err);
                    } else {
                        logger.e(err);
                    }
                });
                break;

            default:
                var err = new Error('invalid IP address');
                if (ecb) {
                    ecb(err);
                } else {
                    logger.e(err);
                }
                break;
        }
    };
    return OpenAPIFinder;
})();
var findLimit = 10;
function retrieveSync(prefix, i, postfix, list, cb) {
    var candidate = new OpenAPIManager({ ipAddress: prefix + i + postfix });
    candidate.sensors.retrieve(function (sensors) {
        for (var j = 0; j < sensors.length; j++) {
            logger.i(sensors[j].url + ' is available in the local network.');
            list.push(sensors[j]);
        }
        i++;
        if (i <= findLimit) {
            retrieveSync(prefix, i, postfix, list, cb);
        } else {
            cb(list);
        }
    }, function (err) {
        i++;
        if (i <= findLimit) {
            retrieveSync(prefix, i, postfix, list, cb);
        } else {
            cb(list);
        }
    });
}

var errorCount = 0;
var errorLimit = 10;
var cbFlag = false;
function retrieveAsync(prefix, postfix, list, cb) {
    for (var i = 2; i <= findLimit; i++) {
        var retrieveOne = function (i) {
            var candidate = new OpenAPIManager({ ipAddress: prefix + i + postfix });
            candidate.sensors.retrieve(function (sensors) {
                for (var j = 0; j < sensors.length; j++) {
                    // XXX: the url which has been searched is wrong.
                    logger.i(sensors[j].url + ' is available in the local network.');
                    list.push(sensors[j]);
                }
            }, function (err) {
                logger.w('Error count is ' + errorCount);
                errorCount++;
                if (errorCount > errorLimit && cbFlag == false) {
                    cb(list);
                    cbFlag = true;
                }
            });
        };

        retrieveOne(i);
    }
}

// exposes API if the script is on server side.
if (typeof module !== 'undefined') {
    exports.myapi = new OpenAPIManager();
    exports.logger = logger;
    exports.finder = new OpenAPIFinder();
}
