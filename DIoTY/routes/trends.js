var express = require('express');
var router = express.Router();

/* GET /trends page. */
router.get('/', function (req, res) {
	var dateString;
	if (req.query.date == null) {
		var today = new Date();
		dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	} else {
		dateString = req.query.date;
	}
	
    res.render('trends', { title: 'Temperature Trends',
    	date: dateString });
});

/* GET /trends/:date page. */
router.get('/:date', function (req, res) {
	var dateString = req.params.date;

	res.redirect('/trends?date=' + dateString);
});
	
module.exports = router;