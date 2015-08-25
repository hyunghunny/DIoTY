var express = require('express');
var router = express.Router();
var config = require('../config.js');
var sensorsObj = {
    "sensors": [{
        "type": config.sensor.type,
        "id": config.sensor.id
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
var controller = require('../control');

module.exports = router;