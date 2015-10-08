// This sensor measures a distance between any object and this sensor.
// An observation consists with the timestamp and the value (measured by centimeters) 

var dbmgr = require('../database/dbmanager.js');

function Observation(timestamp, val) {
    this.datePublished = timestamp;
    this.value = val;
    this.unit = 'centimeters';
}
