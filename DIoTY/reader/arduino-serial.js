var serialPort = require('serialport');

function ArduinoSerialReader(port, baudrate) {
    this.port = port;
    this.baudrate = baudrate;
}

ArduinoSerialReader.prototype.onUpdated = function (callback) {

    var sp = new serialPort.SerialPort(this.port, {
        'baudrate': this.baud,
        'parser': serialPort.parsers.readline('\n')
    });
    
    sp.on('open', function () {
        console.log('serial port opened successfully.');
        
        sp.on('data', function (data) {
            var now = new Date();
            var timestamp = now.getTime();
            callback(timestamp, data);
        });
    });
}


module.exports = function (config) {
    var port = config.serial.port;
    var baud = config.serial.baud;
    return new ArduinoSerialReader(port, baudrate);
}