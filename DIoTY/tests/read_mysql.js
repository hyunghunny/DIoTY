var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '{password here}',
    database: 'temps'
}); 
connection.connect(); 
connection.query('select * from tempData', 
	function(err, rows, cols){
    	if (err) throw err;
 
		console.log(rows);
 
});
connection.end();
