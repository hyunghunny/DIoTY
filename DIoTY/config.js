var config = {
    'serial' : {
        'port': '/dev/ttyUSB0',
        'baud': 9600
    },
    'sensor' : {
        'supported' : ['ibeacon' ,'lux_meter', 'thermo-hygrometer', 'distance', 'people_counter'],
        'type': 'distance',
        'id' : '19',
    },
    'db' : {
        'type' : 'sqlite',
        'tableName': 'ADS01'
    },
    'export' : {
        'href' : './sensorchart.js',
        'mode' : 'on',
        'id' : 'webofthink',
        'password' : '' 
    }
};

module.exports = config;