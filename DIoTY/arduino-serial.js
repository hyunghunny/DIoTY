var serialPort = require('serialport');


function ArduinoSerialReader(port, baudrate) {
    this.port = port;
    this.baudrate = baudrate;
}

ArduinoSerialReader.prototype.listen = function (callback) {
    // XXX:Set appropriate serial port properties below
    var sp = new serialPort.SerialPort(this.port, {
        'baudrate': this.baud,
        'parser': serialPort.parsers.readline('\n')
    });
    
    sp.on('open', function () {
        console.log('serial opened successfully.');
        
        sp.on('data', function (data) {
            var now = new Date();
            var timestamp = now.getTime();
            callback(timestamp, data);
        });
    });
}


exports.construct = function (port, baudrate) {
    return new ArduinoSerialReader(port, baudrate);
}