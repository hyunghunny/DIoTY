var Config = {
	// XXX:Set appropriate mongodb information below
    mongodb: {
        host: 'localhost',
        port: 27017,
        dbName: 'dioty',
        collectionName: 'temperatures'
    },

    // XXX:select attached arduino type.
    arduino: {
        default: null,

        // XXX:Set appropriate arduino circuit properties below
        nano: {
            uri: './arduino/nano',
            port: 'COM6',   // only works in windows with patched duino module.
            dht11 : {
                throttle: 5000,
                pin: 'A2'       // it means that pin is connected to the sensor
            },
            led: {
                pin: '13'
            },
            colorLed : {
                redPin: 9,
                bluePin: 10,
                greenPin: 11
            }
        },

        red: {
            uri: './arduino/red',
            port: 'COM7',
            thermistor: {
                pin: '00'
            },        
            led: {
                pin: '13'
            }        
        }
	},
	server: {
		port: 3000
	}
};

//XXX:Select default arduino
Config.arduino.default = Config.arduino.nano;

module.exports = Config;