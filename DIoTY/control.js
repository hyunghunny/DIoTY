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
        if (sensorType == 'thermo-hygrometer') {
            var dataArr = data.split(':');
            
            if (dataArr.length == 2) {
                var temperature = parseFloat(dataArr[0]);
                var humidity = parseFloat(dataArr[1]);
                
                // handle NaN as invalid serial input
                if (isNaN(temperature) || isNaN(humidity)) {
                    console.log('invalid serial input: ' + data);
                } else {
                    var observation = {
                        'temperature': temperature,
                        'humidity' : humidity
                    }
                    dbManager.save(timestamp, observation);
                }
            } else {
                console.log('invalid serial input: ' + data);
            }
        } else {
            var value = new String(data).trim();
            dbManager.save(timestamp, value);
        }
    });

}
