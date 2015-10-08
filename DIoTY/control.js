var dbmgr = require('./database/dbmanager.js');

var config = require('./config.js');


var sensorReader = require('./controller/arduino-serial.js');

var sensorType = config.sensor.type;
var sensorMgr = require('./sensors/' + sensroType + '.js')();

var sensorchart = require('./export/sensorchart.js');

var transmitter = null;

exports.run = function () {
    var reader = sensorReader(config);

    reader.onUpdated(function (timestamp, data) {
        sensorMgr.observe(timestamp, data);        
    });

    if (config.export.mode == 'on') {
        sensorchart.login('webofthink', '********', function (obj) {
            transmitter = obj;
            setInterval(function () {
                sensorMgr.export(transmitter);
            }, config.export.interval);
        });
    }

}

