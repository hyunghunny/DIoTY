// This sensor measures how many people are passing by through it.
// An observation consists with the timestamp and the value (1 denotes that somebody entered, -1 denote that someone exited).

var dbmgr = require('../database/dbmanager.js');

// observation creation function
function Observation(timestamp, val) {
    this.datePublished = timestamp;
    this.value = val;
    this.comment = '1 denotes in, -1 denotes out.'
}
