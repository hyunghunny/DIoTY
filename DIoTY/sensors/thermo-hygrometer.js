// This sensor measures an ambient temperature and an humidity.
// An observation consists with the timestamp, a temperature value (measured by censius) and a humidity value (%)
var config = require('../config.js');
var dbmgr = require('../database/dbmanager.js')('sqlite', 'thermo-hygrometer');
var broadcaster = require('../export/broadcast.js');

var dbTables = {
    "temperatures" : {
        "timestamp" : "DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL",
        "temperature" : "INTEGER NOT NULL"
    },
    "humidties" : {
        "timestamp" : "DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL",
        "humidity" : "INTEGER NOT NULL"
    }
}


// observation creation function
function Observation(timestamp, temp, hum) {
    this.datePublished = timestamp;
    this.temperature = temp;
    this.humidity = hum;
    this.comment = 'celsius for temperature, % for humidity'
}

Observation.prototype.record = function () {
    // record observation into database
    dbmgr.save("temperatures", this.datePublished, this.temperature);
    dbmgr.save("humidties", this.datePublished, this.humidity);

}

Observation.prototype.broadcast = function () {
    // broadcast observation via web socket
    if (broadcaster.isConnected()) {
        broadcaster.emit('temperature', this.temperature);
        broadcaster.emit('humidity', this.humidity);
    }
}

var observations = [];

exports.retrieve = function (type, dateFrom, dateTo, cb, offset, limit, skip) {
    
    var condition = ''; // TODO: create where clause to find approrpiate data
    dbmgr.find(type, condition, function (rows) {
        var temperatures = rows;
        // TODO: create return obj
        var returnObj = [];
        cb(returnObj);
    })
}

exports.export = function (transmitter) {
    // export observation to sensor chart
    var tempSensorId = 0;
    var humiditySensorId = 0;
    var tempObs = [];
    var humObs = [];
    
    for (var i = 0; i < observations.length; i++) {
        var obs = observations[i];
        tempObs.push({
            "datePublished" : obs.timestamp,
            "value" : obs.temperature 
        });
        humObs.push({
            "datePublished" : obs.timestamp,
            "value" : obs.humidity
        });
    }

    if (transmitter) {
        transmitter.emit(tempSensorId, 
            tempObs, 
            function (result) {
                if (result == false) {
                    console.log('failed to transmit temperatures observation.');
                }
        });
        transmitter.emit(humiditySensorId, 
            humObs, 
            function (result) {
            if (result == false) {
                console.log('failed to transmit humidity observation.');
            }
        });
        // reset observations
        observations = [];
    }
}

exports.observe = function (timestamp, data)   {
    var dataArr = data.split(':');
    var temp = null;
    var hum = null;
    var obs = null;
    if (dataArr.length == 2) {
        temp = parseFloat(dataArr[0]);
        hum = parseFloat(dataArr[1]);
        
        obs = new Observation(timestamp, temp, hum);
        
        obs.record();        
        obs.broadcast();

        observations.push(obs);

    } else {
        var time = new Date(timestamp);
        console.warn('[' + time + '] ' + 'invalid data input: ' + data); 
    }
}

module.exports = function () {
    
    dbmgr.setup(dbTables);

}
