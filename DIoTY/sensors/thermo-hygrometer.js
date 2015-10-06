// This sensor measures an ambient temperature and an humidity.
// An observation consists with the timestamp, a temperature value (measured by censius) and a humidity value (%)

var dbmgr = require('./database/dbmanager.js');

// observation creation function
function Observation(timestamp, temp, hum) {
    this.datePublished = timestamp;
    this.temperature = temp;
    this.humidity = hum;
    this.comment = 'celsius for temperature, % for humidity'
}

module.exports = function () {
    //TODO:do something here
}