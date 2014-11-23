var express = require('express');
var router = express.Router();

/* GET /app/thermometer page. */
router.get('/', function(req, res) {
  res.render('thermometer', { title: 'My Thermometer' });
});

module.exports = router;
