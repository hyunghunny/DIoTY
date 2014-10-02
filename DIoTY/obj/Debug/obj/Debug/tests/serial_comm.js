var serialPort = require('serialport');
var SerialPort = serialPort.SerialPort;

var sp = new SerialPort('COM7', {
  baudrate: 19200,
  parser: serialPort.parsers.readline('\n')
});

sp.on('open', function () {
  console.log('serial opened.');
  sp.on('data', function (data) {
    try {
	  data = new String(data);
	  data = data.trim();

      console.log(data + ' degree');
				
	} catch (e) {
		console.error('ERROR: ' + e.name);
	}
  });
});