var config = require('./config');
var arduino = require('duino');

var board = null;
var dht11 = null;
var myLed = null;
var colorLed = null;

function ColorLed(options) {
    this.board = options.board;
    this.redPin = options.redPin;
    this.greenPin = options.greenPin;
    this.bluePin = options.bluePin;

    this.redValue = 0;
    this.greenValue = 164;
    this.blueValue = 91;

    this.timerId = null;    
}

ColorLed.prototype.setColor = function (mode) {
    switch (mode) {
        case 'red' :
            this.redValue = 127;
            this.greenValue = 0;
            this.blueValue = 0;          
            break;
        case 'blue' :
            this.redValue = 0;
            this.greenValue = 0;
            this.blueValue = 127;            
            break;
        case 'green' :
            this.redValue = 0;
            this.greenValue = 127;
            this.blueValue = 0;          
            break;
        default: // white
            this.redValue = 0;
            this.greenValue = 164;
            this.blueValue = 91;     
            break;
    }
}

ColorLed.prototype.on = function (board, mode) {
    this.setColor(mode);
    console.log('turn on the color LED');
    if (this.timerId != null) {
        clearInterval(this.timerId);
    }
    var self = this;         
    self.timerId = setInterval(function () {
        self.board.analogWrite(self.redPin, self.redValue);
        self.board.analogWrite(self.greenPin, self.greenValue);
        self.board.analogWrite(self.bluePin, self.blueValue);     
    }, 2000);       
}

ColorLed.prototype.off = function (board, mode) {
    this.setColor(mode);
    console.log('turn off the color LED');
    if (this.timerId != null) {
        clearInterval(this.timer);
    }
    var self = this;        
    self.timer = setInterval(function () {
        self.board.analogWrite(self.redPin, 0);
        self.board.analogWrite(self.greenPin, 0);
        self.board.analogWrite(self.bluePin, 0);     
    }, 2000);       
}    


var connected = false;
exports.connect = function (scb, ecb) {
    // prevent re-connecting 
    if (connected === false) {
        board = new arduino.Board({
            device: config.arduino.nano.port,
            debug: false //true
        });
        
        dht11 = new arduino.DHT11({
            board: board,
            pin: config.arduino.nano.dht11.pin,
            throttle: 2000
        });
        
        myLed = new arduino.Led({
            board: board,
            pin: config.arduino.nano.led.pin
        });
        
        colorLed = new ColorLed({
            board: board,
            redPin: config.arduino.nano.colorLed.redPin,
            greenPin: config.arduino.nano.colorLed.greenPin,
            bluePin: config.arduino.nano.colorLed.bluePin
        });

        board.on('error', function (err) {
            console.log("arduino is not installed properly: " + err);
            ecb(err);
        });
        
        board.on('ready', function () {
            console.log("arduino board is ready to serve.");  
            connected = true;
            scb();
        });
    } else {
        scb();
    }

}

exports.addSensorListener = function (cb) {
	var listenerId = 'sensorListener';

	dht11.on('read', function (err, temp, humidity) {
	    //console.log("temperature: " + temp + " degree of Celcius, " + "humidity: " + humidity + "%");
        colorLed.on();

	    if (humidity < 40) {
	    	colorLed.setColor('red');
	    } else if (humidity <= 50) {
	    	colorLed.setColor('green');
	    } else if (humidity > 50) {
	    	colorLed.setColor('blue');
	    }
	    cb(temp, humidity);
	});

	return listenerId;
}

exports.removeListener = function (id) {
	if (id === 'sensorListener') {
        dht11.on('read', function (err, temp, humidity) { });
        id = null;
	}
}

exports.setLedMode = function (mode) {

    switch (mode) {
        case 'on':
            myLed.stop();
            myLed.on();
            console.log('LED is on.');
            break;
        case 'off':
            myLed.stop();
            myLed.off();            
            console.log('LED is off');
            break;
        case 'blink':
            myLed.stop();
            console.log('LED is blinking');
            myLed.blink();
            break;
        case 'fade':
            myLed.stop();
            console.log('LED is fading');
            myLed.fade();
            break;
        default:
            console.log('invalid mode - Set LED off');
            myLed.stop();
            myLed.off();
            break;
    }
}