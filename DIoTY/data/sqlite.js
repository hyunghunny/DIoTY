var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();


function Sqlite(type) {
    this.type = type;
    this.dbfile = './data/' + type + '.db';
    this.table = '';
    this.database = null;
}

/**
 * check whether database is existed
 *
 * @return true when it is existed or false.
 */
Sqlite.prototype.hasDB = function () {

    var exists = fs.existsSync(this.dbfile);
    return exists;
}

Sqlite.prototype.createFile = function () {

    console.log("Creating DB file.");
    fs.openSync(this.dbfile, "w");
    console.log("Done.");
    this.database = new sqlite3.Database(this.dbfile);
}

Sqlite.prototype.openFile = function () {

    console.log("Getting DB file.");
    this.database = new sqlite3.Database(this.dbfile);
}

Sqlite.prototype.createTable = function (defaultTableName) {
    var query = "CREATE TABLE IF NOT EXISTS " + defaultTableName +
    " (timestamp DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL,value INTEGER NOT NULL)";
    this.database.run(query);
    this.table = defaultTableName;
    console.log(defaultTableName + ' created');
}

Sqlite.prototype.insert = function (timestamp, value) {
    var self = this;
    this.database.serialize(function () {
        var query = "INSERT INTO " + self.table + "(timestamp,value) VALUES (?,?)";
        var stmt = self.database.prepare(query);
        stmt.run(timestamp, value, function () {
            console.log(timestamp + ", " + value);
        });
        stmt.finalize();
    });
}

Sqlite.prototype.getTables = function (cb) {
    database.all("SELECT name FROM sqlite_master WHERE type = 'table'",
        function (err, rows) {
        if (err) {
            cb([]);
        } else {
            cb(rows);
        }
    });
}

Sqlite.prototype.getTableName = function () {
    if (this.table == '')
        console.log('ERROR:Table is not loaded yet');
    else {
        //console.log('Table ' + table + ' loaded');
        return this.table;
    }
}

Sqlite.prototype.setTableName = function (tableName) {
    if (typeof tableName === 'string') {
        this.table = tableName;
    } else {
        console.log('invalid table name');
    }        
}

Sqlite.prototype.getDBType = function () {
    return this.type;
}

Sqlite.prototype.find = function (callback, condition) {
    this.database.serialize(function () {
        //condition은 사용자에게 입력받은 조건(where절)
        if (typeof condition === 'string') {
            var stmt = "SELECT * from " + table + " where " + condition;
        }
        else {
            var stmt = "SELECT * from " + table;
        }
        database.all(stmt, function (err, rows) {
            if (err) throw err;
            if (rows.length != 0) {
                callback(rows);//rows는 array
            }
            else {
                console.log("Data dose not exists");
            }
        });
    })
}

Sqlite.prototype.closeDB = function () {
    database.close();
}



exports.construct = function (type) {
    return new Sqlite(type);
}
