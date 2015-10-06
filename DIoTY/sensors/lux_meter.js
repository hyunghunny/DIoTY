// This sensor measures an ambient illuminance.
// An observation consists with the timestamp and the value (measured by lux)

var dbmgr = require('./database/dbmanager.js');

// observation creation function
function Observation(timestamp, val) {
    this.datePublished = timestamp;
    this.value = val;
    this.unit = 'lux';
}
