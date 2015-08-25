var config ={
    'serial' : {
        'port': 'COM11',
        'baud': 9600
    },
    'sensor' : {
        'type': 'thermo-hygrometer'
    },
    'db' : {
        'type' : 'sqlite',
        'tableName': 'ADS01'
    }
};

module.exports = config;