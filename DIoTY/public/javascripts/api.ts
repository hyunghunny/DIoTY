if (typeof module !== 'undefined') {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

enum LogFlag { All, Critical, Major };
var logger = {
    flag : LogFlag.Critical,
    e: function (message) { 
        console.log('[ERROR] ' + message);
        if (message.stack) {
            console.log(message.stack);
        }
    },
    w: function (message) { if (this.flag != LogFlag.Critical) console.log('[WARN] ' + message);},
    i: function (message) { if (this.flag == LogFlag.All) console.log('[INFO] ' + message);}
}
logger.flag = LogFlag.All;


class SensorsManager {
    constructor (public url: string) {
        logger.i('The Manager of sensors at ' + url + ' is initialized.');
    }

    /**
    * \brief Get all sensors or a specific sensor with id.
    * \param callback RetrieveSensorsCallback callback = function (Sensor sensorObj or Sensor[] sensors)
    * \param id? DOMString sensorId
    */
    public retrieve(scb:Function, ecb?:Function, id?:string): void {                

        if (id != null) {
            this.url = this.url + '/' + id;
        }
        try {
             ajaxGet(this.url, function (xhr) {
                var jsonObj = JSON.parse(xhr.responseText);
                        
                if (jsonObj.sensors) {
                    var sensorList:Array<Sensor> =[];
                    // the array of sensors are returned
                    for (var i = 0; i < jsonObj.sensors.length ; i++) {
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

    }
}

interface SensorInfo {
    type: string;
    id: string;
    switch: string;
}

class Sensor {
    public type: string;
    public id: string;
    public status: string;
    constructor (public url:string, info:SensorInfo) {
        logger.i('sensor url: ' + this.url);
        logger.i(JSON.stringify(info));
        this.type = info.type;
        this.id = info.id;
        this.status = info['switch'];
    }

     public turnOn(scb: Function, ecb?:Function): void {
        var body:string = '{ "switch": "on" }';        
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

    }

    public turnOff(scb: Function, ecb?:Function): void {
        var body:string = '{ "switch": "off" }';
        
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
    }   
}

class Thermometer extends Sensor {
    constructor (url:string, info:SensorInfo) {
        super(url + '/' + info.id, info);    
    }

    public getTempList(scb: Function, ecb?:Function) : void {
        var url = this.url + '/temperatures';
        ajaxGet(url, function (xhr) {
            var jsonObj = JSON.parse(xhr.responseText);
            var temps = jsonObj.temperatures;
            var tempList:Array<TemperatureInfo> =[];
            logger.i('The number of temperatures: ' + temps.length);
            for (var i = 0; i < temps.length ; i++) {
                var temp = temps[i];
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
    }

    public getLatestTemp(scb: Function, ecb?:Function) : void {
        var url = this.url + '/temperatures/latest';
        ajaxGet(url, function (xhr) {
            var jsonObj = JSON.parse(xhr.responseText);
            var temp = jsonObj.temperature;
            logger.i(temp.datePublished + '\t' + temp.value);
            scb(temp);
        }, function (err) {
                if (ecb) {
                    ecb(err);   
                } else {
                    logger.e(err);
                }  
            });

    }
}

interface TemperatureInfo {
    datePublished: Date;
    value: number;
    unitOfMeasure: string;
}

interface OpenAPIOptions {
    ipAddress: string;    
}

function ajaxGet(url:string, scb: Function, ecb: Function): void {
    try {
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

function ajaxPut(url:string, body:string, scb: Function, ecb: Function): void {
    try {
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

// Factory class for creating APIs object
class OpenAPIManager {

    public options: OpenAPIOptions;
    public sensors: SensorsManager;

    constructor(options?:OpenAPIOptions) {
        // default options
        this.options = {
            ipAddress: 'http://127.0.0.1:3000'
        }
        if (options && options.ipAddress) {
            this.options.ipAddress = options.ipAddress;
        } 
        this.sensors = new SensorsManager(this.options.ipAddress + '/api/sensors');        
  
    }
}

// Open API discovery in nearby devices class 
class OpenAPIFinder {

    private classA: number = 0;
    private classB: number = 0;
    private classC: number = 0;
    private portNumber: number = 3000;
    private gatewayFlag: boolean = false;

    public setGateway(gatewayAddress:string, portNumber:number): boolean {
           // validate gatewayAddress. it should be ###.###.###.1
        if (this.checkGateway(gatewayAddress)) {
            logger.i('Open API finder will search devices in ' + gatewayAddress + ':' + portNumber);
            this.portNumber = portNumber;
            this.gatewayFlag = true;
        } else {
            this.gatewayFlag = false;
       }
       return this.gatewayFlag;     
    }

    private checkGateway(ip):boolean {
        var x = ip.split("."), x1, x2, x3, x4;

        logger.i(ip + ' -> ' + x[0] + x[1] + x[2] + x[3]);

        if (x.length == 4) {
            x1 = parseInt(x[0], 10);
            x2 = parseInt(x[1], 10);
            x3 = parseInt(x[2], 10);
            x4 = parseInt(x[3], 10);

            if (isNaN(x1) || isNaN(x2) || isNaN(x3) || isNaN(x4)) {
                logger.e('non numeric string input');
                return false;
            }

            if ((x1 >= 0 && x1 <= 255) && (x2 >= 0 && x2 <= 255) && (x3 >= 0 && x3 <= 255) && (x4 == 1)) {
                this.classA = x1;
                this.classB = x2;
                this.classC = x3;
                return true;
            }
        }
        return false;
    }  
    public find(scb:Function, ecb:Function): void {
        if (this.gatewayFlag == false) {
            ecb(new Error('gateway address is not set yet.'));
            return;
        }
        
        var nearbySensors: Array<string> = [];
        var prefix: string = 'http://' + this.classA + '.' + this.classB + '.' + this.classC + '.';
        var postfix: string =  ':' + this.portNumber;    
        /*
        retrieveAsync(prefix, postfix, nearbySensors, function (list) {
            if (list.length > 0) {
                scb(list);
            } else {
                ecb(new Error('No devices found!'));
            }          
        });
        */
            
        retrieveSync(prefix, 2, postfix, nearbySensors, function(list) {
            if (list.length > 0) {
                scb(list);
            } else {
                ecb(new Error('No devices found!'));
            }        
 
        });
        
        
    }
}

function retrieveSync(prefix:string, i: number, postfix:string, list: Array<string>, cb: Function) {
    var candidate = new OpenAPIManager({ ipAddress: prefix + i + postfix });
    candidate.sensors.retrieve(function (sensors) {
        
        for (var j = 0; j < sensors.length; j++) {
            logger.i(sensors[j].url + ' is available in the local network.');
            list.push(sensors[j].url);    
        }
        i++;
        if (i <= 255) {
            retrieveSync(prefix, i, postfix, list, cb);
        } else {
            cb(list);
        }                

    }, function (err) {
        i++;
        if (i <= 255) {
            retrieveSync(prefix, i, postfix, list, cb);
        } else {
            cb(list);
        } 

    });
}

var errorCount = 0;
var errorLimit = 10;
var cbFlag = false;
function retrieveAsync(prefix:string, postfix:string, list: Array<string>, cb: Function) {
    for (var i = 2; i <= 255; i++) {
        var candidate = new OpenAPIManager({ ipAddress: prefix + i + postfix });
        candidate.sensors.retrieve(function (sensors) {
            
            for (var j = 0; j < sensors.length; j++) {
                logger.i(sensors[j].url + ' is available in the local network.');
                list.push(sensors[j].url);    
            }                           

        }, function (err) {
            logger.w('Error count is ' + errorCount);
            errorCount++;
            if (errorCount > errorLimit && cbFlag == false) {
                cb(list);
                cbFlag = true;
            } 

        });       
    }

}

// exposes API if the script is on server side.
if (typeof module !== 'undefined') {
    exports.myapi = new OpenAPIManager();
    exports.logger = logger;
    exports.finder = new OpenAPIFinder();
}