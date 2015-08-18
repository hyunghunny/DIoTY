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
logger.flag = LogFlag.Critical;

class DiscoveryManager {
    public ajax;

    constructor(public url: string) {
        this.ajax = new AJAXManager(url);
    }

    public retrieve(scb: Function, ecb?: Function, id?: string) {
        var self = this;
        this.ajax.get(function (jsonObj) {
            logger.i('retrieving ' + JSON.stringify(jsonObj) + ' successfully.'); 
            var list = self.find(jsonObj, id);
            logger.i('item found : ' + JSON.stringify(list));
            if (id == null && list.length > 0) {
                scb(list);
            } else if (list.length == 1) {
                scb(list[0]);
            } else if (ecb != null) {
                ecb('Not found');
            } else {
                logger.w('item not found at ' + JSON.stringify(jsonObj));
            }
        },
        function (err) {
            ecb(err);
        });
    }

    public find(jsonObj, id?: string): Array<ArduinoPart> {
        // abstract method. inherited class SHOULD implement this.
        logger.e('Invalid call!');
        return [];
    }

}

class SensorsManager extends DiscoveryManager {

    constructor(url: string) {
        url = url + '/api/sensors';        
        super(url);
        logger.i('The Manager of sensors at ' + url + ' initialized.');
    }

    public find(jsonObj, id?: string): Array<ArduinoPart> {
        var sensorList: Array<ArduinoPart> = [];
        var sensorsObj = jsonObj.sensors;   
        logger.i('Try to find item at ' + JSON.stringify(sensorsObj));
             
        if (sensorsObj) {            

            for (var i = 0; i < sensorsObj.length; i++) {
                var sensor = sensorsObj[i];
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
            logger.i('the array of sensors returns');
            if (id == null) {
                 return sensorList;
            } else {
                // get a sensor with specific ID
                for (var i = 0; i < sensorList.length; i++) {
                    var sensorObj = sensorList[i];
                    if (sensorObj.id == id) {
                        return [ sensorObj ];
                    }
                }
            }

        } else {
            throw new Error('Mismatched JSON type returned.');           
        }
    }
}

class ActuatorsManager extends DiscoveryManager {

    constructor(url: string) {
        url = url + '/api/actuators';
        logger.i('The Manager of actuators at ' + url + ' initialized.');
        super(url);
    }

    public find(jsonObj, id?: string): Array<ArduinoPart> {
        var actuatorList: Array<ArduinoPart> = [];
        var actuatorsObj = jsonObj.actuators;
        if (actuatorsObj) {

            for (var i = 0; i < actuatorsObj.length; i++) {
                var actuator = actuatorsObj[i];
                switch (actuator.type) {

                    case 'led':
                        var led = new Led(this.url, actuator);
                        actuatorList.push(led);
                        break;

                    default:
                        throw new Error('Unsupported type');
                        break;
                }
            }
            logger.i('the array of sensors returns');
            if (id == null) {
                return actuatorList;
            } else {
                // get a sensor with specific ID
                for (var i = 0; i < actuatorList.length; i++) {
                    var actuatorObj = actuatorList[i];
                    if (actuatorObj.id == id) {
                        return [actuatorObj];
                    }
                }
            }

        } else {
            throw new Error('Mismatched JSON type returned.');
        }
    }
}

interface ArduinoPartInfo {
    type: string;
    id: string;
    mode: string;
}

class ArduinoPart {
    public type: string;
    public id: string;
    public mode = 'off';
    
    constructor (public url:string, info:ArduinoPartInfo) {
        logger.i('url: ' + this.url);
        logger.i(JSON.stringify(info));
        this.type = info.type;
        this.id = info.id;
        this.mode = info['switch'];
    }

    public turnOn(scb: Function, ecb?:Function): void {
        logger.i('try to turn on...');
        var ajax = new AJAXManager(this.url);  
        this.mode = 'on';
        var self = this;     
        ajax.put({ 'switch': this.mode },
            function (xhr) {
                logger.i('The sensor is ' + self.mode);
                
                scb();

            },
            function (err) {
                self.mode = 'off';   
                if (ecb) {
                    ecb(err);   
                } else {
                    logger.e(err);
                }                
        });

    }

    public turnOff(scb: Function, ecb?:Function): void {
        logger.i('try to turn off...');
        var ajax = new AJAXManager(this.url);
        this.mode = 'off';
        var self = this;
        ajax.put({ 'switch': this.mode },
            function (xhr) {
                logger.i('The sensor is ' + self.mode);
                scb();

            },
            function (err) {
                self.mode = 'on';
                if (ecb) {
                    ecb(err);
                } else {
                    logger.e(err);
                }
            });
    }   
}

interface QueryOptions {
    date: string;
    limit: number;
    skip: number;
}

class Thermometer extends ArduinoPart {
    constructor (url:string, info:ArduinoPartInfo) {
        super(url + '/' + info.id, info);    
    }

