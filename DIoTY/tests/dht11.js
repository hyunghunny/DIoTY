/* following is a test code for DHT11 sensor. */
var arduino = require('duino');
          
console.log("Initializing arduino board...");
var board = new arduino.Board({
    device: 'COM6',
    debug: false //true
});

var dht11 = new arduino.DHT11({
    board: board,
    pin: 'A2',
    throttle: 2000
});

var led = new arduino.Led({
	board: board,
	pin: 13  // built-in LED on board
});

var redPin = 9;
var bluePin = 10;
var greenPin = 11;


var redValue = 0;
var greenValue = 164;
var blueValue = 91;

board.on('ready', function () {
    console.log("arduino board is ready to serve.");

    led.blink();

    colorLedOn('white');
});


dht11.on('read', function (err, temp, humidity) {
    console.log("temperature: " + temp + " degree of Celcius, " + "humidity: " + humidity + "%");

    if (humidity < 40) {
    	setLedColor('red');
    } else if (humidity <= 50) {
    	setLedColor('green');
    } else if (humidity > 50) {
    	setLedColor('blue');
    }
});


function setLedColor(mode) {

	switch (mode) {
		case 'red' :
			redValue = 255;
			greenValue = 0;
			blueValue = 0;			
			break;
		case 'blue' :
			redValue = 0;
			greenValue = 0;
			blueValue = 255;			
			break;
		case 'green' :
			redValue = 0;
			greenValue = 255;
			blueValue = 0;			
			break;
		default: // white
			redValue = 0;
			greenValue = 164;
			blueValue = 91;		
			break;
	}
}

function colorLedOn(mode) {
	setLedColor(mode);
	console.log('turn on the color LED');
	setInterval(function () {
	    board.analogWrite(redPin, redValue);
	    board.analogWrite(greenPin, greenValue);
	    board.analogWrite(bluePin, blueValue);		
	}, 2000);		
};
