var config ={
    'serial' : {
        'port': 'COM8',
        'baud': 9600
    },
    'sensor' : {
        'type': 'lux_meter'
    },
    'db' : {
        'type' : 'sqlite',
        'tableName': 'ADS01'
    }
};

module.exports = config;