    public getTempList(scb: Function, ecb?:Function, options?:QueryOptions) : void {
        var url = this.url + '/temperatures';
        if (options != null) {
            url = url + '?';
            if (options.date != null) {
                url = url + 'date=' + options.date;

            }
            if (options.limit != null) {
                if(!this.endsWith(url, '&')) {
                    url = url + '&';
                }
                url = url + 'limit=' + options.limit;
            }
            if (options.skip != null) {
                if(!this.endsWith(url, '&')) {
                    url = url + '&';
                }
                url = url + 'skip=' + options.skip;
            }                        
        }
        var ajax = new AJAXManager(url);
        ajax.get(function (jsonObj) {
            
            var temps = jsonObj.temperatures;
            var tempList:Array<TemperatureInfo> = [];
            logger.i('The number of temperatures: ' + temps.length);
            for (var i = 0; i < temps.length ; i++) {
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
    }

    public getLatestTemp(scb: Function, ecb?:Function) : void {
        var ajax = new AJAXManager(this.url + '/temperatures/latest');
        ajax.get(function (jsonObj) {
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
    }

    private endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
}

class Led extends ArduinoPart {
    constructor(url: string, info: ArduinoPartInfo) {
        super(url + '/' + info.id, info);
    }
}

interface TemperatureInfo {
    datePublished: Date;
    value: number;
    unitOfMeasure: string;
}

interface OpenAPIOptions {
    host: string;    
}

// Factory class for creating APIs object
class OpenAPIManager {

    public options: OpenAPIOptions;
    public sensors: SensorsManager;
    public actuators: ActuatorsManager;

    constructor(options?:OpenAPIOptions) {
        // default options
        this.options = {
            host: ''
        }
        if (options && options.host) {
            this.options.host = options.host;
        } 
        this.sensors = new SensorsManager(this.options.host);
        this.actuators = new ActuatorsManager(this.options.host);        
  
    }
}

class AJAXManager {
    private xhr = null;
    constructor(private url:string) {
        this.xhr = new XMLHttpRequest();
        
        if (!this.xhr) {
            logger.e('AJAX object is not supported.');
        }
    }

    public get(scb: Function, ecb: Function): void {

        if (!this.xhr) {
            var err = new Error('AJAX object is not supported.');
            ecb(err);
        }
        var self = this;

        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState === 4) {
                if (self.xhr.status === 200) {
                                        
                    scb(JSON.parse(self.xhr.responseText));
                } else {
                    var err = new Error('Unexpected response: ' + self.xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('GET REQUEST: ' + this.url);
        this.xhr.open('GET', this.url);
        this.xhr.send();

    }
    public put(content : Object, scb: Function, ecb: Function): void {

        if (!this.xhr) {
            var err = new Error('AJAX object is not supported.');
            ecb(err);
        }
        var self = this;
        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState === 4) {
                if (self.xhr.status === 202) {
                    scb(self.xhr);
                } else {
                    var err = new Error('Unexpected response: ' + self.xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('PUT REQUEST: ' + this.url);
        this.xhr.open('PUT', this.url);
        this.xhr.setRequestHeader('Content-Type', 'application/json');
        this.xhr.send(JSON.stringify(content));

    }
};
/*
// Open API discovery in nearby devices class 
class OpenAPIFinder {

    private classA: number = 0;
    private classB: number = 0;
    private classC: number = 0;
    private portNumber: number = 3000;

    private nearbySensors: Array<ArduinoPart> = [];


    private checkAddress(ip):string {
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
    }  

    public findSensors(address:string, scb:Function, ecb?:Function): void {

        switch (this.checkAddress(address)) {
            case 'range' :
                var prefix: string = 'http://' + this.classA + '.' + this.classB + '.' + this.classC + '.';
                var postfix: string =  ':' + this.portNumber;    
                
                // XXX:below code doesn't work properly. 
                //retrieveAsync(prefix, postfix, this.nearbySensors, function (list) {
                //    if (list.length > 0) {                
                //        scb(list);
                //    } else {
                //        ecb(new Error('No devices found!'));
                //    }          
                //});
                
                 //XXX:below code works but it takes too long time :(  
                logger.i('start to retrieve sensors...');
                retrieveSync(prefix, 2, postfix, this.nearbySensors, function(list) {
                    if (list.length > 0) {                
                        scb(list);
                    } else {
                        ecb(new Error('No devices found!'));
                    }        
         
                });      
                break;

            case 'single' : 
                var candidate = new OpenAPIManager({ host: 'http://' + address + ':' + this.portNumber });
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

        
    }
}
var findLimit = 10;
function retrieveSync(prefix:string, i: number, postfix:string, list: Array<ArduinoPart>, cb: Function) {
    var candidate = new OpenAPIManager({ host: prefix + i + postfix });
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
function retrieveAsync(prefix:string, postfix:string, list: Array<ArduinoPart>, cb: Function) {
    for (var i = 2; i <= findLimit; i++) {
        var retrieveOne = function (i) {
            var candidate = new OpenAPIManager({ host: prefix + i + postfix });
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
        }

        retrieveOne(i); 
    }

}
*/
// exposes API if the script executes on server side.
if (typeof module !== 'undefined') {
    exports.myapi = new OpenAPIManager();
    exports.logger = logger;
    //exports.finder = new OpenAPIFinder();
}