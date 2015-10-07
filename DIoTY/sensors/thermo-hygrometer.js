// This sensor measures an ambient temperature and an humidity.
// An observation consists with the timestamp, a temperature value (measured by censius) and a humidity value (%)

var dbmgr = require('./database/dbmanager.js');

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
    //TODO:record observation into database
}

Observation.prototype.broadcast = function () {
    //TODO:broadcast observation via web socket
}

Observation.prototype.export = function () {
    //TODO:export observation to sensor chart
}  

function setupDB() {
    //TODO:create database file and set table schema (for sqlite3)
}


module.exports = function (timestamp, data) {
    
    setupDB();

    var dataArr = data.split(':');
    var temp = null;
    var hum = null;

    if (dataArr.length == 2) {
        temp = parseFloat(dataArr[0]);
        hum = parseFloat(dataArr[1]);

        return new Observation(timestamp, temp, hum);
    } else {
        return null; // XXX:error case 
    }
}