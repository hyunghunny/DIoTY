var serialPort = require('serialport');
var SerialPort = serialPort.SerialPort;

var sp = new SerialPort('COM8', {
  baudrate: 9600,
  parser: serialPort.parsers.readline('\n')
});

sp.on('open', function () {
  console.log('serial opened.');
  sp.on('data', function (data) {
    try {
	  data = new String(data);
	  data = data.trim();

      console.log(data + ' lux');
				
	} catch (e) {
		console.error('ERROR: ' + e.name);
	}
  });
});