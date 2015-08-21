var dbmgr = require('./data/dbmanager.js'),
    serialPort = require('serialport'),
    config = require('./config.js');

var port = config.serial.port;
var baud = config.serial.baud;
var sensorType = config.sensor.type;

var dbType = config.db.type;
var tableName = config.db.tableName;

var db = dbmgr.createDB(dbType, tableName, sensorType);


exports.record = function () {
    // XXX:Set appropriate serial port properties below
    var sp = new serialPort.SerialPort(port, {
        'baudrate': baud,
        'parser': serialPort.parsers.readline('\n')
    });
    console.log('trying to record...');
    sp.on('open', function () {
        console.log('serial opened successfully.');

        sp.on('data', function (data) {

            var value = new String(data).trim();
            var now = new Date();
            var timestamp = now.getTime();
            // TODO:save value with timestamp
            db.save(timestamp, value);
        });
    });
}
