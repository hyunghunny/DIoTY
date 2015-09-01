var config ={
    'serial' : {
        'port': '/dev/ttyUSB0',
        'baud': 9600
    },
    'sensor' : {
        'supported' : ['lux_meter', 'thermo-hygrometer', 'distance'],
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