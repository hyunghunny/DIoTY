var dbmgr = require('./data/dbmanager.js'),
    arduino = require('./arduino-serial.js');
    config = require('./config.js');

var port = config.serial.port;
var baud = config.serial.baud;
var sensorType = config.sensor.type;

var dbType = config.db.type;
var tableName = config.db.tableName;

var dbManager = dbmgr.construct(dbType, tableName, sensorType);


exports.record = function () {
    var asr = arduino.construct(port, baud);

    asr.listen(function (timestamp, data) {
        
        var dataArr = data.split(':');

        var temperature = 0;
        var humidity = 0;
        
        if (dataArr.length == 2) {
            temperature = parseFloat(dataArr[0]);
            humidity = parseFloat(dataArr[1]);
            // handle NaN as invalid serial input
            if (temperature == NaN || humidity == NaN) {
                console.log('invalid serial input: ' + data);
                return;
            }
        } else {
            console.log('invalid serial input: ' + data);
            return;
        }
        
        var observation = {
            'temperature': temperature,
            'humidity' : humidity
        }
        dbManager.save(timestamp, observation);
    });

}
