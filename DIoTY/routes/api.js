var express = require('express');
var router = express.Router();

var sensorsObj = {
    "sensors": [{
        "type": "thermometer",
        "id": "thermometer1",
        "switch": "off"
    }]
};

/* GET api listing. */
router.get('/', function (req, res) {
    var apiObj = {
        "api": [{
            "id": "/api/sensors",
            "type": "ItemList"
        }]
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(apiObj));
});

/* GET api/sensors listing. */
router.get('/sensors', function (req, res) {
    
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(sensorsObj));
});

function findSensor(id) {
    var sensorObj = null;
    var sensorList = sensorsObj.sensors;
    for (var i = 0; i < sensorList.length; i++) {
        if (sensorList[i].id == id) {
            sensorObj = sensorList[i];
            return sensorObj;
        }
    }
    return null;
}

/* GET api/sensors/:id */
router.get('/sensors/:id', function (req, res) {
    try {
        var id = req.params.id;
        // search the sensor in the sensors
        var sensorObj = findSensor(id);
        Con
        if (sensorObj == null) {
            throw new Error('404');
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(sensorObj));
    } catch (err) {
        // return error code here
        res.sendStatus(err.message);
    }    
});

// Get data base manipulation module.
var model = require('../model');

/* PUT api/sensors/:id  */
router.put('/sensors/:id', function (req, res) {
    try {
        // search the sensor in the sensors
        var id = req.params.id;
        var sensorObj = findSensor(id);

        if (sensorObj == null) {
            throw new Error('404');
        }

        if (!req.is('application/json')) {
            throw new Error('406');
        }

        var sensorModified = req.body;
        if (!sensorModified.switch == null) {
            // throw 406 Not Acceptable
            throw new Error('406');
        }
        sensorObj.switch = sensorModified.switch;
        
        if (sensorObj.switch == 'on') {
          
           model.serialToDb(true);
        } else {
            model.serialToDb(false);
        }
        res.sendStatus(202);
    } catch (err) {
        res.sendStatus(err.message);
    }    
});

/* GET api/sensors/:id/temperatures */
router.get('/sensors/:id/temperatures', function (req, res) {
    try {
        var id = req.params.id;
        var queries = req.query;  // TODO:handle extra queries 
        // search the sensor in the sensors
        var sensorObj = findSensor(id);

        if (sensorObj == null) {
            throw new Error('404');
        }
        var tempList = model.getTemperatureList(function (tempList) {           
            var temps = {
                temperatures: tempList
            };
            
            res.writeHead(200, { "Content-Type": "application/json" });
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
        var sensorObj = findSensor(id);

        if (sensorObj == null) {
            throw new Error('404');
        }
        var tempList = model.getLatestTemperature(function (temp) {
            var tempObj = {
                temperature: temp
            };

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(tempObj));
        });

    } catch (err) {
        // return error code here
        res.sendStatus(err.message);
    }
});

module.exports = router;