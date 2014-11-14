var Config = {
	// XXX:Set appropriate mongodb information below
    mongodb: {
        host: 'localhost',
        port: 27017,
        dbName: 'dioty',
        collectionName: 'temperatures'
    },
    // XXX:Set appropriate arduino circuit properties below
    arduino: {
        port: 'COM7',   // only works in windows with patched duino module.
        pin: '00'       // it means A0 pin is connected to thermistor
    },
	
	server: {
		port: 3000
	}
};

module.exports = Config;