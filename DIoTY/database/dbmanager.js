
function DBManager(dbType, sensorType) {
    
    this.database = require('./' + dbType + '.js')(sensorType);
    
    if (!this.database.hasDB()) {
        this.database.createDB(); // data base file creation
    } else {
        this.database.openDB();
    }
}

DBManager.prototype.setup = function (dbTables) {
    for (var tableName in dbTables) {
        if (dbTables.hasOwnProperty(tableName)) {
            var dbTable = dbTables[tableName];
            var query = '(';
            for (var attribute in dbTable) {
                if (dbTable.hasOwnProperty(attribute)) {
                    console.log(tableName + ":" + attribute + ":" + dbTable[attribute]);
                    // create table query
                    query = query + (attribute + ' ' + dbTable[attribute] + ',');
                }                
            }
            // replace the end colon ',' to closed parenthese ')'
            query = query.substring(0, query.length - 1) + ')';
            
            // create DB table
            console.log(query);
            
            this.database.createTable(tableName, query);

        }

    }
}

DBManager.prototype.save = function (table, timestamp, val) {
    
    this.database.insert(table, timestamp, val);
}


DBManager.prototype.find = function (table, condition, cb) {
    
    this.database.inquire(table, function (rows) {
        cb(rows);
    }, query);
}

DBManager.prototype.close = function () {
    this.database.closeDB();
    console.log('database closed');
}

module.exports = function (dbType, sensorType) {
    return new DBManager(dbType, sensorType);
}