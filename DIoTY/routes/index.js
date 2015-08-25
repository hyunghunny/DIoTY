var express = require('express');
var router = express.Router();

var config = require('../config.js');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index',{ 'title': 'Do IoT Yourself! ',
      'sensor': config.sensor.type
});
});

module.exports = router;
