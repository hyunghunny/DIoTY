var config = {
    'serial' : {
        'port': '/dev/ttyUSB0',
        'baud': 9600
    },
    'sensor' : {
        'supported' : ['ibeacon_scanner' ,'lux_meter', 'thermo-hygrometer', 'distance_meter', 'people_counter'],
        'type': 'distance_meter',
        'id' : '19',
    },
    'db' : {
        'type' : 'sqlite',
        'tableName': 'ADS01'
    },
    'export' : {
        'href' : './export/sensorchart.js',
        'mode' : 'on',
        'id' : 'webofthink',
        'password' : '' 
    }
};

module.exports = config;