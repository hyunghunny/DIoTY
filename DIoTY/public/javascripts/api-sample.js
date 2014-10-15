if (typeof module !== 'undefined') {
    // script on server side
    myapi = require('./api.ts.js').myapi;
    logger = require('./api.ts.js').logger;
    finder = require('./api.ts.js').finder;    
} else {
    // script on client side
    myapi = new OpenAPIManager();
}

 // Sample code for how to retrieve temperatures with a thermometer
myapi.sensors.retrieve(function (sensors) {
    console.log('sensors are successfully retrieved.');

    // returns the list
    for (var i = 0; i < sensors.length; i++) {
        console.log('number of sensors: ' + sensors.length);
        console.log(sensors[i].id);
        var sensor = sensors[i];
        sensor.turnOn(function() {
            logger.i(JSON.stringify(sensor));
            if (sensor.type == 'thermometer') {
                sensor.getTempList(function (list) {
                    console.log(list.length + ' temperatures are retrieved properly.');
                });
                sensor.getLatestTemp(function (temp) {
                    console.log('latest temperature is ' + temp.value + ' ' + temp.unitOfMeasure);
                }); 
            }
        });
    }   
}, function (err) {
    console.log('Unable to retrieve sensors due to ' + err);
})   

