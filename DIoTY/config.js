var config ={
    'serial' : {
        'port': 'COM11', // '/dev/ttyUSB0',
        'baud': 9600
    },
    'sensor' : {
        'type': 'thermo-hygrometer',
        'id' : 'DHT22-0010',
    },
    'db' : {
        'type' : 'sqlite',
        'tableName': 'ADS01'
    }
};

module.exports = config;