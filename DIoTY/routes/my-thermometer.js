var express = require('express');
var router = express.Router();

/* GET /my-thermometer page. */
router.get('/', function(req, res) {
  res.render('my-thermometer', { title: 'My Thermometer' });
});

module.exports = router;
