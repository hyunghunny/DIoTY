var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'q1w2e3',  // set the appropriate password for your MySQL
    database: 'temps'
}); 
connection.connect(); 
connection.query('insert into tempData(tempDate, tempCelsius) values(?, ?)', [new Date(), 10.01], 
	function(err, rows, cols) {
		if (err) throw err;			
		console.log(rows);
});
connection.end();
