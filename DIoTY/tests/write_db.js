var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ‘{password here}',
    database: 'temps'
}); 
connection.connect(); 
connection.query('insert into tempData(tempDate, tempCelsius) values(?, ?)', [new Date(), 10.01], 
	function(err, rows, cols) {
		if (err) throw err;			
		console.log(rows);
});
connection.end();
