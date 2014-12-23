var config = require('../config');
var arduino = require('duino');

var ColorLed = function (options) {
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

ColorLed.prototype.on = function () {
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

ColorLed.prototype.off = function () {
    //console.log('turn off the color LED');
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

var Hygrometer = function(options) {
    this.dht11 = new arduino.DHT11({
        board: options.board,
        pin: options.pin,
        throttle: options.throttle
    });
}

Hygrometer.prototype.addListener = function (cb) {
    var listenerId = 'sensorListener';
    
    this.dht11.on('read', function (err, temp, humidity) {
        // console.log("temperature: " + temp + " degree of Celcius, " + "humidity: " + humidity + "%");
        cb(temp, humidity);
    });
    
    return listenerId;
}

Hygrometer.prototype.removeListener = function (id) {
    if (id === 'sensorListener') {
        dht11.on('read', function (err, temp, humidity) { });
        id = null;
    }
}

var NanoBoard = function(options) {
    this.options = options;
    this.debug = false;
    this.connected = false;
    
    // available modules on arduino
    this.hygrometer = null;
    this.builtinLed = null;
    this.colorLed = null;
}

NanoBoard.prototype.connect = function (scb, ecb) {
    // prevent re-connecting 
    if (this.connected === false) {
        this.board = new arduino.Board({
            device: this.options.port,
            debug: this.debug
        });
        
        this.hygrometer = new Hygrometer({
            board: this.board,
            pin: this.options.dht11.pin,
            throttle: this.options.dht11.throttle
        });
        
        this.builtinLed = new arduino.Led({
            board: this.board,
            pin: this.options.led.pin
        });
        
        this.colorLed = new ColorLed({
            board: this.board,
            redPin: this.options.colorLed.redPin,
            greenPin: this.options.colorLed.greenPin,
            bluePin: this.options.colorLed.bluePin
        });
        
        this.board.on('error', function (err) {
            console.log("arduino is not installed properly: " + err);
            ecb(err);
        });
        
        this.board.on('ready', function () {
            console.log("arduino board is ready to serve.");
            this.connected = true;
            scb();
        });
    } else {
        scb();
    }

}

exports.board = new NanoBoard(config.arduino.nano);

