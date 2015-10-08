var config = {
    'serial' : {
        'port': '/dev/ttyUSB0',
        'baud': 9600
    },
    'gpio' : {
    },
    'sensor' : {
        'supported' : ['ibeacon_scanner' ,'lux_meter', 'thermo-hygrometer', 'distance_meter', 'people_counter'],
        'type': 'thermo-hygrometer',
    },
    'database' : {
        'type' : 'sqlite'
    },
    'export' : {
        'mode' : 'off',
        'interval' : 60000, // 1 minutes
    }
};

module.exports = config;