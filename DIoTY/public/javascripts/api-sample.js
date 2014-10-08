if (typeof module !== 'undefined') {
    // script on server side
    openapi = require('./api.ts.js').openapi;
    logger = require('./api.ts.js').logger;    
} else {
    // script on client side
    openapi = new OpenAPIManager();
}

 // Sample code for how to retrieve temperatures with a thermometer
openapi.sensors.retrieve(function (sensors) {
    logger.i('sensors are successfully retrieved.');

    // returns the list
    for (var i = 0; i < sensors.length; i++) {
        logger.i('number of sensors: ' + sensors.length);
        logger.i(sensors[i].id);
        if (sensors[i].type == 'thermometer') {
            sensors[i].getTempList(function (list) {
                logger.i(list.length + ' temperatures are retrieved properly.');
            });
            sensors[i].getLatestTemp(function (temp) {
                logger.i('latest temperature is ' + temp.value + ' ' + temp.unitOfMeasure);
            }); 
        }
    }   
}, function (err) {
    logger.e('Unable to retrieve sensors due to ' + err);
})   

