var express = require('express');
var router = express.Router();

// Get controller module.
var controller = require('../control');

/* GET api listing. */
router.get('/', function (req, res) {
    if (req.headers['content-type'] == 'application/json') {
        res.writeHead(200, controller.api.getContentHeader());
        res.end(controller.api.getBillboard());
    } else {
        res.redirect('/api.html');
    }

});

/* GET api/sensors listing. */
router.get('/sensors', function (req, res) {
    
    res.writeHead(200, controller.api.getContentHeader());
    res.end(JSON.stringify(controller.sensors));
});

/* GET api/sensors/:id */
router.get('/sensors/:id', function (req, res) {
    try {
        var id = req.params.id;
        // search the sensor in the sensors
        var sensorObj = controller.sensors.find(id);
        
        if (sensorObj == null) {
            throw new Error('404');
        }
        res.writeHead(200, controller.api.getContentHeader());
        res.end(JSON.stringify(sensorObj));
    } catch (err) {
        // return error code here
        res.sendStatus(err.message);
    }    
});

/* PUT api/sensors/:id  */
router.put('/sensors/:id', function (req, res) {
    try {
        // search the sensor in the sensors
        var id = req.params.id;
        var sensorObj = controller.sensors.find(id);

        if (sensorObj == null) {
            throw new Error('404');
        }

        if (req.headers['content-type'] != 'application/json') {
            throw new Error('406');
        }

        var sensorModified = req.body;

        if (!sensorModified.switch == null) {
            // throw 406 Not Acceptable
            throw new Error('406');
        }

        sensorObj.setMode(sensorModified.switch, function (result) {
            
            if (result == false) {
                sensorObj.switch = 'off';                
                res.sendStatus(500);
            } else {
                sensorObj.switch = sensorModified.switch;
                res.sendStatus(202);
            }
        });
        
    } catch (err) {
        console.log(err.message);
        res.sendStatus(err.message);
    }    
});

/* GET api/sensors/:id/temperatures */
router.get('/sensors/:id/temperatures', function (req, res) {
    try {
        var id = req.params.id;
        var queries = req.query;  // TODO:handle extra queries 
        // search the sensor in the sensors
        var sensorObj = controller.sensors.find(id);

        if (sensorObj == null) {
            throw new Error('404');
        }
        var tempList = sensorObj.getTemperatureList(function (tempList) {           
            var temps = {
                temperatures: tempList
            };
            
            res.writeHead(200, controller.api.getContentHeader());
            res.end(JSON.stringify(temps));
        },queries);

    } catch (err) {
        // return error code here
        res.sendStatus(err.message);
    }
});

/* GET api/sensors/:id/temperatures/latest */
router.get('/sensors/:id/temperatures/latest', function (req, res) {
    try {
        var id = req.params.id;
        
        // search the sensor in the sensors
        var sensorObj = controller.sensors.find(id);

        if (sensorObj == null) {
            throw new Error('404');
        }
        var tempList = sensorObj.getLatestTemperature(function (temp) {
            var tempObj = {
                temperature: temp
            };

            res.writeHead(200, controller.api.getContentHeader());
            res.end(JSON.stringify(tempObj));
        });

    } catch (err) {
        // return error code here
        res.sendStatus(err.message);
    }
});

/* GET api/actuators listing. */
router.get('/actuators', function (req, res) {
    
    res.writeHead(200, controller.api.getContentHeader());
    res.end(JSON.stringify(controller.actuators));
});

/* GET api/actuators/:id */
router.get('/actuators/:id', function (req, res) {
    try {
        var id = req.params.id;
        // search the sensor in the sensors
        var actuatorObj = controller.actuators.find(id);
        
        if (actuatorObj == null) {
            throw new Error('404');
        }
        res.writeHead(200, controller.api.getContentHeader());
        res.end(JSON.stringify(actuatorObj));
    } catch (err) {
        // return error code here
        res.sendStatus(err.message);
    }
});

/* PUT api/actuators/:id  */
router.put('/actuators/:id', function (req, res) {
    try {
        // search the sensor in the sensors
        var id = req.params.id;
        var actuatorObj = controller.actuators.find(id);
        
        if (actuatorObj == null) {
            throw new Error('404');
        }
        
        if (req.headers['content-type'] != 'application/json') {
            throw new Error('406');
        }
        
        var actuatorModified = req.body;
        
        if (!actuatorModified.switch == null) {
            // throw 406 Not Acceptable
            throw new Error('406');
        }
        
        actuatorObj.setMode(actuatorModified.switch, function (result) {
            if (result) {
                actuatorObj.switch = actuatorModified.switch;
                res.sendStatus(202);
            } else {
                actuatorObj.switch = 'off';
                res.sendStatus(500);
            }
        });
        
    } catch (err) {
        console.log(err.message);
        res.sendStatus(err.message);
    }
});

module.exports = router;